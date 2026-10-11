'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'outline' | 'secondary';
    className?: string;
  };
  borderColorClass?: string;
  href?: string;
  isLoading?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  borderColorClass = 'border-l-brand-600',
  href,
  isLoading = false,
}: KpiCardProps) {
  const content = (
    <Card
      className={`p-4 bg-white shadow-sm border border-gray-200 border-l-4 ${borderColorClass} transition-all duration-200 ${
        href ? 'hover:shadow-md hover:border-gray-300 cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            {title}
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {value.toLocaleString()}
              </span>
            )}

            {badge && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  badge.className || 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {badge.text}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end justify-between self-stretch">
          <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 group-hover:scale-105 transition-transform">
            {icon}
          </div>
          {href && (
            <span className="text-gray-300 group-hover:text-brand-600 transition-colors mt-auto">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
