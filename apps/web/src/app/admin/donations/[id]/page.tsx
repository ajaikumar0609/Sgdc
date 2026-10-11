'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  gatewayReference: string | null;
  gatewayName: string;
  amount: number;
  paymentStatus: string;
  rawResponse: string | null;
  createdAt: string;
}

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string | null;
  amount: number;
  currency: string;
  supportCategory: string;
  status: string;
  receiptNumber: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

export default function AdminDonationDetailsPage({ params }: { params: { id: string } }) {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDonation = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/donations/${params.id}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setDonation(data.data.donation);
      } else {
        setDonation(null);
      }
    } catch {
      setDonation(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadDonation();
  }, [loadDonation]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL':
      case 'COMPLETED': return 'emerald';
      case 'FAILED': return 'danger';
      case 'PENDING': return 'warning';
      case 'INITIATED': return 'navy';
      case 'REFUNDED': return 'default';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading donation details..." />
        </div>
      </AdminShell>
    );
  }

  if (!donation) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Donation Not Found</h2>
          <p className="text-slate-500 mt-2 mb-6">The donation record you are looking for does not exist.</p>
          <Link href="/admin/donations">
            <Button variant="outline">Back to Donations</Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/donations">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                  Donation #{donation.id.slice(-6).toUpperCase()}
                </h1>
                <Badge variant={getStatusBadgeVariant(donation.status)} size="sm">
                  {donation.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Initiated on {new Date(donation.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDonation}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                Donor Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="font-semibold text-slate-900">{donation.donorName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="font-semibold text-slate-900">{donation.donorEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="font-semibold text-slate-900">{donation.donorPhone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Anonymity</p>
                  <p className="font-semibold text-slate-900">
                    {donation.isAnonymous ? 'Requested Anonymous' : 'Public'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Transaction Lifecycle</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </h2>
              {donation.transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No transactions recorded.</p>
              ) : (
                <div className="space-y-4">
                  {donation.transactions.map((tx, idx) => (
                    <div key={tx.id} className={`p-4 rounded-lg border ${idx === 0 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'} text-sm`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant={getStatusBadgeVariant(tx.paymentStatus)} size="sm">
                            {tx.paymentStatus}
                          </Badge>
                          <span className="ml-2 font-bold text-slate-700">{tx.gatewayName}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-slate-500">Tx ID:</span> <span className="font-mono text-slate-700">{tx.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Amount:</span> <span className="font-semibold text-slate-800">{donation.currency} {parseFloat(tx.amount.toString()).toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">Gateway Ref:</span> <span className="font-mono text-slate-700">{tx.gatewayReference || 'None'}</span>
                        </div>
                      </div>
                      {tx.rawResponse && (
                        <div className="mt-3">
                          <span className="text-xs text-slate-500 mb-1 block">Webhook Payload:</span>
                          <pre className="text-[10px] bg-slate-800 text-slate-200 p-2 rounded overflow-x-auto">
                            {tx.rawResponse}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Donation Amount</h2>
              <p className="text-4xl font-black text-brand-gold-400 tracking-tight">
                <span className="text-2xl mr-1">{donation.currency}</span>
                {parseFloat(donation.amount.toString()).toLocaleString()}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Category</p>
                  <p className="font-semibold">{donation.supportCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Receipt Number</p>
                  <p className="font-semibold font-mono text-brand-emerald-400">{donation.receiptNumber || 'Not generated'}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">Sandbox Mode</h3>
                  <p className="text-xs text-amber-800 mt-1">
                    Payments are not actively processed. Transactions are recorded for audit and verification purposes only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
