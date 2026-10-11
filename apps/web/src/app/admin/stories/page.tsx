'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Heart, RefreshCw, CheckCircle2, XCircle, Edit3, Trash2, Plus } from 'lucide-react';

interface StudentStory {
  id: string;
  title: string;
  studentName: string;
  program?: string;
  content: string;
  coverImage?: string;
  status: string;
  displayOrder: number;
  createdAt: string;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<StudentStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/welfare/stories`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStories(data.data.stories || []);
      } else {
        setStories([]);
      }
    } catch {
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleTogglePublish = async (story: StudentStory) => {
    setTogglingId(story.id);
    const newStatus = story.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/welfare/stories/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStories((prev) =>
          prev.map((s) =>
            s.id === story.id ? { ...s, status: newStatus } : s
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      const res = await fetch(`/api/admin/welfare/stories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert('Failed to delete story.');
      }
    } catch {
      alert('Network error.');
    }
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                Student Stories CMS
              </h1>
              <Badge variant="navy" size="sm">
                {stories.length} Stories
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage success stories and testimonials from students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStories}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="emerald"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => alert('Add story functionality coming soon')}
            >
              Add Story
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <LoadingSpinner size="md" text="Loading stories..." />
          </div>
        ) : stories.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Title & Student</th>
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{story.title}</span>
                      <span className="text-[11px] text-slate-500 block">{story.studentName}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {story.program || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(story)}
                        disabled={togglingId === story.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                          story.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {story.status === 'PUBLISHED' ? (
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
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(story.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <EmptyState
              title="No Student Stories Found"
              description="Share student success stories to inspire others."
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
