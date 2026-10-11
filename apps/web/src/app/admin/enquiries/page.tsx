'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { TAMIL_NADU_DISTRICTS, EnquiryStatus, EnquirySource } from '@shasthi-guru/shared';
import {
  Search,
  Filter,
  Users,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Clock,
  UserCheck,
  GraduationCap,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

interface EnquiryItem {
  id: string;
  enquiryCode: string;
  status: EnquiryStatus;
  source: EnquirySource;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    phone: string;
    email: string;
    district: string;
    areaOfInterest: string;
    mark12th?: string | null;
  };
  program?: {
    id: string;
    name: string;
    degreeLevel: string;
  } | null;
  assignedCounselor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  followUps?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    feedbackNote?: string | null;
  }>;
}

interface CounselorOption {
  id: string;
  name: string;
  activeCaseload: number;
}

const STATUS_TABS = [
  { value: '', label: 'All Cases' },
  { value: 'NEW', label: 'New Enquiries' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'COUNSELING', label: 'In Counseling' },
  { value: 'FOLLOW_UP', label: 'Follow-up Due' },
  { value: 'ADMISSION_SUPPORT', label: 'Admission Support' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function AdminEnquiriesPage() {
  const { user } = useAuth();

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [counselors, setCounselors] = useState<CounselorOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');

  // Sync initial URL search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStatus = urlParams.get('status');
      const urlCounselor = urlParams.get('counselor') || urlParams.get('counselorId');
      const urlDistrict = urlParams.get('district');
      const urlSearch = urlParams.get('search');
      if (urlStatus) setStatusFilter(urlStatus);
      if (urlCounselor) setCounselorFilter(urlCounselor);
      if (urlDistrict) setDistrictFilter(urlDistrict);
      if (urlSearch) setSearch(urlSearch);
    }
  }, []);

  // Fetch Counselors for filter (if Admin)
  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      fetch('/api/admin/counselors')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.counselors) {
            setCounselors(data.data.counselors);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const loadEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (districtFilter) params.set('district', districtFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (counselorFilter) params.set('counselorId', counselorFilter);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setEnquiries(data.data.enquiries || []);
        setTotal(data.data.pagination?.total || 0);
        setPages(data.data.pagination?.pages || 1);
      } else {
        setEnquiries([]);
      }
    } catch {
      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, districtFilter, sourceFilter, counselorFilter]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDistrictFilter('');
    setSourceFilter('');
    setCounselorFilter('');
    setPage(1);
  };

  const isCounselor = user?.role === 'COUNSELOR';

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COUNSELOR']}>
      <div className="space-y-6">
        {/* Header with Title and Mode Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                {isCounselor ? 'My Assigned Enquiries' : 'Admission Enquiries CRM'}
              </h1>
              <Badge variant="navy" size="sm">
                {total} Records
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isCounselor
                ? 'Managing your direct student caseload. Update guidance statuses and schedule follow-ups.'
                : 'Central student admission management pipeline. Assign counselors and track conversion.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEnquiries}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Status Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border text-xs',
                  isActive
                    ? 'bg-brand-navy-950 text-white border-brand-navy-950 shadow-soft-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Card */}
        <Card className="p-5 border-slate-200 bg-white shadow-soft-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search by code, student name, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'NEW', label: 'New' },
                  { value: 'ASSIGNED', label: 'Assigned' },
                  { value: 'CONTACTED', label: 'Contacted' },
                  { value: 'COUNSELING', label: 'In Counseling' },
                  { value: 'FOLLOW_UP', label: 'Follow-up Due' },
                  { value: 'ADMISSION_SUPPORT', label: 'Admission Support' },
                  { value: 'CONVERTED', label: 'Converted' },
                  { value: 'CLOSED', label: 'Closed' },
                ]}
              />
            </div>

            {/* District Filter */}
            <div>
              <Select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Districts' },
                  ...TAMIL_NADU_DISTRICTS.map((d) => ({ value: d, label: d })),
                ]}
              />
            </div>

            {/* Counselor Filter (Admin only) or Source Filter */}
            {!isCounselor ? (
              <div>
                <Select
                  value={counselorFilter}
                  onChange={(e) => {
                    setCounselorFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Counselors' },
                    ...counselors.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.activeCaseload})`,
                    })),
                  ]}
                />
              </div>
            ) : (
              <div>
                <Select
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Sources' },
                    { value: 'ADMISSION_QUERY', label: 'Admission Query' },
                    { value: 'ENQUIRY_PAGE', label: 'Enquiry Page' },
                    { value: 'HOME_HERO', label: 'Homepage Hero' },
                    { value: 'PHONE_DIRECT', label: 'Phone Direct' },
                  ]}
                />
              </div>
            )}
          </div>

          {(search || statusFilter || districtFilter || sourceFilter || counselorFilter) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Filters active</span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-brand-emerald-700 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </Card>

        {/* Enquiries Listing */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <LoadingSpinner size="md" text="Loading enquiry records..." />
          </div>
        ) : enquiries.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Enquiry ID</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Area / Program</th>
                    <th className="py-3.5 px-4">District</th>
                    <th className="py-3.5 px-4">Status</th>
                    {!isCounselor && <th className="py-3.5 px-4">Assigned To</th>}
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enq) => (
                    <tr
                      key={enq.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    >
                      {/* Enquiry Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-navy-900 whitespace-nowrap">
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          className="hover:text-brand-emerald-600 hover:underline"
                        >
                          {enq.enquiryCode}
                        </Link>
                      </td>

                      {/* Student Name */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          className="font-bold text-slate-900 group-hover:text-brand-navy-900 block"
                        >
                          {enq.student.firstName}
                        </Link>
                        {enq.student.mark12th && (
                          <span className="text-[10px] text-slate-400 block">
                            12th: {enq.student.mark12th}%
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="w-3 h-3 text-brand-emerald-600" />
                          <a
                            href={`tel:${enq.student.phone}`}
                            className="hover:underline font-mono text-slate-800"
                          >
                            {enq.student.phone}
                          </a>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                          {enq.student.email}
                        </span>
                      </td>

                      {/* Program / Area */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-semibold text-slate-800 block truncate">
                          {enq.program?.name || enq.student.areaOfInterest}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {enq.source.replace('_', ' ')}
                        </span>
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {enq.student.district}
                      </td>

                      {/* Status Badge & Next Follow-Up */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge variant={enq.status} size="sm" />
                          {enq.followUps && enq.followUps.length > 0 ? (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 w-fit">
                              <Clock className="w-2.5 h-2.5 text-amber-600" />
                              <span>
                                Next: {new Date(enq.followUps[0].scheduledAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Counselor (Admin view) */}
                      {!isCounselor && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {enq.assignedCounselor ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              <UserCheck className="w-3 h-3 text-brand-emerald-600" />
                              {enq.assignedCounselor.name}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>
                      )}

                      {/* Created Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link href={`/admin/enquiries/${enq.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5"
                            rightIcon={<ChevronRight className="w-3 h-3" />}
                          >
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden space-y-3">
              {enquiries.map((enq) => (
                <Card
                  key={enq.id}
                  className="p-4 border-slate-200 bg-white shadow-soft-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-mono font-bold text-xs text-brand-navy-900">
                      {enq.enquiryCode}
                    </span>
                    <Badge variant={enq.status} size="xs" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {enq.student.firstName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {enq.program?.name || enq.student.areaOfInterest} • {enq.student.district}
                    </p>
                  </div>

                  {enq.followUps && enq.followUps.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>
                        Follow-up scheduled:{' '}
                        <strong>
                          {new Date(enq.followUps[0].scheduledAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${enq.student.phone}`}
                        className="inline-flex items-center gap-1 font-mono font-bold text-brand-emerald-700 hover:underline p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${enq.student.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <Link href={`/admin/enquiries/${enq.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                        Manage →
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page <strong className="text-slate-900">{page}</strong> of{' '}
                  <strong className="text-slate-900">{pages}</strong> ({total} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <EmptyState
              title="No Enquiries Match Your Filter"
              description="Try adjusting your search criteria, clearing status filters, or check back later."
              action={
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              }
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
