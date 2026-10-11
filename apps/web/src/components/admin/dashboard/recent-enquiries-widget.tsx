'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Phone, MapPin, ChevronRight, GraduationCap } from 'lucide-react';

interface RecentEnquiryItem {
  id: string;
  enquiryCode: string;
  status: string;
  source: string;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    phone: string;
    district: string;
    mark12th?: string | null;
  };
  program?: {
    id: string;
    name: string;
  } | null;
  assignedCounselor?: {
    id: string;
    name: string;
  } | null;
}

interface RecentEnquiriesWidgetProps {
  enquiries: RecentEnquiryItem[];
  isLoading?: boolean;
}

export function RecentEnquiriesWidget({ enquiries, isLoading = false }: RecentEnquiriesWidgetProps) {
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      NEW: { label: 'New', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      ASSIGNED: { label: 'Assigned', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      CONTACTED: { label: 'Contacted', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      COUNSELING: { label: 'Counseling', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      FOLLOW_UP: { label: 'Follow Up', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      ADMISSION_SUPPORT: { label: 'Admission Support', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      CONVERTED: { label: 'Converted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    };
    const s = map[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
    return <Badge variant="outline" className={`${s.className} text-[11px] font-semibold`}>{s.label}</Badge>;
  };

  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            <span>Latest Enquiries Inflow</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Most recently registered prospective students in your scope.
          </p>
        </div>

        <Link href="/admin/enquiries">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-brand-600 gap-1">
            <span>All Enquiries</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">
          No recent enquiries recorded.
        </div>
      ) : (
        <div className="space-y-2">
          {enquiries.map((enq) => (
            <Link
              key={enq.id}
              href={`/admin/enquiries/${enq.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all gap-2 group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-brand-900 bg-brand-50/80 px-2 py-0.5 rounded border border-brand-200/80 shrink-0">
                  {enq.enquiryCode}
                </span>

                <div className="min-w-0">
                  <p className="font-bold text-xs text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                    {enq.student.firstName}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span>{enq.student.district || 'Tamil Nadu'}</span>
                    {enq.program && (
                      <>
                        <span>•</span>
                        <span className="text-gray-600 truncate">{enq.program.name}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                <div className="text-right text-[11px] text-gray-400 hidden sm:block">
                  <span>Counselor: </span>
                  <span className="font-medium text-gray-700">
                    {enq.assignedCounselor?.name || 'Unassigned'}
                  </span>
                </div>
                {getStatusBadge(enq.status)}
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
