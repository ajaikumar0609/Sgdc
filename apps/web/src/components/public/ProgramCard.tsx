import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

export interface ProgramItem {
  id: string;
  name: string;
  slug: string;
  degreeLevel: string;
  durationYears: string;
  overview: string;
  eligibilityCriteria?: string | null;
  careerOpportunities?: string | null;
  imageUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function ProgramCard({ program }: { program: ProgramItem }) {
  return (
    <Card
      hover
      className="flex flex-col h-full overflow-hidden border-slate-200/80 bg-white shadow-soft-sm transition-all duration-300 hover:shadow-soft-lg group"
    >
      {/* Visual Header / Image thumbnail if available */}
      {program.imageUrl && (
        <div className="relative h-44 w-full overflow-hidden bg-brand-navy-900">
          <Image
            src={program.imageUrl}
            alt={program.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {program.category && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="emerald" size="sm">
                {program.category.name}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!program.imageUrl && program.category && (
            <Badge variant="emerald" size="sm">
              {program.category.name}
            </Badge>
          )}
          <Badge variant="navy" size="sm">
            {program.degreeLevel}
          </Badge>
        </div>

        <CardTitle className="text-xl font-bold text-brand-navy-950 group-hover:text-brand-navy-700 transition-colors line-clamp-2">
          <Link href={`/programs/${program.slug}`}>
            {program.name}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {program.overview}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-emerald-600 shrink-0" />
            <span>Duration: {program.durationYears}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-brand-navy-600 shrink-0" />
            <span>Full-time</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Link href={`/programs/${program.slug}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-slate-700 hover:text-brand-navy-900 border-slate-200"
          >
            Details
          </Button>
        </Link>
        <Link href={`/admission-query?program=${encodeURIComponent(program.name)}`} className="flex-1">
          <Button
            variant="emerald"
            size="sm"
            className="w-full"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Apply Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
