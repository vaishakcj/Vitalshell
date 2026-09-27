import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { HistoryTimeRange, SafetyLevel } from '../../types';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  timeLabel: string;
  riskState?: SafetyLevel;
}

interface HistoryInteractiveChartProps {
  id: string;
  title: string;
  unit: string;
  data: ChartDataPoint[];
  color: string; // e.g. '#10b981'
  gradientId: string;
  timeRange: HistoryTimeRange;
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
  formatValue?: (val: number) => string;
  height?: number;
}

export const HistoryInteractiveChart: React.FC<HistoryInteractiveChartProps> = ({
  id,
  title,
  unit,
  data,
  color,
  gradientId,
  timeRange,
  selectedIndex,
  onSelectIndex,
  formatValue = (v) => v.toString(),
  height = 76,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(280);
  const [isSelfHovered, setIsSelfHovered] = useState<boolean>(false);

  // ResizeObserver to adapt SVG width cleanly
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    if (el.clientWidth > 0) {
      setContainerWidth(el.clientWidth);
    }

    return () => observer.disconnect();
  }, []);

  const values = useMemo(() => data.map((d) => d.value), [data]);
  const minValue = useMemo(() => Math.min(...values), [values]);
  const maxValue = useMemo(() => Math.max(...values), [values]);
  const avgValue = useMemo(
    () => (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    [values]
  );
  const range = maxValue - minValue || 1;

  // Visual layout bounds
  const paddingX = 8;
  const paddingY = 8;
  const chartH = height;
  const chartW = Math.max(containerWidth, 100);

  // Compute 2D points for SVG curve
  const points = useMemo(() => {
    if (data.length < 2) return [];
    const drawableW = chartW - paddingX * 2;
    const drawableH = chartH - paddingY * 2;

    return data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * drawableW;
      const normalizedY = (d.value - minValue) / range;
      const y = chartH - paddingY - normalizedY * drawableH;
      return { x, y, ...d };
    });
  }, [data, chartW, chartH, minValue, range, paddingX, paddingY]);

  // Smooth bezier path generator
  const { pathD, fillPathD } = useMemo(() => {
    if (points.length < 2) return { pathD: '', fillPathD: '' };

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const fillD = `${d} L ${points[points.length - 1].x},${chartH} L ${points[0].x},${chartH} Z`;
    return { pathD: d, fillPathD: fillD };
  }, [points, chartH]);

  // Handle pointer / touch scrubbing
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current || data.length < 2) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const drawableW = rect.width - paddingX * 2;
      const clampedX = Math.max(0, Math.min(drawableW, relativeX - paddingX));
      const ratio = clampedX / (drawableW || 1);
      const index = Math.round(ratio * (data.length - 1));
      const safeIndex = Math.max(0, Math.min(data.length - 1, index));
      onSelectIndex(safeIndex);
    },
    [data.length, onSelectIndex, paddingX]
  );

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSelfHovered(true);
    handlePointerMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsSelfHovered(true);
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsSelfHovered(true);
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handlePointerLeave = () => {
    setIsSelfHovered(false);
    onSelectIndex(null);
  };

  // Determine active point to display
  const activeIdx = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < data.length
    ? selectedIndex
    : null;
  const isInspecting = activeIdx !== null;
  const currentPoint = data[data.length - 1];
  const displayedPoint = isInspecting ? data[activeIdx] : currentPoint;
  const activePointCoord = isInspecting && points[activeIdx] ? points[activeIdx] : null;

  // Format Date & Time for the hovered point
  const formattedDateTime = useMemo(() => {
    if (!displayedPoint) return { dateStr: '', timeStr: '', fullStr: '' };
    const d = new Date(displayedPoint.timestamp);

    // Human friendly date: e.g. "Mon, Sep 21, 2026"
    const dateStr = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Human friendly time: e.g. "09:00 PM"
    const timeStr = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      dateStr,
      timeStr,
      fullStr: `${dateStr} • ${timeStr}`,
    };
  }, [displayedPoint]);

  // Tooltip horizontal positioning with bounds constraint
  const tooltipLeft = useMemo(() => {
    if (!activePointCoord) return 0;
    const estimatedTooltipW = 160;
    const halfW = estimatedTooltipW / 2;
    // Clamp so it doesn't extend beyond the container margins
    return Math.max(halfW + 4, Math.min(chartW - halfW - 4, activePointCoord.x));
  }, [activePointCoord, chartW]);

  // Time Axis markers: start, mid, end
  const axisTicks = useMemo(() => {
    if (data.length < 2) return [];
    const first = data[0];
    const mid = data[Math.floor(data.length / 2)];
    const last = data[data.length - 1];
    return [
      { label: first.timeLabel, position: 'left' },
      { label: mid.timeLabel, position: 'center' },
      { label: `${last.timeLabel} (Now)`, position: 'right' },
    ];
  }, [data]);

  return (
    <div
      id={id}
      className={`p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border transition-all duration-200 shadow-xs ${
        isInspecting && isSelfHovered
          ? 'border-cyan-500/50 dark:border-cyan-400/50 ring-1 ring-cyan-500/20 shadow-md'
          : 'border-slate-200 dark:border-[#182847]'
      }`}
    >
      {/* Card Header: Title, Metric, and Live/Scrubbed Timestamp */}
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold tracking-wide">
              {title}
            </span>
            {isInspecting ? (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 animate-pulse">
                <span>INSPECTING</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Range: {timeRange}
              </span>
            )}
          </div>

          {/* Primary Metric Value */}
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-slate-900 dark:text-white text-lg font-extrabold tracking-tight">
              {displayedPoint ? formatValue(displayedPoint.value) : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {unit}
            </span>

            {/* Change delta when inspecting */}
            {isInspecting && currentPoint && (
              <span
                className={`text-[10px] font-semibold ${
                  displayedPoint.value > currentPoint.value
                    ? 'text-amber-500'
                    : displayedPoint.value < currentPoint.value
                    ? 'text-blue-500'
                    : 'text-slate-400'
                }`}
              >
                {displayedPoint.value > currentPoint.value ? '+' : ''}
                {(displayedPoint.value - currentPoint.value).toFixed(1)} vs now
              </span>
            )}
          </div>
        </div>

        {/* Date & Time Badge in Header */}
        <div className="flex flex-col items-end text-right">
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-[11px] transition-colors ${
              isInspecting
                ? 'bg-slate-100 dark:bg-[#14223d] border-slate-300 dark:border-[#22365a] text-slate-900 dark:text-slate-100 font-medium'
                : 'bg-slate-50 dark:bg-[#091122] border-slate-200/80 dark:border-[#14233e] text-slate-500 dark:text-slate-400'
            }`}
          >
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="font-mono font-semibold">{formattedDateTime.timeStr}</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            <Calendar className="w-2.5 h-2.5 shrink-0" />
            <span>{formattedDateTime.dateStr}</span>
          </div>
        </div>
      </div>

      {/* Interactive Graph Canvas Area */}
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setIsSelfHovered(true)}
        onMouseLeave={handlePointerLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => {
          // Delay unhover slightly on mobile for comfortable inspection
          setTimeout(() => setIsSelfHovered(false), 2000);
        }}
        className="relative w-full cursor-crosshair select-none touch-none mt-2"
        style={{ height: chartH }}
        aria-label={`${title} interactive history chart. Drag or hover to inspect time and date.`}
      >
        <svg
          width="100%"
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="overflow-visible block"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="65%" stopColor={color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>

            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartW - paddingX}
            y2={paddingY}
            stroke="currentColor"
            strokeDasharray="2 3"
            className="text-slate-200 dark:text-slate-800/80"
            strokeWidth="0.8"
          />
          <line
            x1={paddingX}
            y1={chartH / 2}
            x2={chartW - paddingX}
            y2={chartH / 2}
            stroke="currentColor"
            strokeDasharray="2 3"
            className="text-slate-200 dark:text-slate-800/80"
            strokeWidth="0.8"
          />
          <line
            x1={paddingX}
            y1={chartH - paddingY}
            x2={chartW - paddingX}
            y2={chartH - paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800/80"
            strokeWidth="0.8"
          />

          {/* Area Fill */}
          {fillPathD && <path d={fillPathD} fill={`url(#${gradientId})`} />}

          {/* Main Trend Line */}
          {pathD && (
            <path
              d={pathD}
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all"
            />
          )}

          {/* Crosshair & Active Point when Hovered/Touched */}
          {activePointCoord && (
            <g className="transition-opacity duration-150">
              {/* Vertical Crosshair Guide */}
              <line
                x1={activePointCoord.x}
                y1={0}
                x2={activePointCoord.x}
                y2={chartH}
                stroke={color}
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.85"
              />

              {/* Pulsing Outer Aura Ring */}
              <circle
                cx={activePointCoord.x}
                cy={activePointCoord.y}
                r="7"
                fill={color}
                opacity="0.25"
              />

              {/* Concentric Halo */}
              <circle
                cx={activePointCoord.x}
                cy={activePointCoord.y}
                r="4.5"
                fill="#ffffff"
                stroke={color}
                strokeWidth="2.5"
                filter={`url(#glow-${gradientId})`}
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip positioned near active scrub point */}
        {isInspecting && activePointCoord && isSelfHovered && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-75 -translate-x-1/2"
            style={{
              left: tooltipLeft,
              top: activePointCoord.y < 34 ? activePointCoord.y + 12 : activePointCoord.y - 56,
            }}
          >
            <div className="bg-slate-900/95 dark:bg-[#070e1d]/95 text-white backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-xl border border-slate-700/60 dark:border-slate-600/50 flex flex-col space-y-0.5 whitespace-nowrap min-w-[136px]">
              {/* Tooltip Header: Date & Time */}
              <div className="flex items-center justify-between space-x-2 text-[10px] text-slate-300 border-b border-slate-800 pb-1">
                <span className="flex items-center space-x-1 font-medium text-slate-200">
                  <Calendar className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span>{formattedDateTime.dateStr}</span>
                </span>
                <span className="flex items-center space-x-1 font-mono text-cyan-300 font-semibold">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span>{formattedDateTime.timeStr}</span>
                </span>
              </div>

              {/* Tooltip Content: Reading and State */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] font-bold text-white flex items-center space-x-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>
                    {formatValue(displayedPoint.value)} {unit}
                  </span>
                </span>

                {displayedPoint.riskState && (
                  <span
                    className={`inline-flex items-center space-x-0.5 text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                      displayedPoint.riskState === 'NORMAL'
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                        : 'text-amber-400 bg-amber-950/60 border border-amber-800/60'
                    }`}
                  >
                    {displayedPoint.riskState === 'NORMAL' ? (
                      <ShieldCheck className="w-2.5 h-2.5" />
                    ) : (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    )}
                    <span>{displayedPoint.riskState}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Axis Footer: Min/Max values & Time Ticks */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-[#14233e] mt-1">
        <span className="font-mono">
          Min: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{formatValue(minValue)}</strong>
        </span>
        <span className="font-mono text-slate-400 dark:text-slate-500 text-[9px]">
          Avg: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{avgValue}</strong>
        </span>
        <span className="font-mono">
          Max: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{formatValue(maxValue)}</strong>
        </span>
      </div>

      {/* Timeline labels at the base */}
      <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 pt-1">
        {axisTicks.map((tick, i) => (
          <span
            key={i}
            className={`font-mono ${
              tick.position === 'center'
                ? 'text-center'
                : tick.position === 'right'
                ? 'text-right'
                : 'text-left'
            }`}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
};
