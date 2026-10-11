'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface ImpactItem {
  id: string;
  metricKey: string;
  numberLabel: string;
  title: string;
  description?: string;
  displayOrder: number;
  status: string;
  updatedAt: string;
}

export default function AdminImpactPage() {
  const [stats, setStats] = useState<ImpactItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/welfare/impact`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStats(data.data.statistics || []);
      } else {
        setStats([]);
      }
    } catch {
      setStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleTogglePublish = async (stat: ImpactItem) => {
    setTogglingId(stat.id);
    const newStatus = stat.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/welfare/impact/${stat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStats((prev) =>
          prev.map((s) =>
            s.id === stat.id ? { ...s, status: newStatus } : s
          )
        );
      } else {
        alert(data.error?.message || 'Failed to update status.');
      }
    } catch {
      alert('Network error while toggling status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                Impact Statistics CMS
              </h1>
              <Badge variant="navy" size="sm">
                {stats.length} Metrics
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage the public impact metrics shown on the website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <LoadingSpinner size="md" text="Loading impact metrics..." />
          </div>
        ) : stats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.id} className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="navy" size="sm">{stat.metricKey}</Badge>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(stat)}
                    disabled={togglingId === stat.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                      stat.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {stat.status === 'PUBLISHED' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-amber-600" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-brand-navy-900 font-heading">
                    {stat.numberLabel}
                  </h3>
                  <p className="font-bold text-brand-emerald-700 mt-1">
                    {stat.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {stat.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <EmptyState
              title="No Impact Statistics Found"
              description="No impact metrics exist in the database."
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
