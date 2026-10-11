'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
}

export default function NewProgramPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate slug from name unless modified
  const [isSlugManual, setIsSlugManual] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/programs/categories');
        const data = await res.json();
        if (res.ok && data.success && data.data?.categories) {
          setCategories(data.data.categories);
          if (data.data.categories.length > 0) {
            setCategoryId(data.data.categories[0].id);
          }
        }
      } catch {
        // Handled
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
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

    if (!name.trim()) {
      setErrorMessage('Program name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('URL slug is required.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select a program category.');
      return;
    }
    if (!overview.trim()) {
      setErrorMessage('Overview / program description is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          categoryId,
          degreeLevel,
          durationYears,
          overview: overview.trim(),
          eligibilityCriteria: eligibilityCriteria.trim() || undefined,
          careerOpportunities: careerOpportunities.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          displayOrder: parseInt(displayOrder, 10) || 0,
          isPublished: publishState,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/programs');
      } else {
        setErrorMessage(data.error?.message || 'Failed to create program.');
      }
    } catch {
      setErrorMessage('Network error while saving program. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/programs"
            className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Programs CMS</span>
          </Link>
          <span className="text-xs text-slate-400">Content Management</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading">
            Create Academic Program
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish verified degree paths, entrance cutoffs, and collegiate syllabus overview to the public website.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Submission Validation Error</strong>
              <span>{errorMessage}</span>
            </div>
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
                placeholder="e.g. B.Tech Computer Science and Engineering"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
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
                  placeholder="btech-computer-science-engineering"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                  }}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Academic Discipline / Category *
              </label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                disabled={isLoadingCategories}
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
                placeholder="e.g. 4 Years (8 Semesters)"
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
                placeholder="0"
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
              placeholder="Detailed description of the degree, syllabus highlights, laboratory infrastructure, and academic opportunities..."
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
              placeholder="e.g. Higher Secondary (10+2) with Mathematics, Physics, and Chemistry. Minimum 50% aggregate (45% for reserved quotas)."
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
              placeholder="e.g. Cloud Solutions Architect, Full Stack Developer, AI/ML Specialist, Systems Analyst, IT Consultant."
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
                placeholder="https://... or /brand/posters/poster-01.jpg"
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
                  <span className="font-bold text-slate-800 block">Image Preview</span>
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
                Publish Program
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
