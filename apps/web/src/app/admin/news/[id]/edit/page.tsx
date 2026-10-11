'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  Newspaper,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

export default function EditNewsArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Admissions');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/news/${id}`);
      const data = await res.json();

      if (res.ok && data.success && data.data?.article) {
        const a = data.data.article;
        setTitle(a.title || '');
        setSlug(a.slug || '');
        setCategory(a.category || 'Admissions');
        setExcerpt(a.excerpt || '');
        setContent(a.content || '');
        setCoverImage(a.coverImage || '');
        setIsPublished(Boolean(a.isPublished));
        setAuthorName(a.author?.name || 'Authorized Staff');
        setUpdatedAt(a.updatedAt || null);
      } else {
        setErrorMessage(data.error?.message || 'Article not found.');
      }
    } catch {
      setErrorMessage('Failed to connect to platform API.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (overridePublish?: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Article headline / title is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('URL slug is required.');
      return;
    }
    if (!excerpt.trim()) {
      setErrorMessage('Article excerpt / summary is required.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Full article content is required.');
      return;
    }

    const nextPublished = overridePublish !== undefined ? overridePublish : isPublished;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          category,
          excerpt: excerpt.trim(),
          content: content.trim(),
          coverImage: coverImage.trim() || null,
          isPublished: nextPublished,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsPublished(nextPublished);
        setSuccessMessage(data.message || 'Article updated successfully.');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error?.message || 'Failed to update article.');
      }
    } catch {
      setErrorMessage('Network error while updating article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${title}"?\n\nThis cannot be undone. To take the article down safely, consider Unpublishing instead.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/news');
      } else {
        setErrorMessage(data.error?.message || 'Failed to delete article.');
      }
    } catch {
      setErrorMessage('Network error while deleting article.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <LoadingSpinner size="lg" text="Loading news article..." />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/admin/news"
            className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to News CMS</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/admin/news/${id}/preview`}>
              <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                Staff Preview
              </Button>
            </Link>

            {isPublished && (
              <a
                href={`/news/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors"
              >
                <span>Live Article</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                Edit Article
              </h1>
              <Badge variant={isPublished ? 'success' : 'neutral'}>
                {isPublished ? 'PUBLISHED' : 'DRAFT'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {authorName && <span>Author: <strong>{authorName}</strong> • </span>}
              {updatedAt && <span>Last saved: {new Date(updatedAt).toLocaleString('en-IN')}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Feedback Notifications */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Operation Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Success</strong>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Article Headline / Title *
              </label>
              <Input
                placeholder="e.g. 2026 Tamil Nadu Engineering Admissions (TNEA) Counselling Guide Released"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Slug & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  Public URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 px-3 py-2 text-xs text-slate-500 rounded-l-lg font-mono">
                    /news/
                  </span>
                  <Input
                    className="rounded-l-none font-mono text-xs"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                    }
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Warning: Changing the slug alters the public canonical URL for this article.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  Topic Category *
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: 'Admissions', label: 'Admissions' },
                    { value: 'Campus Life', label: 'Campus Life' },
                    { value: 'Scholarships', label: 'Scholarships' },
                    { value: 'Events', label: 'Events' },
                    { value: 'Academic Guidance', label: 'Academic Guidance' },
                  ]}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Excerpt / Summary *
              </label>
              <Textarea
                rows={2}
                placeholder="Short lead paragraph shown on news listing cards and social previews..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Full Article Content *
              </label>
              <Textarea
                rows={10}
                placeholder="Detailed article body, official announcements, deadlines, counselor advice, and campus highlights..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  Cover Image URL
                </label>
                <Input
                  placeholder="https://... or /brand/posters/poster-02.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Optional banner photograph or authentic poster asset URL.
                </span>
              </div>

              {coverImage && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="w-20 h-16 rounded-lg bg-slate-200 overflow-hidden relative shrink-0 border border-slate-300">
                    <img
                      src={coverImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Cover Preview</span>
                    <span className="text-slate-400 font-mono text-[10px] break-all">{coverImage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publication State & Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Status:</span>
              <Badge variant={isPublished ? 'success' : 'neutral'}>
                {isPublished ? 'LIVE ON WEBSITE' : 'DRAFT (PRIVATE)'}
              </Badge>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isPublished ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(false)}
                  isLoading={isSubmitting}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50 flex-1 sm:flex-none"
                >
                  Unpublish to Draft
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="emerald"
                  size="sm"
                  onClick={() => handleSubmit(true)}
                  isLoading={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  Publish Immediately
                </Button>
              )}

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSubmit()}
                isLoading={isSubmitting}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="flex-1 sm:flex-none"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
