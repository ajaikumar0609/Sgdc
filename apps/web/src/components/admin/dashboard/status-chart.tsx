'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Layers } from 'lucide-react';

interface StatusItem {
  status: string;
  count: number;
  percentage: number;
}

interface StatusChartProps {
  data: StatusItem[];
  total: number;
  isLoading?: boolean;
}

const STATUS_METADATA: Record<
  string,
  { label: string; color: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: 'New Enquiry',
    color: '#2563EB',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  ASSIGNED: {
    label: 'Assigned',
    color: '#4F46E5',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  CONTACTED: {
    label: 'Contacted',
    color: '#0891B2',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  COUNSELING: {
    label: 'In Counselling',
    color: '#D97706',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  FOLLOW_UP: {
    label: 'Follow Up Pending',
    color: '#EA580C',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  ADMISSION_SUPPORT: {
    label: 'Admission Support',
    color: '#9333EA',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  CONVERTED: {
    label: 'Converted',
    color: '#16A34A',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  CLOSED: {
    label: 'Closed / Inactive',
    color: '#64748B',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
};

export function StatusChart({ data, total, isLoading = false }: StatusChartProps) {
  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-600" />
            <span>Enquiry Pipeline Distribution</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Stage-by-stage progression of all {total} prospective students in scope.
          </p>
        </div>

        <Link
          href="/admin/enquiries"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          View CRM &rarr;
        </Link>
      </div>

      {/* Multi-Color Segmented Progress Bar */}
      <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
        {data.map((item) => {
          if (item.count === 0) return null;
          const meta = STATUS_METADATA[item.status] || {
            color: '#94A3B8',
            label: item.status,
          };
          return (
            <div
              key={item.status}
              style={{
                width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                backgroundColor: meta.color,
              }}
              className="h-full transition-all duration-300 relative group cursor-pointer"
              title={`${meta.label}: ${item.count} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Grid of Interactive Status Rows */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {data.map((item) => {
            const meta = STATUS_METADATA[item.status] || {
              label: item.status,
              color: '#64748B',
              bg: 'bg-gray-50',
              text: 'text-gray-700',
              border: 'border-gray-200',
            };

            return (
              <Link
                key={item.status}
                href={`/admin/enquiries?status=${item.status}`}
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-brand-700 truncate">
                    {meta.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs text-gray-900">{item.count}</span>
                  <span className="text-[11px] text-gray-400 min-w-10 text-right">
                    {item.percentage}%
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-brand-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
