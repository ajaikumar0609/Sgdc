'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Modal } from '@/components/ui/modal';
import { EnquiryStatus, EnquirySource } from '@shasthi-guru/shared';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText,
  MessageSquare,
  AlertCircle,
  Plus,
  Send,
  Building,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  MessageCircle,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnquiryDetailData {
  id: string;
  enquiryCode: string;
  status: EnquiryStatus;
  source: EnquirySource;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    phone: string;
    email: string;
    address?: string | null;
    district: string;
    areaOfInterest: string;
    mark12th?: string | null;
    consentGivenAt?: string | null;
    aadhaarMasked?: string | null;
  };
  program?: {
    id: string;
    name: string;
    slug: string;
    degreeLevel: string;
    durationYears?: string;
    overview?: string;
  } | null;
  assignedCounselor?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  followUps: {
    id: string;
    scheduledAt: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
    feedbackNote?: string | null;
    nextActionDate?: string | null;
    counselor?: { id: string; name: string } | null;
  }[];
  conversations: {
    id: string;
    title: string;
    messages: {
      id: string;
      channel: 'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL';
      message: string;
      createdAt: string;
      sender: { id: string; name: string; role: string };
    }[];
  }[];
}

interface CounselorOption {
  id: string;
  name: string;
  activeCaseload: number;
}

const PIPELINE_STEPS: EnquiryStatus[] = [
  'NEW',
  'ASSIGNED',
  'CONTACTED',
  'COUNSELING',
  'FOLLOW_UP',
  'ADMISSION_SUPPORT',
  'CONVERTED',
];

