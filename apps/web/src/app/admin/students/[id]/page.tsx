'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface StudentDetail {
  id: string;
  firstName: string;
  phone: string;
  email: string;
  address?: string | null;
  district: string;
  areaOfInterest?: string | null;
  mark12th?: string | null;
  consentGiven: boolean;
  consentGivenAt?: string | null;
  aadhaarMasked?: string | null;
  createdAt: string;
  updatedAt: string;
  program?: {
    id: string;
    name: string;
    degreeLevel: string;
    durationYears: number;
  } | null;
  enquiries: Array<{
    id: string;
    enquiryCode: string;
    status: string;
    source: string;
    createdAt: string;
    assignedCounselor?: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
  followUps: Array<{
    id: string;
    scheduledAt: string;
    completedAt?: string | null;
    status: string;
    feedbackNote?: string | null;
    nextActionDate?: string | null;
    counselor?: {
      id: string;
      name: string;
    } | null;
  }>;
}

interface ConversationItem {
  id: string;
  title?: string | null;
  enquiry?: {
    id: string;
    enquiryCode: string;
    status: string;
  } | null;
  messages: Array<{
    id: string;
    channel: 'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL';
    message: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      role: string;
    };
  }>;
}

export default function AdminStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  // Privacy toggles
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState(false);

  // New interaction form state
  const [newChannel, setNewChannel] = useState<'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL'>('PHONE');
  const [newMessage, setNewMessage] = useState('');
  const [submittingInteraction, setSubmittingInteraction] = useState(false);
  const [interactionSuccess, setInteractionSuccess] = useState(false);

  const fetchStudentData = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);

      const [resStudent, resConv] = await Promise.all([
        fetch(`/api/admin/students/${studentId}`),
        fetch(`/api/admin/students/${studentId}/conversations`),
      ]);

      if (resStudent.status === 403 || resConv.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      if (!resStudent.ok) {
        if (resStudent.status === 404) throw new Error('Student profile not found.');
        throw new Error('Failed to retrieve student profile.');
      }

      const jsonStudent = await resStudent.json();
      if (jsonStudent.success && jsonStudent.data?.student) {
        setStudent(jsonStudent.data.student);
      }

      if (resConv.ok) {
        const jsonConv = await resConv.json();
        if (jsonConv.success && jsonConv.data?.conversations) {
          setConversations(jsonConv.data.conversations);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading student profile.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || submittingInteraction) return;

    try {
      setSubmittingInteraction(true);
      const activeEnquiryId = student?.enquiries?.[0]?.id;

      const res = await fetch(`/api/admin/students/${studentId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: newChannel,
          message: newMessage.trim(),
          enquiryId: activeEnquiryId,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Failed to record interaction.');
      }

      setNewMessage('');
      setInteractionSuccess(true);
      setTimeout(() => setInteractionSuccess(false), 3000);
      fetchStudentData();
    } catch (err: any) {
      alert(err.message || 'Failed to add interaction');
    } finally {
      setSubmittingInteraction(false);
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'PHONE':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Phone Call</Badge>;
      case 'WHATSAPP':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">WhatsApp</Badge>;
      case 'IN_PERSON':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">In-Person</Badge>;
      case 'EMAIL':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Email</Badge>;
      default:
        return <Badge variant="outline">{channel}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      NEW: { label: 'New', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      ASSIGNED: { label: 'Assigned', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      CONTACTED: { label: 'Contacted', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      COUNSELING: { label: 'Counseling', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      FOLLOW_UP: { label: 'Follow Up', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      ADMISSION_SUPPORT: { label: 'Admission Support', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      CONVERTED: { label: 'Converted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    const s = map[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return <Badge variant="outline" className={`${s.className} text-xs font-semibold`}>{s.label}</Badge>;
  };

  // Flattened messages from all conversations
  const allMessages = conversations.flatMap((c) =>
    c.messages.map((m) => ({
      ...m,
      enquiryCode: c.enquiry?.enquiryCode,
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (forbidden) {
    return (
      <AdminShell>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="p-8 border-rose-300 bg-rose-50 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-rose-900">Caseload Isolation Guard</h2>
            <p className="text-sm text-rose-700 leading-relaxed">
              You do not have authorization to view this student profile. Under internal counselling policy,
              counselor accounts can only access students with enquiries assigned directly to them.
            </p>
            <div className="pt-2">
              <Link href="/admin/students">
                <Button variant="outline" className="border-rose-300 text-rose-800 hover:bg-rose-100">
                  Return to My Students
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/students">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Students
              </Button>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {student ? student.firstName : 'Loading...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStudentData()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-200">
            <LoadingSpinner size="lg" className="text-brand-600" />
            <p className="text-sm font-medium text-gray-500">Loading student dossier from secure storage...</p>
          </div>
        ) : error || !student ? (
          <Card className="p-8 text-center bg-rose-50 border-rose-200">
            <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{error || 'Student not found.'}</p>
            <Link href="/admin/students">
              <Button size="sm" variant="outline" className="mt-4">
                Back to Student Directory
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 Cols) - Student Demographic & Academic Dossier */}
            <div className="lg:col-span-5 space-y-6">
              {/* Profile Overview Card */}
              <Card className="p-6 bg-white shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center text-2xl font-bold">
                    {student.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 truncate">{student.firstName}</h1>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {student.id}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        {student.district || 'Tamil Nadu'}
                      </span>
                      {student.consentGiven && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Consent Given
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Contact Coordinates
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      Phone Number
                    </span>
                    <a
                      href={`tel:${student.phone}`}
                      className="font-semibold text-brand-600 hover:text-brand-700 font-mono"
                    >
                      {student.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Email Address
                    </span>
                    <a
                      href={`mailto:${student.email}`}
                      className="font-medium text-gray-800 hover:text-brand-600 truncate max-w-[200px]"
                      title={student.email}
                    >
                      {student.email}
                    </a>
                  </div>

                  {student.address && (
                    <div className="pt-2 text-sm">
                      <span className="text-gray-500 block text-xs">Residential Address:</span>
                      <p className="font-medium text-gray-800 mt-0.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200/70 text-xs">
                        {student.address}
                      </p>
                    </div>
                  )}
                </div>

                {/* Academic Profile */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Academic Background & Aspiration
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      12th Mark / Percentage
                    </span>
                    {student.mark12th ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {student.mark12th}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not recorded</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      Area of Interest
                    </span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {student.areaOfInterest || 'General Counselling'}
                    </span>
                  </div>

                  {student.program && (
                    <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-100 text-xs space-y-1">
                      <p className="font-bold text-brand-900">{student.program.name}</p>
                      <p className="text-brand-700">
                        Level: {student.program.degreeLevel} • {student.program.durationYears} Years
                      </p>
                    </div>
                  )}
                </div>

                {/* Privacy & Aadhaar Compliance Box */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        Aadhaar Compliance (Privacy Act)
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMaskedAadhaar(!showMaskedAadhaar)}
                        className="text-amber-800 hover:text-amber-950 text-xs flex items-center gap-1 font-medium"
                      >
                        {showMaskedAadhaar ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Reveal Masked
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-white p-2 rounded border border-amber-200/80 font-mono text-center text-xs text-gray-800">
                      {showMaskedAadhaar
                        ? student.aadhaarMasked || 'XXXX-XXXX-NOT-PROVIDED'
                        : '•••• •••• •••• (Protected)'}
                    </div>

                    <p className="text-[11px] text-amber-800 leading-tight">
                      Plaintext Aadhaar is strictly never transmitted or displayed in accordance with UIDAI and DPDP
                      guidelines.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Related Enquiries for this Student */}
              <Card className="p-5 bg-white shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>Admission Enquiries</span>
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
                      {student.enquiries?.length || 0}
                    </Badge>
                  </h3>
                </div>

                {student.enquiries?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No enquiries registered for this student yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {student.enquiries.map((enq) => (
                      <Link
                        key={enq.id}
                        href={`/admin/enquiries/${enq.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/20 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-gray-900 group-hover:text-brand-600">
                            {enq.enquiryCode}
                          </span>
                          {getStatusBadge(enq.status)}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>Counselor: {enq.assignedCounselor?.name || 'Unassigned'}</span>
                          <span className="text-[11px]">
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column (7 Cols) - Interaction Timeline & Follow-up History */}
            <div className="lg:col-span-7 space-y-6">
              {/* Interaction Recording Card */}
              <Card className="p-5 bg-white shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-brand-600" />
                  Log Communication / Interaction
                </h3>

                <form onSubmit={handleAddInteraction} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="w-full sm:w-44">
                      <Select
                        value={newChannel}
                        onChange={(e) =>
                          setNewChannel(e.target.value as 'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL')
                        }
                        className="h-9 text-xs"
                      >
                        <option value="PHONE">📞 Phone Call</option>
                        <option value="WHATSAPP">💬 WhatsApp</option>
                        <option value="IN_PERSON">🤝 In-Person Visit</option>
                        <option value="EMAIL">✉️ Email</option>
                      </Select>
                    </div>
                    <span className="text-xs text-gray-400">
                      Channel for recording student touchpoint
                    </span>
                  </div>

                  <Textarea
                    placeholder="Enter counselling summary, notes, student queries, or commitments discussed..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="text-xs resize-none"
                    required
                  />

                  <div className="flex items-center justify-between pt-1">
                    {interactionSuccess ? (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Interaction successfully saved!
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">
                        Visible to authorized staff in conversation chronology
                      </span>
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newMessage.trim() || submittingInteraction}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submittingInteraction ? 'Recording...' : 'Log Interaction'}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Follow-up Track Record */}
              <Card className="p-5 bg-white shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Follow-Up Track Record</span>
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      {student.followUps?.length || 0}
                    </Badge>
                  </h3>
                  {student.enquiries?.[0] && (
                    <Link href={`/admin/enquiries/${student.enquiries[0].id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-brand-600 gap-1">
                        Schedule Follow-Up &rarr;
                      </Button>
                    </Link>
                  )}
                </div>

                {student.followUps?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No follow-ups recorded yet for this student.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {student.followUps.map((fu) => (
                      <div
                        key={fu.id}
                        className="p-3 bg-gray-50/70 rounded-lg border border-gray-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(fu.scheduledAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[11px] ${
                              fu.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : fu.status === 'MISSED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {fu.status}
                          </Badge>
                        </div>
                        {fu.feedbackNote && (
                          <p className="text-gray-700 bg-white p-2 rounded border border-gray-100">
                            {fu.feedbackNote}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                          <span>Counselor: {fu.counselor?.name || 'Staff'}</span>
                          {fu.nextActionDate && (
                            <span>
                              Next: {new Date(fu.nextActionDate).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Chronological Communication Timeline */}
              <Card className="p-5 bg-white shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-brand-600" />
                    <span>Conversation Timeline</span>
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
                      {allMessages.length} {allMessages.length === 1 ? 'Touchpoint' : 'Touchpoints'}
                    </Badge>
                  </h3>
                </div>

                {allMessages.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No conversation timeline entries recorded yet. Use the form above to log the first interaction.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {allMessages.map((msg) => (
                      <div key={msg.id} className="relative group">
                        {/* Timeline Bullet */}
                        <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-600 shadow-sm" />

                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getChannelBadge(msg.channel)}
                              <span className="text-xs font-semibold text-gray-900">
                                {msg.sender.name}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                ({msg.sender.role.replace('_', ' ')})
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>

                          {msg.enquiryCode && (
                            <div className="pt-1 text-[11px] text-gray-400 border-t border-gray-100">
                              Linked Enquiry: <strong className="font-mono text-gray-600">{msg.enquiryCode}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
