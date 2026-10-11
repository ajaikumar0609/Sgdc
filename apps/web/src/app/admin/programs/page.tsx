'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  FolderPlus,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { programs: number };
}

interface ProgramItem {
  id: string;
  name: string;
  slug: string;
  degreeLevel: string;
  durationYears: string;
  imageUrl?: string | null;
  isPublished: boolean;
  displayOrder: number;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    enquiries: number;
    students: number;
  };
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Load Categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/programs/categories');
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories(data.data.categories || []);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Load Programs
  const loadPrograms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (categoryFilter) params.set('categoryId', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/programs?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setPrograms(data.data.programs || []);
        setTotal(data.data.pagination?.total || 0);
        setPages(data.data.pagination?.pages || 1);
      } else {
        setPrograms([]);
      }
    } catch {
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Quick Publish/Unpublish Toggle
  const handleTogglePublish = async (program: ProgramItem) => {
    setTogglingId(program.id);
    try {
      const res = await fetch(`/api/admin/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !program.isPublished }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === program.id ? { ...p, isPublished: !p.isPublished } : p
          )
        );
      } else {
        alert(data.error?.message || 'Failed to update publication status.');
      }
    } catch {
      alert('Network error while toggling publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Create New Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;

    setIsSubmittingCat(true);
    try {
      const res = await fetch('/api/admin/programs/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: newCatSlug.trim(),
          description: newCatDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCategoryModalOpen(false);
        setNewCatName('');
        setNewCatSlug('');
        setNewCatDesc('');
        loadCategories();
      } else {
        alert(data.error?.message || 'Failed to create category.');
      }
    } catch {
      alert('Network error creating category.');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                Academic Programs CMS
              </h1>
              <Badge variant="navy" size="sm">
                {total} Programs
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage verified degree courses, syllabi, requirements, and live publication status across the public catalog.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
              leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
            >
              Categories
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadPrograms}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>

            <Link href="/admin/programs/new">
              <Button
                variant="emerald"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add New Program
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="p-4 border-slate-200 bg-white shadow-soft-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search by program name or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Category Filter */}
            <div>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c._count?.programs || 0})`,
                  })),
                ]}
              />
            </div>

            {/* Publication Status Filter */}
            <div>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'PUBLISHED', label: 'Published Only' },
                  { value: 'DRAFT', label: 'Draft / Unpublished Only' },
                ]}
              />
            </div>
          </div>

          {(search || categoryFilter || statusFilter) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Filters active</span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-brand-emerald-700 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </Card>

        {/* Content Listing */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <LoadingSpinner size="md" text="Loading academic programs..." />
          </div>
        ) : programs.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Program Name & Slug</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Level & Duration</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Enquiries</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map((prog) => (
                    <tr
                      key={prog.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/programs/${prog.id}/edit`}
                          className="font-bold text-slate-900 group-hover:text-brand-navy-900 block"
                        >
                          {prog.name}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400 block truncate max-w-[220px]">
                          /{prog.slug}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                          {prog.category.name}
                        </span>
                      </td>

                      {/* Level & Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <span className="font-semibold block">{prog.degreeLevel}</span>
                        <span className="text-[11px] text-slate-400 block">{prog.durationYears}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(prog)}
                          disabled={togglingId === prog.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                            prog.isPublished
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {prog.isPublished ? (
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

                      {/* Enquiries Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-700">
                          {prog._count?.enquiries || 0}
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(prog.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {prog.isPublished ? (
                            <Link href={`/programs/${prog.slug}`} target="_blank">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2 gap-1 text-slate-500 hover:text-slate-900"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Live</span>
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/admin/programs/${prog.id}/preview`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2 gap-1 text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </Button>
                            </Link>
                          )}

                          <Link href={`/admin/programs/${prog.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2.5 gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (< 768px) */}
            <div className="md:hidden space-y-3">
              {programs.map((prog) => (
                <Card
                  key={prog.id}
                  className="p-4 border-slate-200 bg-white shadow-soft-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      {prog.category.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(prog)}
                      disabled={togglingId === prog.id}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        prog.isPublished
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {prog.isPublished ? '● Published' : '○ Draft'}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {prog.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      /{prog.slug}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {prog.degreeLevel} • {prog.durationYears}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">
                      Enquiries: <strong>{prog._count?.enquiries || 0}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/programs/${prog.id}/preview`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/admin/programs/${prog.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          Edit →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page <strong className="text-slate-900">{page}</strong> of{' '}
                  <strong className="text-slate-900">{pages}</strong> ({total} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <EmptyState
              title="No Academic Programs Found"
              description="No programs match your current search and filters. You can create a new program to expand the catalog."
              action={
                <Link href="/admin/programs/new">
                  <Button variant="emerald" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add First Program
                  </Button>
                </Link>
              }
            />
          </div>
        )}

        {/* Category Creation Modal */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Create Academic Category"
          description="Add a top-level study discipline (e.g. Paramedical Sciences, Management & Business)."
        >
          <form onSubmit={handleCreateCategory} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
              <Input
                placeholder="e.g. Paramedical Sciences"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }}
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">URL Slug *</label>
              <Input
                placeholder="e.g. paramedical-sciences"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description (Optional)</label>
              <Input
                placeholder="Brief summary of programs under this discipline"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                isLoading={isSubmittingCat}
              >
                Save Category
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
