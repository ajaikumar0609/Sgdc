'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Filter, Search, Terminal } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  userId: string | null;
  user: { name: string; email: string } | null;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (currentUser && !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      router.push('/admin');
      return;
    }
    loadAuditLogs();
  }, [page, currentUser]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (actionFilter) {
        params.append('action', actionFilter);
      }
      if (entityFilter) {
        params.append('entity', entityFilter);
      }

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error('You do not have permission to view audit logs.');
        throw new Error('Failed to load audit logs');
      }
      
      const { data } = await res.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-brand-emerald-100 text-brand-emerald-800';
      case 'UPDATE': return 'bg-brand-gold-100 text-brand-gold-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VIEW': return 'bg-slate-100 text-slate-800';
      case 'LOGIN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
            <p className="text-slate-600 mt-1">Review system activity and administrative actions.</p>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 py-4">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Logs
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="text-sm border-slate-200 rounded-md bg-white shadow-sm"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="VIEW">VIEW</option>
                <option value="LOGIN">LOGIN</option>
              </select>
              
              <select
                className="text-sm border-slate-200 rounded-md bg-white shadow-sm"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <option value="">All Entities</option>
                <option value="USER">USER</option>
                <option value="ENQUIRY">ENQUIRY</option>
                <option value="DONATION">DONATION</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="PROGRAM">PROGRAM</option>
                <option value="NEWS">NEWS</option>
                <option value="STUDENT_STORY">STUDENT_STORY</option>
              </select>

              <Button variant="primary" onClick={() => { setPage(1); loadAuditLogs(); }}>
                Apply
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
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No audit logs found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short', timeStyle: 'medium'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 rounded text-[10px] font-bold tracking-wider', getActionColor(log.action))}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {log.entity} <span className="text-slate-400 text-xs truncate max-w-[100px] inline-block align-bottom ml-1" title={log.entityId}>({log.entityId.slice(0, 8)}...)</span>
                        </td>
                        <td className="px-4 py-3">
                          {log.user ? (
                            <div>
                              <p className="font-bold text-slate-900">{log.user.name}</p>
                              <p className="text-xs text-slate-500">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">System / Anonymous</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-brand-navy-600 hover:bg-brand-navy-50"
                          >
                            <FileText className="w-4 h-4 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
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

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-brand-navy-600" /> Audit Log Detail
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Actor</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLog.user?.name || 'System'}</p>
                  <p className="text-xs text-slate-500">{selectedLog.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-500">IP: {selectedLog.ipAddress || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Action</p>
                  <span className={cn('px-2 py-1 rounded text-[10px] font-bold tracking-wider', getActionColor(selectedLog.action))}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Target Resource</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLog.entity}</p>
                  <p className="text-xs text-slate-500 font-mono break-all">{selectedLog.entityId}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Metadata Details</p>
                {selectedLog.details ? (
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-all">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
                        } catch {
                          return selectedLog.details;
                        }
                      })()}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-500 text-center">
                    No additional metadata available for this event.
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
