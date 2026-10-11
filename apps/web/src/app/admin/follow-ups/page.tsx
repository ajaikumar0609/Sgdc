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
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Phone,
  RefreshCw,
  Edit3,
  Filter,
  ExternalLink,
  ChevronRight,
  MapPin,
  Check,
} from 'lucide-react';

interface FollowUpItem {
  id: string;
  enquiryId: string;
  studentId: string;
  counselorId: string;
  scheduledAt: string;
  completedAt?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  feedbackNote?: string | null;
  nextActionDate?: string | null;
  createdAt: string;
  enquiry?: {
    id: string;
    enquiryCode: string;
    status: string;
  } | null;
  student?: {
    id: string;
    firstName: string;
    phone: string;
    district: string;
  } | null;
  counselor?: {
    id: string;
    name: string;
  } | null;
}

export default function AdminFollowUpsPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Update modal state
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpItem | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'>('COMPLETED');
  const [updateFeedback, setUpdateFeedback] = useState('');
  const [updateNextActionDate, setUpdateNextActionDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/admin/follow-ups?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please log in.');
        if (res.status === 403) throw new Error('Access denied to follow-up registry.');
        throw new Error('Failed to load follow-up schedules.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setFollowUps(json.data.followUps || []);
      } else {
        setFollowUps([]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching follow-ups.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleOpenUpdateModal = (fu: FollowUpItem) => {
    setSelectedFollowUp(fu);
    setUpdateStatus(fu.status);
    setUpdateFeedback(fu.feedbackNote || '');
    setUpdateNextActionDate(
      fu.nextActionDate ? new Date(fu.nextActionDate).toISOString().split('T')[0] : ''
    );
    setModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp || isUpdating) return;

    try {
      setIsUpdating(true);

      const res = await fetch(`/api/admin/follow-ups/${selectedFollowUp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          feedbackNote: updateFeedback.trim(),
          nextActionDate: updateNextActionDate ? new Date(updateNextActionDate).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Failed to update follow-up record.');
      }

      setModalOpen(false);
      setSelectedFollowUp(null);
      fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Error updating follow-up');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered in-memory by search keyword
  const filteredList = followUps.filter((fu) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      fu.student?.firstName.toLowerCase().includes(q) ||
      fu.student?.phone.includes(q) ||
      fu.enquiry?.enquiryCode.toLowerCase().includes(q) ||
      fu.counselor?.name.toLowerCase().includes(q)
    );
  });

  // Metric counts
  const totalCount = followUps.length;
  const scheduledCount = followUps.filter((f) => f.status === 'SCHEDULED').length;
  const completedCount = followUps.filter((f) => f.status === 'COMPLETED').length;
  const missedCount = followUps.filter((f) => f.status === 'MISSED').length;

  const getStatusBadge = (status: FollowUpItem['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1 font-semibold">
            <Clock className="h-3 w-3 text-amber-600" /> Scheduled
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1 font-semibold">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Completed
          </Badge>
        );
      case 'MISSED':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs gap-1 font-semibold">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Missed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 text-xs gap-1 font-semibold">
            <XCircle className="h-3 w-3 text-gray-500" /> Cancelled
          </Badge>
        );
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Follow-Up Management</h1>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                {scheduledCount} Pending
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'COUNSELOR'
                ? 'Your assigned student follow-up agenda, callbacks, and counseling commitments.'
                : 'Central calendar of prospective student touchpoints, calls, and counseling status across all counselors.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFollowUps()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin/enquiries">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white gap-2">
                Enquiries
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Total Follow-Ups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Scheduled / Due</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{scheduledCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Completed</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-rose-500 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Missed / Overdue</p>
                <p className="text-2xl font-bold text-rose-700 mt-1">{missedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 shadow-sm bg-white border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs">
              {(['ALL', 'SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search student, phone, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-200">
            <LoadingSpinner size="lg" className="text-brand-600" />
            <p className="text-sm font-medium text-gray-500">Loading follow-up tasks from database...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center bg-rose-50 border-rose-200">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFollowUps()}
              className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </Card>
        ) : filteredList.length === 0 ? (
          <EmptyState
            title="No follow-up records found"
            description={
              statusFilter !== 'ALL' || search
                ? 'No follow-up tasks match your active filter criteria.'
                : 'There are currently no follow-up schedules in your accessible caseload.'
            }
            action={
              (statusFilter !== 'ALL' || search) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSearch('');
                  }}
                >
                  Reset Filter
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Scheduled Date & Time</th>
                    <th className="py-3.5 px-4">Student & Contact</th>
                    <th className="py-3.5 px-4">Enquiry</th>
                    <th className="py-3.5 px-4">Counselor</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Feedback / Notes</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((fu) => {
                    const isPast = new Date(fu.scheduledAt).getTime() < Date.now();
                    return (
                      <tr key={fu.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-brand-600" />
                            <div>
                              <p className="font-semibold text-gray-900 text-xs">
                                {new Date(fu.scheduledAt).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {new Date(fu.scheduledAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {isPast && fu.status === 'SCHEDULED' && (
                                  <span className="ml-1 text-rose-600 font-semibold">(Overdue)</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Link href={`/admin/students/${fu.studentId}`} className="group">
                            <p className="font-bold text-gray-900 group-hover:text-brand-600 text-xs">
                              {fu.student?.firstName || 'Student'}
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {fu.student?.phone}
                            </p>
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {fu.enquiry ? (
                            <Link
                              href={`/admin/enquiries/${fu.enquiryId}`}
                              className="font-mono text-xs font-semibold text-brand-600 hover:underline"
                            >
                              {fu.enquiry.enquiryCode}
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs font-mono">N/A</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-800">
                            {fu.counselor?.name || 'Staff'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(fu.status)}</td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs text-gray-600 truncate" title={fu.feedbackNote || ''}>
                            {fu.feedbackNote || <span className="text-gray-300 italic">No notes</span>}
                          </p>
                          {fu.nextActionDate && (
                            <p className="text-[10px] text-brand-600 font-medium mt-0.5">
                              Next: {new Date(fu.nextActionDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(fu)}
                            className="text-xs h-8 gap-1 text-gray-700 hover:text-brand-600 border-gray-200 hover:border-brand-300"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (USABLE AT 360px - 430px) */}
            <div className="md:hidden space-y-3">
              {filteredList.map((fu) => {
                const isPast = new Date(fu.scheduledAt).getTime() < Date.now();
                return (
                  <Card key={fu.id} className="p-4 shadow-sm border border-gray-200 bg-white space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-brand-600" />
                          <span className="font-bold text-xs text-gray-900">
                            {new Date(fu.scheduledAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        {isPast && fu.status === 'SCHEDULED' && (
                          <span className="text-[11px] text-rose-600 font-bold block mt-0.5">
                            Overdue / Follow-up pending
                          </span>
                        )}
                      </div>
                      <div>{getStatusBadge(fu.status)}</div>
                    </div>

                    <div className="text-xs space-y-1 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between">
                        <Link href={`/admin/students/${fu.studentId}`} className="font-bold text-gray-900">
                          {fu.student?.firstName || 'Student'}
                        </Link>
                        <a href={`tel:${fu.student?.phone}`} className="text-brand-600 font-mono">
                          {fu.student?.phone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 text-[11px]">
                        <span>Enquiry: {fu.enquiry?.enquiryCode || 'N/A'}</span>
                        <span>Counselor: {fu.counselor?.name}</span>
                      </div>
                    </div>

                    {fu.feedbackNote && (
                      <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 italic">
                        &quot;{fu.feedbackNote}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {fu.enquiryId && (
                        <Link
                          href={`/admin/enquiries/${fu.enquiryId}`}
                          className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1"
                        >
                          Enquiry Workspace &rarr;
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenUpdateModal(fu)}
                        className="text-xs h-7 ml-auto text-brand-600 border-brand-200"
                      >
                        Update Status
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {modalOpen && selectedFollowUp && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Update Follow-Up Status"
            description={`Student: ${selectedFollowUp.student?.firstName || 'Student'} • Scheduled for ${new Date(
              selectedFollowUp.scheduledAt
            ).toLocaleString('en-IN')}`}
          >
            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Outcome Status
                </label>
                <Select
                  value={updateStatus}
                  onChange={(e) =>
                    setUpdateStatus(
                      e.target.value as 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'
                    )
                  }
                  className="w-full text-xs"
                >
                  <option value="COMPLETED">✅ Completed (Call / Meeting Conducted)</option>
                  <option value="SCHEDULED">⏳ Scheduled (Keep in Calendar)</option>
                  <option value="MISSED">⚠️ Missed (Did not connect)</option>
                  <option value="CANCELLED">❌ Cancelled</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Follow-up Feedback / Discussion Notes
                </label>
                <Textarea
                  value={updateFeedback}
                  onChange={(e) => setUpdateFeedback(e.target.value)}
                  placeholder="Record summary of call, student concerns, admission likelihood, or queries..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Next Action Date (Optional)
                </label>
                <Input
                  type="date"
                  value={updateNextActionDate}
                  onChange={(e) => setUpdateNextActionDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs gap-1.5"
                >
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AdminShell>
  );
}
