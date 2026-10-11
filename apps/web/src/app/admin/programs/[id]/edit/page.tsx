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
  BookOpen,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
}

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('Undergraduate');
  const [durationYears, setDurationYears] = useState('4 Years');
  const [overview, setOverview] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [careerOpportunities, setCareerOpportunities] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);
  const [enquiryCount, setEnquiryCount] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [progRes, catRes] = await Promise.all([
        fetch(`/api/admin/programs/${id}`),
        fetch('/api/admin/programs/categories'),
      ]);

      const [progData, catData] = await Promise.all([
        progRes.json(),
        catRes.json(),
      ]);

      if (catRes.ok && catData.success) {
        setCategories(catData.data?.categories || []);
      }

      if (progRes.ok && progData.success && progData.data?.program) {
        const p = progData.data.program;
        setName(p.name || '');
        setSlug(p.slug || '');
        setCategoryId(p.categoryId || '');
        setDegreeLevel(p.degreeLevel || 'Undergraduate');
        setDurationYears(p.durationYears || '4 Years');
        setOverview(p.overview || '');
        setEligibilityCriteria(p.eligibilityCriteria || '');
        setCareerOpportunities(p.careerOpportunities || '');
        setImageUrl(p.imageUrl || '');
        setDisplayOrder(p.displayOrder?.toString() || '0');
        setIsPublished(Boolean(p.isPublished));
        setEnquiryCount(p._count?.enquiries || 0);
      } else {
        setErrorMessage(progData.error?.message || 'Program not found.');
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

    if (!name.trim()) {
      setErrorMessage('Program name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('URL slug is required.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select an academic category.');
      return;
    }
    if (!overview.trim()) {
      setErrorMessage('Program overview description is required.');
      return;
    }

    const targetPublish = overridePublish !== undefined ? overridePublish : isPublished;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/programs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          categoryId,
          degreeLevel,
          durationYears,
          overview: overview.trim(),
          eligibilityCriteria: eligibilityCriteria.trim() || null,
          careerOpportunities: careerOpportunities.trim() || null,
          imageUrl: imageUrl.trim() || null,
          displayOrder: parseInt(displayOrder, 10) || 0,
          isPublished: targetPublish,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsPublished(targetPublish);
        setSuccessMessage('Program updated successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error?.message || 'Failed to update program.');
      }
    } catch {
      setErrorMessage('Network error while saving updates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete '${name}'? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/programs/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/programs');
      } else {
        alert(data.error?.message || 'Failed to delete program.');
      }
    } catch {
      alert('Network error while deleting program.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <LoadingSpinner size="lg" text="Loading program details..." />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/programs"
            className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Programs CMS</span>
          </Link>

          <div className="flex items-center gap-2">
            {isPublished ? (
              <Link href={`/programs/${slug}`} target="_blank">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                  <span>View Public Page</span>
                </Button>
              </Link>
            ) : (
              <Link href={`/admin/programs/${id}/preview`}>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-amber-300 text-amber-800">
                  <Eye className="w-3 h-3" />
                  <span>Preview Draft</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Header with Title & Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
                Edit Academic Program
              </h1>
              <Badge
                variant={isPublished ? 'success' : 'warning'}
                size="sm"
              >
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">
              /programs/{slug}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 self-start sm:self-auto"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Update Failed</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Program Form */}
        <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Program Name */}
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Program Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Public URL Slug *
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-300 px-3 py-2 text-xs text-slate-500 rounded-l-lg font-mono">
                  /programs/
                </span>
                <Input
                  className="rounded-l-none font-mono text-xs"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Academic Category *
              </label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>

            {/* Degree Level */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Degree Level *
              </label>
              <Select
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                options={[
                  { value: 'Undergraduate', label: 'Undergraduate (UG / Bachelor)' },
                  { value: 'Postgraduate', label: 'Postgraduate (PG / Master)' },
                  { value: 'Diploma', label: 'Diploma / Polytechnic' },
                  { value: 'Integrated Course', label: 'Integrated Course (5 Years)' },
                  { value: 'Doctoral / Ph.D', label: 'Doctoral / Ph.D' },
                ]}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Duration *
              </label>
              <Input
                value={durationYears}
                onChange={(e) => setDurationYears(e.target.value)}
                required
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Catalog Display Order
              </label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>
          </div>

          {/* Overview */}
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">
              Program Overview & Scope *
            </label>
            <Textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              required
            />
          </div>

          {/* Eligibility Criteria */}
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">
              Eligibility Criteria & Admission Cutoffs
            </label>
            <Textarea
              rows={3}
              value={eligibilityCriteria}
              onChange={(e) => setEligibilityCriteria(e.target.value)}
            />
          </div>

          {/* Career Pathways */}
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">
              Career Pathways & Industry Placement Roles
            </label>
            <Textarea
              rows={3}
              value={careerOpportunities}
              onChange={(e) => setCareerOpportunities(e.target.value)}
            />
          </div>

          {/* Image URL & Live Preview */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Program Cover Image URL
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Provide a secure HTTPS URL or a local brand asset path (e.g. /brand/logo.png).
              </span>
            </div>

            {imageUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg bg-slate-200 overflow-hidden relative shrink-0 border border-slate-300">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Cover Preview</span>
                  <span className="text-slate-400 font-mono text-[10px] break-all">{imageUrl}</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/admin/programs">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isPublished ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(false)}
                  isLoading={isSubmitting}
                  className="flex-1 sm:flex-none text-amber-800 border-amber-300 hover:bg-amber-50"
                >
                  Unpublish (Move to Draft)
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(true)}
                  isLoading={isSubmitting}
                  className="flex-1 sm:flex-none text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                >
                  Publish Now
                </Button>
              )}

              <Button
                type="button"
                variant="emerald"
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
