'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Table as TableIcon, LineChart as ChartIcon } from 'lucide-react';

interface TrendItem {
  date: string;
  label: string;
  count: number;
}

interface TrendChartProps {
  data: TrendItem[];
  period: '7d' | '30d' | '90d';
  onPeriodChange: (period: '7d' | '30d' | '90d') => void;
  isLoading?: boolean;
}

export function TrendChart({ data, period, onPeriodChange, isLoading = false }: TrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAccessibleTable, setShowAccessibleTable] = useState(false);

  const totalPeriodCount = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const avgPerDay = data.length > 0 ? (totalPeriodCount / data.length).toFixed(1) : '0';

  // Y-axis grid ticks (4 steps)
  const yTicks = [
    maxCount,
    Math.round(maxCount * 0.66),
    Math.round(maxCount * 0.33),
    0,
  ];

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Compute coordinates
  const points = data.map((item, index) => {
    const x = paddingX + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = svgHeight - paddingY - (item.count / maxCount) * chartHeight;
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${
          svgHeight - paddingY
        } Z`
      : '';

  // Select fewer X-axis labels to avoid crowding on mobile
  const labelInterval = period === '7d' ? 1 : period === '30d' ? 5 : 12;

  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Enquiry Inflow Trends
            </h3>
            <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full border border-brand-200">
              {totalPeriodCount} Total
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real prospective student registrations grouped by registration timestamp.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg text-xs">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAccessibleTable(!showAccessibleTable)}
            className="h-8 text-xs text-gray-500 hover:text-gray-900 gap-1"
            title="Toggle accessible table view"
          >
            {showAccessibleTable ? <ChartIcon className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{showAccessibleTable ? 'Chart' : 'Table'}</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-100 text-xs">
        <div>
          <span className="text-gray-400 block">Total in Window</span>
          <span className="font-bold text-gray-900 text-sm mt-0.5 block">{totalPeriodCount}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Peak Volume / Day</span>
          <span className="font-bold text-brand-700 text-sm mt-0.5 block">{maxCount}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Daily Average</span>
          <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{avgPerDay}</span>
        </div>
      </div>

      {/* Visualization Canvas */}
      {isLoading ? (
        <div className="h-56 flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Recalculating trend time-series...</p>
          </div>
        </div>
      ) : showAccessibleTable ? (
        /* Accessible Table Alternative */
        <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-500 uppercase">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3 text-right">Enquiry Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.date} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">{item.label} ({item.date})</td>
                  <td className="py-2 px-3 text-right font-bold text-brand-700">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* SVG Line & Area Visualization */
        <div className="relative overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 sm:h-56 select-none"
            aria-label="Enquiry Volume Over Time Chart"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F2C59" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0F2C59" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {yTicks.map((tick, idx) => {
              const y = paddingY + (idx / (yTicks.length - 1)) * chartHeight;
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94A3B8"
                    fontFamily="sans-serif"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {points.length > 1 && (
              <path d={areaD} fill="url(#areaGradient)" />
            )}

            {/* Line Stroke */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#0F2C59"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g
                  key={pt.date}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : period === '7d' ? 4 : 2.5}
                    fill={isHovered ? '#2E7D32' : '#0F2C59'}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 2 : 1.5}
                    className="transition-all"
                  />
                  {/* Invisible enlarged hit target */}
                  <rect
                    x={pt.x - 12}
                    y={0}
                    width={24}
                    height={svgHeight}
                    fill="transparent"
                  />
                </g>
              );
            })}

            {/* X-axis Labels */}
            {points.map((pt, idx) => {
              if (idx % labelInterval !== 0 && idx !== points.length - 1) return null;
              return (
                <text
                  key={`lbl-${pt.date}`}
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  fontFamily="sans-serif"
                >
                  {pt.label}
                </text>
              );
            })}
          </svg>

          {/* Tooltip Card Overlay */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute pointer-events-none bg-brand-navy-950 text-white px-2.5 py-1.5 rounded-lg shadow-lg text-[11px] z-20 border border-brand-navy-800"
              style={{
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / svgHeight) * 100}%`,
                transform: 'translate(-50%, -120%)',
              }}
            >
              <p className="font-semibold">{points[hoveredIndex].label}</p>
              <p className="text-emerald-400 font-bold">
                {points[hoveredIndex].count} {points[hoveredIndex].count === 1 ? 'Enquiry' : 'Enquiries'}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
