'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Eye,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Newspaper,
  Tag,
} from 'lucide-react';

export default function NewsPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/admin/news/${id}`);
        const data = await res.json();
        if (res.ok && data.success && data.data?.article) {
          setArticle(data.data.article);
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  const handlePublishNow = async () => {
    if (!article) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/admin/news/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArticle((prev: any) => ({ ...prev, isPublished: true }));
        router.push(`/news/${article.slug}`);
      } else {
        alert(data.error?.message || 'Failed to publish.');
      }
    } catch {
      alert('Network error while publishing.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <LoadingSpinner size="lg" text="Loading article preview..." />
        </div>
      </AdminShell>
    );
  }

  if (!article) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Article Not Found</h2>
          <Link href="/admin/news">
            <Button variant="outline" size="sm">Back to News CMS</Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Draft Notice Banner */}
        <div className="p-4 bg-amber-500 text-brand-navy-950 rounded-2xl shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400 rounded-xl text-brand-navy-950">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider">
                  Internal Staff Preview
                </span>
                <Badge variant={article.isPublished ? 'success' : 'neutral'}>
                  {article.isPublished ? 'LIVE' : 'UNPUBLISHED DRAFT'}
                </Badge>
              </div>
              <p className="text-xs text-brand-navy-900 mt-0.5">
                {article.isPublished
                  ? 'This article is live. Public visitors can view it on the website.'
                  : 'This article is in draft status. Public visitors receive a 404 until you publish.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/admin/news/${article.id}/edit`}>
              <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white text-slate-800 border-none">
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Article
              </Button>
            </Link>

            {!article.isPublished ? (
              <Button
                size="sm"
                variant="emerald"
                onClick={handlePublishNow}
                isLoading={isPublishing}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Publish to Website
              </Button>
            ) : (
              <a
                href={`/news/${article.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy-950 text-white rounded-lg text-xs font-semibold hover:bg-brand-navy-900 transition-colors"
              >
                <span>Live View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/news"
            className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to News CMS</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">/news/{article.slug}</span>
        </div>

        {/* Article Preview Card */}
        <Card className="p-6 sm:p-10 border-slate-200 bg-white shadow-soft-sm space-y-8">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden relative border border-slate-200 bg-slate-100">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Metadata Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="text-xs font-semibold">
                <Tag className="w-3 h-3 mr-1" />
                {article.category}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Slug: {article.slug}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-brand-navy-950 font-heading leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>By <strong>{article.author?.name || 'Authorized Staff'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Draft (Not Yet Published)'}
                </span>
              </div>
            </div>
          </div>

          {/* Lead Excerpt */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-base text-slate-700 italic font-serif leading-relaxed">
              "{article.excerpt}"
            </p>
          </div>

          {/* Main Body */}
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4">
            {article.content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="text-sm sm:text-base leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
