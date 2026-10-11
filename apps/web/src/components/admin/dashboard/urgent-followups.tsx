'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Phone, AlertCircle, CheckCircle2, ChevronRight, User } from 'lucide-react';

interface UrgentFollowUpItem {
  id: string;
  scheduledAt: string;
  status: string;
  feedbackNote?: string | null;
  student: {
    id: string;
    firstName: string;
    phone: string;
    district: string;
  };
  enquiry?: {
    id: string;
    enquiryCode: string;
    status: string;
  } | null;
  counselor?: {
    id: string;
    name: string;
  } | null;
}

interface UrgentFollowupsProps {
  items: UrgentFollowUpItem[];
  overdueCount: number;
  dueTodayCount: number;
  isLoading?: boolean;
}

export function UrgentFollowups({
  items,
  overdueCount,
  dueTodayCount,
  isLoading = false,
}: UrgentFollowupsProps) {
  const now = Date.now();

  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Urgent Follow-Up Action Required</span>
            </h3>
            {overdueCount > 0 && (
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                {overdueCount} Overdue
              </Badge>
            )}
            {dueTodayCount > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                {dueTodayCount} Due Today
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Student callbacks and counseling consultations scheduled for today or past due.
          </p>
        </div>

        <Link href="/admin/follow-ups">
          <Button variant="outline" size="sm" className="h-8 text-xs text-brand-700 border-brand-200 gap-1">
            <span>All Schedules</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 space-y-1">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
          <p className="font-bold">All follow-ups up to date!</p>
          <p className="text-emerald-600 text-[11px]">
            No pending follow-ups are overdue or due today in your caseload.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((fu) => {
            const isOverdue = new Date(fu.scheduledAt).getTime() < now;

            return (
              <div
                key={fu.id}
                className="p-3 bg-gray-50/70 hover:bg-white hover:shadow-sm rounded-xl border border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/students/${fu.student.id}`}
                        className="font-bold text-xs text-gray-900 hover:text-brand-600"
                      >
                        {fu.student.firstName}
                      </Link>
                      <a
                        href={`tel:${fu.student.phone}`}
                        className="text-[11px] text-gray-500 font-mono flex items-center gap-1 hover:text-brand-600"
                      >
                        <Phone className="h-3 w-3 text-gray-400" />
                        {fu.student.phone}
                      </a>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-500">{fu.student.district}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                      <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-amber-700 font-medium'}>
                        {new Date(fu.scheduledAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({new Date(fu.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
                      </span>
                      {fu.enquiry && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Link
                            href={`/admin/enquiries/${fu.enquiry.id}`}
                            className="font-mono text-brand-600 hover:underline"
                          >
                            {fu.enquiry.enquiryCode}
                          </Link>
                        </>
                      )}
                      {fu.counselor && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>Staff: {fu.counselor.name}</span>
                        </>
                      )}
                    </div>

                    {fu.feedbackNote && (
                      <p className="text-[11px] text-gray-600 mt-1 italic truncate max-w-md">
                        &quot;{fu.feedbackNote}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link href={`/admin/follow-ups`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-gray-700 hover:text-brand-700 border-gray-200"
                    >
                      Update
                    </Button>
                  </Link>
                  {fu.enquiry && (
                    <Link href={`/admin/enquiries/${fu.enquiry.id}`}>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-brand-600 hover:bg-brand-700 text-white"
                      >
                        Enquiry Workspace
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
