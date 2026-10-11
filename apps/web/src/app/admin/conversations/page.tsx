'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  MessageSquare,
  Phone,
  Mail,
  User,
  Users,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ConversationEntry {
  id: string;
  student: {
    id: string;
    firstName: string;
    phone: string;
    district: string;
    areaOfInterest?: string | null;
  };
  enquiry?: {
    id: string;
    enquiryCode: string;
    status: string;
    assignedCounselorId?: string | null;
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

interface FlattenedMessage {
  id: string;
  channel: 'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL';
  message: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  student: ConversationEntry['student'];
  enquiry?: ConversationEntry['enquiry'];
}

export default function AdminConversationsPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/conversations');
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please log in.');
        if (res.status === 403) throw new Error('Access denied to conversations log.');
        throw new Error('Failed to load conversation history.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setConversations(json.data.conversations || []);
      } else {
        setConversations([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Flatten messages into a unified chronological feed
  const allMessages: FlattenedMessage[] = conversations.flatMap((conv) =>
    conv.messages.map((msg) => ({
      ...msg,
      student: conv.student,
      enquiry: conv.enquiry,
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter messages
  const filteredMessages = allMessages.filter((msg) => {
    if (channelFilter !== 'ALL' && msg.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchStudent =
        msg.student?.firstName.toLowerCase().includes(q) ||
        msg.student?.phone.includes(q) ||
        msg.student?.district?.toLowerCase().includes(q);
      const matchStaff = msg.sender.name.toLowerCase().includes(q);
      const matchContent = msg.message.toLowerCase().includes(q);
      const matchEnquiry = msg.enquiry?.enquiryCode?.toLowerCase().includes(q);
      return matchStudent || matchStaff || matchContent || matchEnquiry;
    }
    return true;
  });

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'PHONE':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs gap-1 font-semibold">
            <Phone className="h-3 w-3 text-blue-600" /> Phone Call
          </Badge>
        );
      case 'WHATSAPP':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1 font-semibold">
            💬 WhatsApp
          </Badge>
        );
      case 'IN_PERSON':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs gap-1 font-semibold">
            🤝 In-Person
          </Badge>
        );
      case 'EMAIL':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1 font-semibold">
            <Mail className="h-3 w-3 text-amber-600" /> Email
          </Badge>
        );
      default:
        return <Badge variant="outline">{channel}</Badge>;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interaction Timeline</h1>
              <Badge variant="outline" className="text-xs bg-brand-50 text-brand-700 border-brand-200">
                {filteredMessages.length} {filteredMessages.length === 1 ? 'Touchpoint' : 'Touchpoints'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'COUNSELOR'
                ? 'Chronological activity log of interactions across your assigned students.'
                : 'Audited log of student touchpoints, calls, and counselling notes across all channels.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchConversations()}
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

        {/* Filters */}
        <Card className="p-4 shadow-sm bg-white border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Channel Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs">
              {(['ALL', 'PHONE', 'WHATSAPP', 'IN_PERSON', 'EMAIL'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannelFilter(ch)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    channelFilter === ch
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {ch === 'ALL'
                    ? 'All Channels'
                    : ch === 'PHONE'
                    ? '📞 Phone'
                    : ch === 'WHATSAPP'
                    ? '💬 WhatsApp'
                    : ch === 'IN_PERSON'
                    ? '🤝 In-Person'
                    : '✉️ Email'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search notes, student, or staff..."
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
            <p className="text-sm font-medium text-gray-500">Retrieving conversation records...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center bg-rose-50 border-rose-200">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchConversations()}
              className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            title="No interaction records found"
            description={
              channelFilter !== 'ALL' || search
                ? 'No interaction notes match your active filter criteria.'
                : 'There are currently no recorded interactions in your accessible caseload.'
            }
            action={
              (channelFilter !== 'ALL' || search) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setChannelFilter('ALL');
                    setSearch('');
                  }}
                >
                  Reset Filter
                </Button>
              )
            }
          />
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="relative group">
                {/* Timeline Bullet */}
                <div className="absolute -left-6 sm:-left-8 top-3 h-4 w-4 rounded-full border-2 border-white bg-brand-600 shadow-sm" />

                <Card className="p-5 bg-white shadow-sm border border-gray-200 hover:border-brand-200 transition-all space-y-3">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getChannelBadge(msg.channel)}
                      <span className="text-xs font-bold text-gray-900">{msg.sender.name}</span>
                      <span className="text-[11px] text-gray-400">
                        ({msg.sender.role.replace('_', ' ')})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(msg.createdAt).toLocaleString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {/* Student & Enquiry Context Bar */}
                  <div className="pt-2 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/students/${msg.student.id}`}
                        className="font-bold text-gray-900 hover:text-brand-600 flex items-center gap-1"
                      >
                        <User className="h-3 w-3 text-gray-400" />
                        {msg.student.firstName}
                      </Link>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 font-mono text-[11px] flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {msg.student.phone}
                      </span>
                      {msg.student.district && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-[11px] flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {msg.student.district}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {msg.enquiry && (
                        <Link
                          href={`/admin/enquiries/${msg.enquiry.id}`}
                          className="font-mono text-[11px] font-semibold text-brand-600 hover:underline bg-brand-50 px-2 py-0.5 rounded border border-brand-200"
                        >
                          {msg.enquiry.enquiryCode}
                        </Link>
                      )}
                      <Link href={`/admin/students/${msg.student.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 p-1"
                        >
                          Profile &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
