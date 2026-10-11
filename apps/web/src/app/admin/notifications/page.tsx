'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isReadFilter, setIsReadFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (isReadFilter !== 'all') {
        params.append('isRead', isReadFilter);
      }
      
      if (typeFilter) {
        params.append('type', typeFilter);
      }

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load notifications');
      
      const { data } = await res.json();
      setNotifications(data.notifications);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/unread`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
      }
    } catch (err) {
      console.error('Failed to mark as unread', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ENQUIRY_NEW': return <Badge variant="emerald">New Enquiry</Badge>;
      case 'ENQUIRY_ASSIGNED': return <Badge variant="navy">Assigned</Badge>;
      case 'FOLLOWUP_DUE': return <Badge variant="warning">Follow-up</Badge>;
      case 'SYSTEM_ALERT': return <Badge variant="danger">System Alert</Badge>;
      default: return <Badge variant="default">General</Badge>;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">View and manage your alerts</p>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 py-4">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Options
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="text-sm border-slate-200 rounded-md bg-white shadow-sm"
                value={isReadFilter}
                onChange={(e) => setIsReadFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="false">Unread Only</option>
                <option value="true">Read Only</option>
              </select>
              
              <select
                className="text-sm border-slate-200 rounded-md bg-white shadow-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="ENQUIRY_NEW">New Enquiry</option>
                <option value="ENQUIRY_ASSIGNED">Assigned</option>
                <option value="FOLLOWUP_DUE">Follow-up Due</option>
                <option value="SYSTEM_ALERT">System Alert</option>
              </select>

              <Button variant="primary" onClick={() => { setPage(1); loadNotifications(); }}>
                Apply Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8" />
                <p>{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No notifications found matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "p-4 sm:p-6 transition-colors hover:bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between",
                      !notif.isRead ? "bg-brand-emerald-50/20" : ""
                    )}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        {getNotificationIcon(notif.type)}
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-brand-emerald-500" />
                        )}
                      </div>
                      
                      <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span>
                          {new Date(notif.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        
                        {notif.linkUrl && (
                          <Link 
                            href={notif.linkUrl}
                            className="font-bold text-brand-emerald-700 hover:text-brand-emerald-800 hover:underline flex items-center gap-1"
                          >
                            View Details <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:items-start shrink-0">
                      {!notif.isRead ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(notif.id)}
                          className="text-slate-500 hover:text-brand-emerald-600 hover:bg-brand-emerald-50"
                        >
                          <Check className="w-4 h-4 mr-2" /> Mark as Read
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsUnread(notif.id)}
                          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Unread
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
