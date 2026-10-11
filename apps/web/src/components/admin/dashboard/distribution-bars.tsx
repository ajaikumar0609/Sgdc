'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface DistributionItem {
  id?: string;
  name: string;
  count: number;
  percentage: number;
  sublabel?: string;
  linkParam?: string;
}

interface DistributionBarsProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: DistributionItem[];
  color?: string; // e.g. '#0F2C59' or '#2E7D32'
  filterParamName: string; // e.g. 'district' or 'search'
  viewAllHref?: string;
  isLoading?: boolean;
}

export function DistributionBars({
  title,
  subtitle,
  icon,
  items,
  color = '#0F2C59',
  filterParamName,
  viewAllHref = '/admin/enquiries',
  isLoading = false,
}: DistributionBarsProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Explore &rarr;
          </Link>
        )}
      </div>

      {/* Bar List */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">
          No records registered for this breakdown.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {items.map((item) => {
            const barWidth = `${Math.max((item.count / maxCount) * 100, 3)}%`;
            const queryValue = encodeURIComponent(item.linkParam || item.name);
            const targetHref = `/admin/enquiries?${filterParamName}=${queryValue}`;

            return (
              <Link
                key={item.name}
                href={targetHref}
                className="block group hover:bg-gray-50/80 p-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-800 group-hover:text-brand-700 truncate max-w-[240px]">
                    {item.name}
                    {item.sublabel && (
                      <span className="text-[11px] text-gray-400 font-normal ml-1.5">
                        ({item.sublabel})
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.count}</span>
                    <span className="text-[11px] text-gray-400 min-w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Scaled Visual Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: barWidth,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
