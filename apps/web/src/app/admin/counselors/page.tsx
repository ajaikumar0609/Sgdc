'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  UserCheck,
  Users,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Activity,
} from 'lucide-react';

interface CounselorItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  activeCaseload: number;
}

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState<CounselorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounselors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/counselors');
      if (!res.ok) {
        if (res.status === 403) throw new Error('Access denied. Admin privileges required.');
        throw new Error('Failed to load counselor team directory.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setCounselors(json.data.counselors || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading counselors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounselors();
  }, [fetchCounselors]);

  const totalActiveCases = counselors.reduce((acc, c) => acc + c.activeCaseload, 0);

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Counselling Team & Workload</h1>
              <Badge variant="outline" className="text-xs bg-brand-50 text-brand-700 border-brand-200">
                {counselors.length} Counselors
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Active staff members assigned to prospective students, admissions guidance, and follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCounselors()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin/enquiries">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white gap-2">
                All Enquiries
              </Button>
            </Link>
          </div>
        </div>

        {/* Workload Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Active Caseload Total</p>
                <p className="text-2xl font-bold text-brand-700 mt-1">{totalActiveCases}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Active Counselors</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">{counselors.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Avg Cases / Counselor</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {counselors.length ? (totalActiveCases / counselors.length).toFixed(1) : '0'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Counselor Cards */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-200">
            <LoadingSpinner size="lg" className="text-brand-600" />
            <p className="text-sm font-medium text-gray-500">Loading counselor team metrics...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center bg-rose-50 border-rose-200">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCounselors()}
              className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </Card>
        ) : counselors.length === 0 ? (
          <EmptyState
            title="No counselors found"
            description="No active staff members with the COUNSELOR role are configured in the system."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {counselors.map((counselor) => (
              <Card
                key={counselor.id}
                className="p-5 shadow-sm border border-gray-200 bg-white hover:border-brand-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-lg">
                      {counselor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{counselor.name}</h3>
                      <Badge variant="outline" className="text-[11px] bg-indigo-50 text-indigo-700 border-indigo-200 mt-0.5">
                        Counselor
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-2xl font-bold text-gray-900">
                      {counselor.activeCaseload}
                    </span>
                    <span className="text-[11px] text-gray-400 uppercase font-medium">
                      Active Cases
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <a
                      href={`mailto:${counselor.email}`}
                      className="hover:text-brand-600 truncate"
                    >
                      {counselor.email}
                    </a>
                  </div>
                  {counselor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <a href={`tel:${counselor.phone}`} className="hover:text-brand-600">
                        {counselor.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/admin/enquiries?counselor=${counselor.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-brand-700 border-brand-200 hover:bg-brand-50 gap-1.5"
                    >
                      <span>Filter Assigned Enquiries</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
