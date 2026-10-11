'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, UserCheck, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface AuditItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface RecentActivityWidgetProps {
  activities: AuditItem[];
  isLoading?: boolean;
}

export function RecentActivityWidget({ activities, isLoading = false }: RecentActivityWidgetProps) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ENQUIRY_CREATED':
      case 'CONTACT_ENQUIRY_CREATED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">New Enquiry</Badge>;
      case 'ENQUIRY_UPDATED':
      case 'COUNSELOR_ASSIGNED':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">Assigned / Updated</Badge>;
      case 'FOLLOW_UP_CREATED':
      case 'FOLLOW_UP_UPDATED':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Follow-Up</Badge>;
      case 'CONVERSATION_ADDED':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Touchpoint Logged</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{action.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <Card className="p-5 bg-white shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Operational Activity Trail</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable audit log of staff interventions, touches, and system updates.
          </p>
        </div>
        <span className="text-xs text-gray-400 font-mono">Live Audit Log</span>
      </div>

      {/* Activity List */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">
          No recent activity events recorded.
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getActionBadge(act.action)}
                  <span className="font-semibold text-gray-900">
                    {act.user?.name || 'System / Staff'}
                  </span>
                  {act.user?.role && (
                    <span className="text-[10px] text-gray-400">
                      ({act.user.role.replace(/_/g, ' ')})
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(act.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' • '}
                  {new Date(act.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {act.details && (
                <p className="text-[11px] text-gray-600 truncate font-mono bg-white p-1.5 rounded border border-gray-100">
                  {typeof act.details === 'string'
                    ? act.details.replace(/[\{\}\"]/g, ' ').slice(0, 120)
                    : JSON.stringify(act.details).slice(0, 120)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
