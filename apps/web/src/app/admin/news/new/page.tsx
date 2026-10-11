'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Newspaper,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

export default function NewNewsArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Admissions');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSubmit = async (publishState: boolean) => {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Article title is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('URL slug is required.');
      return;
    }
    if (!excerpt.trim()) {
      setErrorMessage('Article summary / excerpt is required.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Full article content is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          category,
          excerpt: excerpt.trim(),
          content: content.trim(),
          coverImage: coverImage.trim() || undefined,
          isPublished: publishState,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/news');
      } else {
        setErrorMessage(data.error?.message || 'Failed to create article.');
      }
    } catch {
      setErrorMessage('Network error while saving article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/news"
            className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to News CMS</span>
          </Link>
          <span className="text-xs text-slate-400">Content Publishing</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
            Create News Article
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author and broadcast official admissions alerts, scholarship schemes, and campus press releases.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Validation Error</strong>
              <span>{errorMessage}</span>
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
                onChange={(e) => handleTitleChange(e.target.value)}
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
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                    }}
                    required
                  />
                </div>
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
                placeholder="Short 1-2 sentence lead paragraph shown in article cards and search snippets..."
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
                  Optional featured photograph or announcement poster banner.
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

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/admin/news">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(false)}
                isLoading={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                variant="emerald"
                size="sm"
                onClick={() => handleSubmit(true)}
                isLoading={isSubmitting}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="flex-1 sm:flex-none"
              >
                Publish Article
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