export default function EnquiryDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [enquiry, setEnquiry] = useState<EnquiryDetailData | null>(null);
  const [counselors, setCounselors] = useState<CounselorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Action States
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // New Follow-up State
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  // New Conversation Note State
  const [messageNote, setMessageNote] = useState('');
  const [channel, setChannel] = useState<'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL'>('PHONE');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const loadEnquiryData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`);
      setStatusCode(res.status);

      if (res.status === 403) {
        setErrorMessage('Access Forbidden: You do not have permission to view this enquiry.');
        return;
      }
      if (res.status === 404) {
        setErrorMessage('Enquiry not found. The record may have been archived or removed.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success && data.data?.enquiry) {
        setEnquiry(data.data.enquiry);
        setInternalNotes(data.data.enquiry.internalNotes || '');
      } else {
        setErrorMessage(data.error?.message || 'Unable to load enquiry details.');
      }
    } catch {
      setErrorMessage('Connection error while retrieving enquiry workspace.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadEnquiryData();
    }
  }, [id, loadEnquiryData]);

  // Load Counselors for Super Admin & Admin
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

  // Handle Status Update
  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry || newStatus === enquiry.status) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        alert(data.error?.message || 'Failed to update status.');
      }
    } catch {
      alert('Network error while updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Counselor Assignment (Admin only)
  const handleAssignCounselor = async (counselorId: string) => {
    if (!enquiry) return;

    setIsUpdatingAssignment(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedCounselorId: counselorId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const found = counselors.find((c) => c.id === counselorId);
        setEnquiry((prev) =>
          prev
            ? {
                ...prev,
                status: prev.status === 'NEW' ? 'ASSIGNED' : prev.status,
                assignedCounselor: found ? { id: found.id, name: found.name, email: '' } : null,
              }
            : null
        );
      } else {
        alert(data.error?.message || 'Failed to assign counselor.');
      }
    } catch {
      alert('Network error during counselor assignment.');
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    if (!enquiry) return;
    setIsSavingNotes(true);
    setNotesSuccess(false);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotesSuccess(true);
        setTimeout(() => setNotesSuccess(false), 3000);
      } else {
        alert(data.error?.message || 'Failed to save notes.');
      }
    } catch {
      alert('Network error while saving notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Schedule New Follow-up
  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !followUpDate) return;

    setIsSubmittingFollowUp(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: followUpDate,
          feedbackNote: followUpNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.followUp) {
        setEnquiry((prev) =>
          prev
            ? {
                ...prev,
                status: 'FOLLOW_UP',
                followUps: [data.data.followUp, ...prev.followUps],
              }
            : null
        );
        setShowFollowUpForm(false);
        setFollowUpDate('');
        setFollowUpNote('');
      } else {
        alert(data.error?.message || 'Failed to schedule follow-up.');
      }
    } catch {
      alert('Network error creating follow-up.');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  // Complete / Edit Follow-up State
  const [activeFollowUpToEdit, setActiveFollowUpToEdit] = useState<EnquiryDetailData['followUps'][0] | null>(null);
  const [editFollowUpStatus, setEditFollowUpStatus] = useState<'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'>('COMPLETED');
  const [editFollowUpNote, setEditFollowUpNote] = useState('');
  const [editFollowUpNextAction, setEditFollowUpNextAction] = useState('');
  const [isUpdatingFollowUp, setIsUpdatingFollowUp] = useState(false);

  const handleOpenEditFollowUp = (fu: EnquiryDetailData['followUps'][0]) => {
    setActiveFollowUpToEdit(fu);
    setEditFollowUpStatus(fu.status === 'SCHEDULED' ? 'COMPLETED' : fu.status);
    setEditFollowUpNote(fu.feedbackNote || '');
    setEditFollowUpNextAction(fu.nextActionDate ? new Date(fu.nextActionDate).toISOString().split('T')[0] : '');
  };

  const handleSaveFollowUpUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUpToEdit) return;

    setIsUpdatingFollowUp(true);
    try {
      const res = await fetch(`/api/admin/follow-ups/${activeFollowUpToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editFollowUpStatus,
          feedbackNote: editFollowUpNote.trim(),
          nextActionDate: editFollowUpNextAction ? new Date(editFollowUpNextAction).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.followUp) {
        const updated = data.data.followUp;
        setEnquiry((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            followUps: prev.followUps.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)),
          };
        });
        setActiveFollowUpToEdit(null);
      } else {
        alert(data.error?.message || 'Failed to update follow-up record.');
      }
    } catch {
      alert('Network error updating follow-up.');
    } finally {
      setIsUpdatingFollowUp(false);
    }
  };

  // Add Conversation Interaction Note
  const handleAddConversationNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !messageNote.trim()) return;

    setIsSubmittingMessage(true);
    try {
      const res = await fetch(`/api/admin/students/${enquiry.student.id}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageNote,
          channel,
          enquiryId: enquiry.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.entry) {
        const newMsg = data.data.entry;
        setEnquiry((prev) => {
          if (!prev) return null;
          const convs = [...prev.conversations];
          if (convs.length > 0) {
            convs[0] = {
              ...convs[0],
              messages: [newMsg, ...convs[0].messages],
            };
          } else {
            convs.push({
              id: 'new',
              title: 'Counselling Timeline',
              messages: [newMsg],
            });
          }
          return { ...prev, conversations: convs };
        });
        setMessageNote('');
      } else {
        alert(data.error?.message || 'Failed to record interaction note.');
      }
    } catch {
      alert('Network error saving interaction.');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const isSuperAdminOrAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (isLoading) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COUNSELOR']}>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <LoadingSpinner size="lg" text="Loading enquiry workspace..." />
        </div>
      </AdminShell>
    );
  }

  if (errorMessage || !enquiry) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COUNSELOR']}>
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-red-200 shadow-soft-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            {statusCode === 403 ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {statusCode === 403 ? 'Caseload Isolation Guard' : 'Unable to Open Enquiry'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {errorMessage || 'This enquiry record cannot be accessed.'}
          </p>
          <div className="pt-2">
            <Link href="/admin/enquiries">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Enquiries List
              </Button>
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COUNSELOR']}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Enquiries</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-mono">
                {enquiry.enquiryCode}
              </h1>
              <Badge variant={enquiry.status} size="md" />
              <span className="text-xs text-slate-400">
                Created {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center gap-2">
            <a href={`tel:${enquiry.student.phone}`}>
              <Button
                variant="emerald"
                size="sm"
                leftIcon={<Phone className="w-3.5 h-3.5" />}
              >
                Call Student
              </Button>
            </a>
            <a
              href={`https://wa.me/91${enquiry.student.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
              >
                WhatsApp
              </Button>
            </a>
            <Link href={`/admin/students/${enquiry.student.id}`}>
              <Button variant="outline" size="sm">
                Student Profile →
              </Button>
            </Link>
          </div>
        </div>

        {/* Business Status Pipeline Stepper */}
        <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Admission Pipeline Stage
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Update Status:</span>
              <select
                value={enquiry.status}
                onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
                disabled={isUpdatingStatus}
                className="text-xs font-semibold rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-emerald-500"
              >
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="CONTACTED">Contacted</option>
                <option value="COUNSELING">In Counseling</option>
                <option value="FOLLOW_UP">Follow-up Due</option>
                <option value="ADMISSION_SUPPORT">Admission Support</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-center">
            {PIPELINE_STEPS.map((step, idx) => {
              const currentIdx = PIPELINE_STEPS.indexOf(enquiry.status);
              const isPastOrCurrent = currentIdx >= idx;
              const isCurrent = enquiry.status === step;

              return (
                <div
                  key={step}
                  onClick={() => handleStatusChange(step)}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs transition-all cursor-pointer font-semibold',
                    isCurrent
                      ? 'border-brand-emerald-600 bg-brand-emerald-50 text-brand-emerald-900 ring-2 ring-brand-emerald-500/20'
                      : isPastOrCurrent
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isPastOrCurrent ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald-600" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block text-[10px]">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] block leading-tight">
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 2-Column Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Student Profile, Program & Interactions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Student Profile Overview Card */}
            <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-navy-800" />
                  <span>Student Profile Details</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Source: <strong className="text-slate-700">{enquiry.source.replace('_', ' ')}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{enquiry.student.firstName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone Number:</span>
                  <a
                    href={`tel:${enquiry.student.phone}`}
                    className="font-mono font-bold text-brand-emerald-700 hover:underline"
                  >
                    {enquiry.student.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block">Email Address:</span>
                  <span className="font-semibold text-slate-800">{enquiry.student.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">District (Tamil Nadu):</span>
                  <span className="font-semibold text-slate-800">{enquiry.student.district}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Area of Interest:</span>
                  <span className="font-semibold text-brand-navy-900">{enquiry.student.areaOfInterest}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">12th Standard Mark / Cutoff:</span>
                  <span className="font-bold text-slate-900">
                    {enquiry.student.mark12th ? `${enquiry.student.mark12th}%` : 'Not Provided'}
                  </span>
                </div>
              </div>

              {/* Data Protection / Masked Aadhaar Info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald-600" />
                  <span>
                    Aadhaar Status:{' '}
                    <strong className="text-slate-700">
                      {enquiry.student.aadhaarMasked || 'Not Collected (Feature Flag Disabled)'}
                    </strong>
                  </span>
                </div>
                <span>
                  Consent Timestamp:{' '}
                  {enquiry.student.consentGivenAt
                    ? new Date(enquiry.student.consentGivenAt).toLocaleDateString('en-IN')
                    : 'Recorded'}
                </span>
              </div>
            </Card>

            {/* Program Information Card */}
            {enquiry.program && (
              <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Building className="w-4 h-4 text-brand-emerald-600" />
                  <span>Enquired Academic Program</span>
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-brand-navy-900 text-base">
                      {enquiry.program.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Level: {enquiry.program.degreeLevel} • Duration: {enquiry.program.durationYears || 'Standard'}
                    </span>
                  </div>
                  <Link href={`/programs/${enquiry.program.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Course Page ↗
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Internal Staff Notes Card */}
            <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-gold-500" />
                  <span>Internal Staff Notes & Observations</span>
                </h3>
                {notesSuccess && (
                  <span className="text-xs font-bold text-brand-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>

              <Textarea
                rows={3}
                placeholder="Add confidential notes on student preferences, college cutoffs, budget requirements..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="text-xs"
              />

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  isLoading={isSavingNotes}
                >
                  Save Notes
                </Button>
              </div>
            </Card>

            {/* Conversation / Interaction Timeline */}
            <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-navy-800" />
                    <span>Communication & Timeline Log</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological record of calls, WhatsApp notes, and campus counseling sessions.
                  </p>
                </div>
              </div>

              {/* New Interaction Note Form */}
              <form onSubmit={handleAddConversationNote} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Record New Interaction:</span>
                  <div className="flex items-center gap-1 text-xs">
                    {(['PHONE', 'WHATSAPP', 'IN_PERSON', 'EMAIL'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannel(ch)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors',
                          channel === ch
                            ? 'bg-brand-navy-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {ch.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  rows={2}
                  placeholder="Summarize interaction discussion (e.g. Discussed cutoff norms with father; student interested in biomedical)..."
                  value={messageNote}
                  onChange={(e) => setMessageNote(e.target.value)}
                  className="text-xs bg-white"
                  required
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="emerald"
                    size="sm"
                    isLoading={isSubmittingMessage}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Add Timeline Entry
                  </Button>
                </div>
              </form>

              {/* Messages History List */}
              <div className="space-y-4 pt-2">
                {enquiry.conversations.length > 0 &&
                enquiry.conversations.some((c) => c.messages.length > 0) ? (
                  enquiry.conversations.flatMap((c) =>
                    c.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 text-xs shadow-soft-xs"
                      >
                        <div className="flex items-center justify-between text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{msg.sender.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold uppercase text-slate-600">
                              {msg.channel.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{msg.message}</p>
                      </div>
                    ))
                  )
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No communication notes recorded yet. Log the first call above.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Counselor Assignment & Follow-ups */}
          <div className="lg:col-span-4 space-y-6">
            {/* Counselor Assignment Card */}
            <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-emerald-600" />
                  <span>Counselor Assignment</span>
                </h3>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Currently Assigned:</span>
                {enquiry.assignedCounselor ? (
                  <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-brand-navy-950 text-sm block">
                      {enquiry.assignedCounselor.name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {enquiry.assignedCounselor.email}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    Unassigned — Needs Assignment
                  </div>
                )}
              </div>

              {/* Assignment Controls (Admin only) */}
              {isSuperAdminOrAdmin ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {enquiry.assignedCounselor ? 'Reassign Counselor:' : 'Assign Counselor:'}
                  </label>
                  <Select
                    value={enquiry.assignedCounselor?.id || ''}
                    onChange={(e) => handleAssignCounselor(e.target.value)}
                    disabled={isUpdatingAssignment}
                    options={[
                      { value: '', label: 'Select Counselor...' },
                      ...counselors.map((c) => ({
                        value: c.id,
                        label: `${c.name} (Active: ${c.activeCaseload})`,
                      })),
                    ]}
                  />
                  <p className="text-[11px] text-slate-400">
                    Only Administrators can assign or reassign cases.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Counselor assignment is managed by the administrative team.
                </p>
              )}
            </Card>

            {/* Follow-up Scheduler Card */}
            <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-gold-500" />
                  <span>Scheduled Follow-ups</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                  className="h-7 text-xs px-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Schedule Follow-up Form */}
              {showFollowUpForm && (
                <form
                  onSubmit={handleCreateFollowUp}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Scheduled Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Objective / Note
                    </label>
                    <Input
                      placeholder="e.g. Follow-up on community certificate"
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFollowUpForm(false)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="emerald"
                      size="sm"
                      className="h-7 text-xs"
                      isLoading={isSubmittingFollowUp}
                    >
                      Schedule
                    </Button>
                  </div>
                </form>
              )}

              {/* Follow-up History */}
              <div className="space-y-3">
                {enquiry.followUps.length > 0 ? (
                  enquiry.followUps.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-2 shadow-soft-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {new Date(f.scheduledAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                            f.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : f.status === 'MISSED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : f.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          )}
                        >
                          {f.status}
                        </span>
                      </div>
                      {f.feedbackNote && (
                        <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {f.feedbackNote}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        {f.counselor ? (
                          <span className="text-slate-400">
                            Counselor: {f.counselor.name}
                          </span>
                        ) : <span />}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2 gap-1 text-slate-700 hover:text-brand-navy-950"
                          onClick={() => handleOpenEditFollowUp(f)}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{f.status === 'SCHEDULED' ? 'Complete / Log Outcome' : 'Edit Outcome'}</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No follow-ups scheduled yet.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Modal for Completing / Updating Follow-Up */}
        <Modal
          isOpen={!!activeFollowUpToEdit}
          onClose={() => setActiveFollowUpToEdit(null)}
          title="Update Follow-up & Record Outcome"
          description="Log consultation feedback, mark completion status, or reschedule for prospective student."
        >
          {activeFollowUpToEdit && (
            <form onSubmit={handleSaveFollowUpUpdate} className="space-y-4 pt-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Follow-up Status</label>
                <select
                  value={editFollowUpStatus}
                  onChange={(e) =>
                    setEditFollowUpStatus(
                      e.target.value as 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-emerald-500"
                >
                  <option value="COMPLETED">Completed (Consultation Conducted)</option>
                  <option value="SCHEDULED">Scheduled (Pending)</option>
                  <option value="MISSED">Missed (Could Not Reach Student)</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Consultation Outcome / Feedback Notes *
                </label>
                <Textarea
                  rows={3}
                  placeholder="Record summary of discussion (e.g. Discussed fee scholarship; student preparing 12th marksheet copy for admission support)..."
                  value={editFollowUpNote}
                  onChange={(e) => setEditFollowUpNote(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Next Action Date (Optional)
                </label>
                <input
                  type="date"
                  value={editFollowUpNextAction}
                  onChange={(e) => setEditFollowUpNextAction(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFollowUpToEdit(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  isLoading={isUpdatingFollowUp}
                >
                  Save Outcome
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AdminShell>
  );
}
