'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Users, ChevronRight, Briefcase, Award } from 'lucide-react';

interface CounselorWorkloadItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  activeCaseload: number;
  totalAssigned: number;
  counselingCount: number;
  convertedCount: number;
  overdueFollowups: number;
}

interface CounselorWorkloadWidgetProps {
  counselors: CounselorWorkloadItem[];
  userRole?: string;
  isLoading?: boolean;
}

export function CounselorWorkloadWidget({
  counselors,
  userRole,
  isLoading = false,
}: CounselorWorkloadWidgetProps) {
  const isCounselor = userRole === 'COUNSELOR';

  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-indigo-600" />
            <span>{isCounselor ? 'My Caseload Performance' : 'Counselor Team Workload'}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isCounselor
              ? 'Real-time overview of your active student advising assignments and follow-ups.'
              : 'Caseload distribution, counseling volume, and conversion metrics across counselors.'}
          </p>
        </div>

        {!isCounselor && (
          <Link href="/admin/counselors">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-brand-600 gap-1">
              <span>Team Roster</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : counselors.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">
          No counselor workload records found.
        </div>
      ) : isCounselor && counselors.length === 1 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-navy-950 text-white flex items-center justify-center font-bold text-sm shadow-soft-xs">
                {counselors[0].name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{counselors[0].name}</h4>
                <p className="text-xs text-slate-500">{counselors[0].email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/enquiries">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                  <span>My Enquiries Queue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/admin/follow-ups?status=SCHEDULED">
                <Button size="sm" variant="emerald" className="h-8 text-xs gap-1">
                  <span>Pending Follow-ups</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-soft-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Active Caseload</span>
              <span className="text-xl font-black text-brand-navy-950 mt-0.5 block">
                {counselors[0].activeCaseload}
              </span>
              <span className="text-[10px] text-slate-400">Assigned students</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-soft-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">In Counseling</span>
              <span className="text-xl font-black text-amber-700 mt-0.5 block">
                {counselors[0].counselingCount}
              </span>
              <span className="text-[10px] text-slate-400">Active sessions</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-soft-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Admitted / Converted</span>
              <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                {counselors[0].convertedCount}
              </span>
              <span className="text-[10px] text-slate-400">Successful conversions</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-soft-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Overdue Follow-ups</span>
              <span
                className={`text-xl font-black mt-0.5 block ${
                  counselors[0].overdueFollowups > 0 ? 'text-rose-600' : 'text-slate-400'
                }`}
              >
                {counselors[0].overdueFollowups}
              </span>
              <span className="text-[10px] text-slate-400">Requires prompt contact</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-200 uppercase font-semibold text-gray-500">
              <tr>
                <th className="py-2.5 px-3">Counselor</th>
                <th className="py-2.5 px-3 text-center">Active Cases</th>
                <th className="py-2.5 px-3 text-center">Counseling</th>
                <th className="py-2.5 px-3 text-center">Converted</th>
                <th className="py-2.5 px-3 text-center">Overdue F/U</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {counselors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate max-w-[160px]">{c.name}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{c.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      {c.activeCaseload}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-semibold text-amber-700">{c.counselingCount}</span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-semibold text-emerald-700">{c.convertedCount}</span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {c.overdueFollowups > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        {c.overdueFollowups}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <Link href={`/admin/enquiries?counselor=${c.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-brand-600 hover:bg-brand-50 gap-1 p-1"
                      >
                        Enquiries &rarr;
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
