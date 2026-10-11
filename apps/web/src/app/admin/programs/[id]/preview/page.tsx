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
  Clock,
  GraduationCap,
  Briefcase,
  FileCheck2,
  CheckCircle2,
  Eye,
  Edit3,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function ProgramPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    async function fetchProgram() {
      try {
        const res = await fetch(`/api/admin/programs/${id}`);
        const data = await res.json();
        if (res.ok && data.success && data.data?.program) {
          setProgram(data.data.program);
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgram();
  }, [id]);

  const handlePublishNow = async () => {
    if (!program) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/admin/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProgram((prev: any) => ({ ...prev, isPublished: true }));
        router.push(`/programs/${program.slug}`);
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
          <LoadingSpinner size="lg" text="Loading program preview..." />
        </div>
      </AdminShell>
    );
  }

  if (!program) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Program Not Found</h2>
          <Link href="/admin/programs">
            <Button variant="outline" size="sm">Back to Programs</Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Draft Notice Banner */}
        <div className="p-4 bg-amber-500 text-brand-navy-950 rounded-2xl shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20">
              <Eye className="w-5 h-5 text-brand-navy-950" />
            </div>
            <div>
              <span className="font-black text-sm block">
                Staff Draft Preview Mode
              </span>
              <span className="text-xs text-brand-navy-900/80">
                {program.isPublished
                  ? 'This program is currently Published and visible to the public.'
                  : 'This program is currently Draft / Unpublished and hidden from public visitors.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/programs/${program.id}/edit`}>
              <Button size="sm" variant="outline" className="bg-white text-slate-900 h-8 text-xs gap-1">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Program</span>
              </Button>
            </Link>

            {!program.isPublished && (
              <Button
                size="sm"
                variant="emerald"
                onClick={handlePublishNow}
                isLoading={isPublishing}
                className="h-8 text-xs gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publish Immediately</span>
              </Button>
            )}
          </div>
        </div>

        {/* Public Mock Preview Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-md overflow-hidden">
          {/* Hero Header */}
          <div className="bg-brand-navy-950 text-white p-8 sm:p-12 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-brand-navy-800 text-brand-gold-400 font-bold px-3 py-1 rounded-full text-xs">
                {program.category?.name || 'Academic Course'}
              </span>
              <span className="bg-brand-navy-800 text-slate-300 font-medium px-3 py-1 rounded-full text-xs">
                {program.degreeLevel}
              </span>
              <span className="bg-brand-navy-800 text-slate-300 font-medium px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-emerald-400" />
                {program.durationYears}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-heading leading-tight max-w-3xl">
              {program.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {program.overview}
            </p>
          </div>

          {/* Details Body */}
          <div className="p-8 sm:p-12 space-y-8">
            {program.imageUrl && (
              <div className="rounded-2xl overflow-hidden max-h-80 bg-slate-100 border border-slate-200">
                <img
                  src={program.imageUrl}
                  alt={program.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Eligibility */}
              <Card className="p-6 border-slate-200 bg-slate-50/60 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileCheck2 className="w-4 h-4 text-brand-emerald-600" />
                  <span>Eligibility & Cutoffs</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {program.eligibilityCriteria || 'Standard 10+2 / collegiate prerequisites apply for this course.'}
                </p>
              </Card>

              {/* Career Opportunities */}
              <Card className="p-6 border-slate-200 bg-slate-50/60 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Briefcase className="w-4 h-4 text-brand-gold-600" />
                  <span>Career & Placement Pathways</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {program.careerOpportunities || 'Graduates can pursue professional industry positions or postgraduate specializations.'}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
