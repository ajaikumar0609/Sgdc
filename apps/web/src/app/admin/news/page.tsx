'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Newspaper,
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
  Calendar,
  User,
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage?: string | null;
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/news?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setArticles(data.data.articles || []);
        setTotal(data.data.pagination?.total || 0);
        setPages(data.data.pagination?.pages || 1);
      } else {
        setArticles([]);
      }
    } catch {
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleTogglePublish = async (article: NewsItem) => {
    setTogglingId(article.id);
    try {
      const res = await fetch(`/api/admin/news/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id ? { ...a, isPublished: !a.isPublished } : a
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
                News & Press Articles CMS
              </h1>
              <Badge variant="navy" size="sm">
                {total} Articles
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage institution updates, admission notifications, scholarship releases, and campus press releases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadArticles}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>

            <Link href="/admin/news/new">
              <Button
                variant="emerald"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add New Article
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 border-slate-200 bg-white shadow-soft-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search by article title or content..."
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
                  { value: 'Admissions', label: 'Admissions' },
                  { value: 'Campus Life', label: 'Campus Life' },
                  { value: 'Scholarships', label: 'Scholarships' },
                  { value: 'Events', label: 'Events' },
                  { value: 'Academic Guidance', label: 'Academic Guidance' },
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
            <LoadingSpinner size="md" text="Loading news articles..." />
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Title & Slug</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Published Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Title & Slug */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/admin/news/${article.id}/edit`}
                          className="font-bold text-slate-900 group-hover:text-brand-navy-900 block truncate"
                        >
                          {article.title}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400 block truncate">
                          /{article.slug}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                          {article.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {article.author.name}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(article)}
                          disabled={togglingId === article.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                            article.isPublished
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {article.isPublished ? (
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

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {article.isPublished ? (
                            <Link href={`/news/${article.slug}`} target="_blank">
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
                            <Link href={`/admin/news/${article.id}/preview`}>
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

                          <Link href={`/admin/news/${article.id}/edit`}>
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
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="p-4 border-slate-200 bg-white shadow-soft-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      {article.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(article)}
                      disabled={togglingId === article.id}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        article.isPublished
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {article.isPublished ? '● Published' : '○ Draft'}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-[11px]">
                      By {article.author.name}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/news/${article.id}/preview`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/admin/news/${article.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          Edit →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
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
              title="No News Articles Found"
              description="No articles match your current search and filters. Publish an update to inform students."
              action={
                <Link href="/admin/news/new">
                  <Button variant="emerald" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add First Article
                  </Button>
                </Link>
              }
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
