'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Dashboard Components
import { KpiCard } from '@/components/admin/dashboard/kpi-card';
import { TrendChart } from '@/components/admin/dashboard/trend-chart';
import { StatusChart } from '@/components/admin/dashboard/status-chart';
import { DistributionBars } from '@/components/admin/dashboard/distribution-bars';
import { UrgentFollowups } from '@/components/admin/dashboard/urgent-followups';
import { CounselorWorkloadWidget } from '@/components/admin/dashboard/counselor-workload-widget';
import { RecentEnquiriesWidget } from '@/components/admin/dashboard/recent-enquiries-widget';
import { RecentActivityWidget } from '@/components/admin/dashboard/recent-activity-widget';

import {
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  MapPin,
  RefreshCw,
  PlusCircle,
  FileText,
  CalendarCheck,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface DashboardReportData {
  scope: {
    role: string;
    counselorId: string | null;
    period: '7d' | '30d' | '90d';
  };
  kpis: {
    totalEnquiries: number;
    newEnquiries: number;
    activeEnquiries: number;
    followupsDue: number;
    counselingCases: number;
    admissionSupportCases: number;
    convertedEnquiries: number;
    closedEnquiries: number;
  };
  followUpSummary: {
    overdue: number;
    dueToday: number;
    upcoming: number;
    totalPending: number;
    urgentList: any[];
  };
  trend: Array<{ date: string; label: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  programDistribution: Array<{
    programId: string | null;
    name: string;
    degreeLevel: string;
    count: number;
    percentage: number;
  }>;
  districtDistribution: Array<{ district: string; count: number; percentage: number }>;
  counselorWorkload: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    activeCaseload: number;
    totalAssigned: number;
    counselingCount: number;
    convertedCount: number;
    overdueFollowups: number;
  }>;
  recentEnquiries: any[];
  recentActivity: any[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('period', period);

      const res = await fetch(`/api/admin/reports/dashboard?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please log in again.');
        if (res.status === 403) throw new Error('Access denied: Staff authorization required.');
        throw new Error('Failed to retrieve dashboard analytics.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        throw new Error('Invalid dashboard data response.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const isCounselor = user?.role === 'COUNSELOR';

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COUNSELOR']}>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* A. Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {isCounselor ? 'My Counselling Dashboard' : 'Operations & Admissions Overview'}
              </h1>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  isCounselor
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-brand-50 text-brand-700 border-brand-200'
                }`}
              >
                {user?.role?.replace(/_/g, ' ') || 'STAFF'}
              </Badge>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {isCounselor
                ? `Welcome back, ${user?.name}. Here is your active caseload, pending follow-ups, and student touchpoints.`
                : `Real-time executive oversight across student enquiries, counselor caseloads, and admission pathways.`}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {lastRefreshed && (
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                Synced at {lastRefreshed}
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={loading || refreshing}
              className="gap-2 text-xs h-9 border-gray-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Link href="/admin/enquiries">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white text-xs h-9 gap-1.5 shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                <span>Enquiries CRM</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Integrity & Ethical Notice Banner */}
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/70 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>Operational Data Notice:</strong> All figures are calculated from genuine PostgreSQL records. In
            accordance with organizational standards, enquiry counts represent prospective student guidance touchpoints
            and are not treated as verified institutional admissions or external success benchmarks.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <Card className="p-6 bg-rose-50 border-rose-200 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchDashboardData()}
              className="border-rose-300 text-rose-700 hover:bg-rose-100 text-xs"
            >
              Retry Connection
            </Button>
          </Card>
        )}

        {/* B. KPI Summary Cards (8 Precise Metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Enquiries"
            value={data?.kpis.totalEnquiries ?? 0}
            subtitle={isCounselor ? 'Assigned to your caseload' : 'Organization-wide tally'}
            icon={<Users className="h-5 w-5 text-brand-600" />}
            borderColorClass="border-l-brand-600"
            href="/admin/enquiries"
            isLoading={loading}
          />

          <KpiCard
            title="New Enquiries"
            value={data?.kpis.newEnquiries ?? 0}
            subtitle="Awaiting initial counselor contact"
            icon={<Sparkles className="h-5 w-5 text-blue-600" />}
            badge={{ text: 'Stage 1', className: 'bg-blue-50 text-blue-700 border-blue-200' }}
            borderColorClass="border-l-blue-600"
            href="/admin/enquiries?status=NEW"
            isLoading={loading}
          />

          <KpiCard
            title="Active Pipeline"
            value={data?.kpis.activeEnquiries ?? 0}
            subtitle="In progress (excludes closed/converted)"
            icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
            borderColorClass="border-l-indigo-600"
            href="/admin/enquiries"
            isLoading={loading}
          />

          <KpiCard
            title="Follow-Ups Due"
            value={data?.kpis.followupsDue ?? 0}
            subtitle={`${data?.followUpSummary.overdue ?? 0} overdue • ${data?.followUpSummary.dueToday ?? 0} due today`}
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            badge={{
              text: data?.followUpSummary.overdue ? `${data.followUpSummary.overdue} Overdue` : 'Pending',
              className: data?.followUpSummary.overdue
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200',
            }}
            borderColorClass="border-l-amber-500"
            href="/admin/follow-ups?status=SCHEDULED"
            isLoading={loading}
          />

          <KpiCard
            title="In Counselling"
            value={data?.kpis.counselingCases ?? 0}
            subtitle="Under active higher education advice"
            icon={<BookOpen className="h-5 w-5 text-amber-600" />}
            badge={{ text: 'Stage 4', className: 'bg-amber-50 text-amber-700 border-amber-200' }}
            borderColorClass="border-l-amber-600"
            href="/admin/enquiries?status=COUNSELING"
            isLoading={loading}
          />

          <KpiCard
            title="Admission Support"
            value={data?.kpis.admissionSupportCases ?? 0}
            subtitle="College selection & document stage"
            icon={<FileText className="h-5 w-5 text-purple-600" />}
            badge={{ text: 'Stage 6', className: 'bg-purple-50 text-purple-700 border-purple-200' }}
            borderColorClass="border-l-purple-600"
            href="/admin/enquiries?status=ADMISSION_SUPPORT"
            isLoading={loading}
          />

          <KpiCard
            title="Converted Enquiries"
            value={data?.kpis.convertedEnquiries ?? 0}
            subtitle="Successfully finalized admission path"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            badge={{ text: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }}
            borderColorClass="border-l-emerald-600"
            href="/admin/enquiries?status=CONVERTED"
            isLoading={loading}
          />

          <KpiCard
            title="Closed Cases"
            value={data?.kpis.closedEnquiries ?? 0}
            subtitle="Opted out, relocated, or inactive"
            icon={<Users className="h-5 w-5 text-gray-400" />}
            borderColorClass="border-l-gray-400"
            href="/admin/enquiries?status=CLOSED"
            isLoading={loading}
          />
        </div>

        {/* C & D. Inflow Trends & Pipeline Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <TrendChart
              data={data?.trend || []}
              period={period}
              onPeriodChange={(p) => setPeriod(p)}
              isLoading={loading}
            />
          </div>

          <div className="lg:col-span-5">
            <StatusChart
              data={data?.statusDistribution || []}
              total={data?.kpis.totalEnquiries || 0}
              isLoading={loading}
            />
          </div>
        </div>

        {/* H. Urgent Follow-ups Widget */}
        <UrgentFollowups
          items={data?.followUpSummary.urgentList || []}
          overdueCount={data?.followUpSummary.overdue || 0}
          dueTodayCount={data?.followUpSummary.dueToday || 0}
          isLoading={loading}
        />

        {/* E & F. Program & District Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <DistributionBars
              title="Academic Program Interest"
              subtitle="Breakdown of student career aspirations and course inquiries"
              icon={<GraduationCap className="h-4 w-4 text-brand-600" />}
              items={(data?.programDistribution || []).map((p) => ({
                name: p.name,
                count: p.count,
                percentage: p.percentage,
                sublabel: p.degreeLevel,
                linkParam: p.name,
              }))}
              color="#0F2C59"
              filterParamName="search"
              isLoading={loading}
            />
          </div>

          <div className="lg:col-span-6">
            <DistributionBars
              title="Tamil Nadu District Reach"
              subtitle="Geographic concentration of prospective students"
              icon={<MapPin className="h-4 w-4 text-emerald-600" />}
              items={(data?.districtDistribution || []).map((d) => ({
                name: d.district,
                count: d.count,
                percentage: d.percentage,
                linkParam: d.district,
              }))}
              color="#2E7D32"
              filterParamName="district"
              isLoading={loading}
            />
          </div>
        </div>

        {/* G. Counselor Caseload Widget */}
        <CounselorWorkloadWidget
          counselors={data?.counselorWorkload || []}
          userRole={user?.role}
          isLoading={loading}
        />

        {/* I & J. Recent Enquiries & Operational Activity Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RecentEnquiriesWidget
              enquiries={data?.recentEnquiries || []}
              isLoading={loading}
            />
          </div>

          <div className="lg:col-span-5">
            <RecentActivityWidget
              activities={data?.recentActivity || []}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
