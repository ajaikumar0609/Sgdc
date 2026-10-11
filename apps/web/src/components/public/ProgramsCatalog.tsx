'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ProgramCard, ProgramItem } from './ProgramCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, BookOpen, Filter, ArrowRight, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    programs: number;
  };
}

export interface ProgramsCatalogProps {
  categories: CategoryItem[];
  programs: ProgramItem[];
  initialCategory?: string;
  initialSearch?: string;
}

export function ProgramsCatalog({
  categories,
  programs,
  initialCategory = 'all',
  initialSearch = '',
}: ProgramsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        p.category?.slug === selectedCategory ||
        p.category?.name.toLowerCase().includes(selectedCategory.toLowerCase());

      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.overview.toLowerCase().includes(query) ||
        p.degreeLevel.toLowerCase().includes(query) ||
        (p.category?.name && p.category.name.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [programs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by course title, degree or field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search academic programs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium w-full md:w-auto text-right">
            Showing <span className="font-bold text-brand-navy-900">{filteredPrograms.length}</span> of {programs.length} programs
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
              selectedCategory === 'all'
                ? 'bg-brand-navy-900 text-white shadow-soft-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            All Disciplines ({programs.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
                  isSelected
                    ? 'bg-brand-navy-900 text-white shadow-soft-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Cards Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => (
            <ProgramCard key={prog.id} program={prog} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <EmptyState
            title="No Academic Programs Found"
            description={
              searchQuery
                ? `No courses matching "${searchQuery}". Try a different keyword or view all categories.`
                : 'There are currently no published programs in this category.'
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        </div>
      )}

      {/* Counseling Callout Footer */}
      <div className="bg-brand-navy-900 text-white rounded-2xl p-8 border border-brand-navy-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="gold" size="sm">
            Not Sure Which Degree Fits You?
          </Badge>
          <h3 className="text-xl sm:text-2xl font-bold font-heading">
            Talk to an Academic Counselor
          </h3>
          <p className="text-slate-300 text-sm max-w-xl">
            Our education advisors help you analyze your 12th cutoff, personal aptitude, and future careers across accredited colleges.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href="/admission-query">
            <Button variant="emerald" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Submit Query
            </Button>
          </Link>
          <Link href="/counseling">
            <Button variant="outline" size="md" className="text-white border-white/30 hover:bg-white/10" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Counseling Guidance
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
