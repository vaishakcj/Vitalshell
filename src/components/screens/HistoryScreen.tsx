import React, { useState, useMemo } from 'react';
import { Download, Check, Touchpad, Clock, Calendar } from 'lucide-react';
import { HistoryTimeRange, SensorVitals, BiomechanicalData } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';
import { generateHistoryData } from '../../mock/historyData';
import { downloadTelemetryCsv } from '../../utils/csvExport';
import { HistoryInteractiveChart, ChartDataPoint } from '../history/HistoryInteractiveChart';

interface HistoryScreenProps {
  onBack?: () => void;
  showBack?: boolean;
  currentVitals?: SensorVitals;
  currentBiomech?: BiomechanicalData;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onBack,
  showBack = false,
  currentVitals,
  currentBiomech,
}) => {
  const [selectedRange, setSelectedRange] = useState<HistoryTimeRange>('24H');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const historyData = useMemo(() => {
    return generateHistoryData(selectedRange);
  }, [selectedRange]);

  // If current vitals are available, update the last data point with live values
  const pointsWithVitals = useMemo(() => {
    if (!historyData.length) return [];
    if (!currentVitals) return historyData;

    const copy = [...historyData];
    const lastIdx = copy.length - 1;
    copy[lastIdx] = {
      ...copy[lastIdx],
      heartRate: currentVitals.heartRate,
      spo2: currentVitals.spo2,
      temperature: Number(currentVitals.skinTemp.toFixed(1)),
      respiration: currentVitals.respiration,
    };
    return copy;
  }, [historyData, currentVitals]);

  // Transform data for each interactive chart
  const hrChartData: ChartDataPoint[] = useMemo(
    () =>
      pointsWithVitals.map((d) => ({
        timestamp: d.timestamp,
        value: d.heartRate,
        timeLabel: d.timeLabel,
        riskState: d.riskState,
      })),
    [pointsWithVitals]
  );

  const spo2ChartData: ChartDataPoint[] = useMemo(
    () =>
      pointsWithVitals.map((d) => ({
        timestamp: d.timestamp,
        value: d.spo2,
        timeLabel: d.timeLabel,
        riskState: d.riskState,
      })),
    [pointsWithVitals]
  );

  const tempChartData: ChartDataPoint[] = useMemo(
    () =>
      pointsWithVitals.map((d) => ({
        timestamp: d.timestamp,
        value: d.temperature,
        timeLabel: d.timeLabel,
        riskState: d.riskState,
      })),
    [pointsWithVitals]
  );

  const respChartData: ChartDataPoint[] = useMemo(
    () =>
      pointsWithVitals.map((d) => ({
        timestamp: d.timestamp,
        value: d.respiration,
        timeLabel: d.timeLabel,
        riskState: d.riskState,
      })),
    [pointsWithVitals]
  );

  const handleDownloadCSV = () => {
    downloadTelemetryCsv({
      historyData: pointsWithVitals,
      vitals: currentVitals,
      biomech: currentBiomech,
      timeRangeLabel: selectedRange,
      filenamePrefix: 'vitalshell-history',
    });

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2400);
  };

  // Inspecting state helpers
  const activePoint =
    selectedIndex !== null && selectedIndex >= 0 && selectedIndex < pointsWithVitals.length
      ? pointsWithVitals[selectedIndex]
      : null;

  const activeDateTime = useMemo(() => {
    if (!activePoint) return null;
    const d = new Date(activePoint.timestamp);
    return {
      date: d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
  }, [activePoint]);

  const downloadButton = (
    <button
      id="download-telemetry-csv-btn"
      onClick={handleDownloadCSV}
      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs border ${
        downloadSuccess
          ? 'bg-emerald-500 text-white border-emerald-600 dark:border-emerald-400'
          : 'bg-white dark:bg-[#0f1b33] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1c2e50] hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#142444]'
      }`}
      title="Download physiological and biomechanical telemetry logs as CSV"
      aria-label="Download telemetry logs as CSV"
    >
      {downloadSuccess ? (
        <>
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Exported CSV</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 stroke-[2]" />
          <span>Export CSV</span>
        </>
      )}
    </button>
  );

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader
        title="History"
        showBack={showBack}
        onBack={onBack}
        rightAction={downloadButton}
      />

      {/* Time Selectors: 1H | 6H | 24H | 7D | 30D */}
      <div className="flex justify-center my-2">
        <div className="grid grid-cols-5 p-1 bg-slate-100 dark:bg-[#0b1325] rounded-xl border border-slate-200 dark:border-[#16233d] w-full">
          {(['1H', '6H', '24H', '7D', '30D'] as HistoryTimeRange[]).map((range) => {
            const isActive = selectedRange === range;
            return (
              <button
                key={range}
                id={`history-range-${range}`}
                onClick={() => {
                  setSelectedRange(range);
                  setSelectedIndex(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-white dark:bg-[#182847] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrubbing status banner or interaction guidance */}
      <div className="flex items-center justify-between px-1 py-1 text-[11px]">
        {activeDateTime ? (
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{activeDateTime.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 font-mono font-semibold">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{activeDateTime.time}</span>
            </span>
            <button
              onClick={() => setSelectedIndex(null)}
              className="text-[10px] underline ml-1 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500">
            <Touchpad className="w-3.5 h-3.5" />
            <span>Hover cursor or drag finger across graphs to inspect date & time</span>
          </div>
        )}
      </div>

      {/* 4 Interactive Graph Cards */}
      <div className="space-y-3 pb-2 mt-1">
        {/* Heart Rate Card */}
        <HistoryInteractiveChart
          id="history-chart-heart-rate"
          title="Heart Rate"
          unit="bpm"
          data={hrChartData}
          color="#10b981"
          gradientId="grad-hr-history"
          timeRange={selectedRange}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          formatValue={(v) => Math.round(v).toString()}
          height={76}
        />

        {/* SpO2 Card */}
        <HistoryInteractiveChart
          id="history-chart-spo2"
          title="SpO₂"
          unit="%"
          data={spo2ChartData}
          color="#06b6d4"
          gradientId="grad-spo2-history"
          timeRange={selectedRange}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          formatValue={(v) => Math.round(v).toString()}
          height={76}
        />

        {/* Temperature Card */}
        <HistoryInteractiveChart
          id="history-chart-temperature"
          title="Temperature"
          unit="°C"
          data={tempChartData}
          color="#f59e0b"
          gradientId="grad-temp-history"
          timeRange={selectedRange}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          formatValue={(v) => v.toFixed(1)}
          height={76}
        />

        {/* Respiration Card */}
        <HistoryInteractiveChart
          id="history-chart-respiration"
          title="Respiration"
          unit="bpm"
          data={respChartData}
          color="#8b5cf6"
          gradientId="grad-resp-history"
          timeRange={selectedRange}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          formatValue={(v) => Math.round(v).toString()}
          height={76}
        />

        {/* Risk State Timeline */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Risk State Timeline
            </span>
            {activePoint ? (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  activePoint.riskState === 'NORMAL'
                    ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                }`}
              >
                {activePoint.riskState}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Live Status: Normal</span>
            )}
          </div>

          {/* Interactive Segmented Timeline Bar */}
          <div
            className="relative h-4 w-full rounded-md overflow-hidden flex space-x-1 bg-slate-100 dark:bg-[#091122] cursor-crosshair touch-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const idx = Math.round(ratio * (pointsWithVitals.length - 1));
              setSelectedIndex(idx);
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
                const idx = Math.round(ratio * (pointsWithVitals.length - 1));
                setSelectedIndex(idx);
              }
            }}
          >
            {/* Timeline color bar blocks */}
            <div className="flex-[3] bg-emerald-500/80 rounded-xs" title="Normal" />
            <div className="flex-[2] bg-emerald-500/80 rounded-xs" title="Normal" />
            <div className="flex-[2] bg-amber-500 rounded-xs" title="Elevated" />
            <div className="flex-[4] bg-emerald-500/80 rounded-xs" title="Normal" />

            {/* Vertical timeline scrubber indicator synced with active hover/touch */}
            {selectedIndex !== null && pointsWithVitals.length > 1 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] rounded-full -translate-x-1/2 pointer-events-none transition-all duration-75"
                style={{
                  left: `${(selectedIndex / (pointsWithVitals.length - 1)) * 100}%`,
                }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                <span>Normal</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                <span>Elevated</span>
              </div>
            </div>

            {activeDateTime && (
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                {activeDateTime.time}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
