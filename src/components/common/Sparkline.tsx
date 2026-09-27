import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  fillColor?: string;
  height?: number;
  width?: number | string;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#22d3ee',
  fillColor,
  height = 36,
  width = 90,
  strokeWidth = 2,
  className = '',
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;
  const h = typeof height === 'number' ? height : 36;
  const w = typeof width === 'number' ? width : 90;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (w - padding * 2) + padding;
    const y = h - padding - ((val - min) / range) * (h - padding * 2);
    return { x, y };
  });

  // Smooth bezier curve generator
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
  }

  const fillPathD = fillColor
    ? `${pathD} L ${points[points.length - 1].x},${h} L ${points[0].x},${h} Z`
    : '';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      className={`overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {fillColor && (
        <path d={fillPathD} fill={fillColor} opacity={0.18} />
      )}
      <path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
