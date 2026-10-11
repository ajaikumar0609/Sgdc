'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { RefreshCw, Search, Eye, Filter } from 'lucide-react';
import Link from 'next/link';

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  status: string;
  receiptNumber?: string;
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/donations?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setDonations(data.data.donations || []);
      } else {
        setDonations([]);
      }
    } catch {
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDonations();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return 'emerald';
      case 'FAILED': return 'danger';
      case 'PENDING': return 'warning';
      case 'INITIATED': return 'navy';
      case 'REFUNDED': return 'default';
      default: return 'default';
    }
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                Donation Records
              </h1>
              <Badge variant="navy" size="sm">
                {donations.length} Records
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View and audit donation transactions and payment statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDonations}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor name, email, or receipt..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy-500/20 focus:border-brand-navy-500 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="w-full md:w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy-500/20 focus:border-brand-navy-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="INITIATED">Initiated</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <Button type="button" variant="primary" onClick={loadDonations}>
              Filter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <LoadingSpinner size="md" text="Loading donations..." />
          </div>
        ) : donations.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Donor</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Receipt</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{donation.donorName}</span>
                      <span className="text-[11px] text-slate-500 block">{donation.donorEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {donation.currency} {parseFloat(donation.amount.toString()).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(donation.status)} size="sm">
                        {donation.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                      {donation.receiptNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link href={`/admin/donations/${donation.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <EmptyState
              title="No Donations Found"
              description="There are no donations matching your criteria."
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
