import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchFromApi } from '@/lib/api';
import {
  Clock,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  HelpCircle,
  FileCheck2,
  ShieldCheck,
  PhoneCall,
  Share2,
} from 'lucide-react';

interface ProgramDetailProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProgramDetailProps): Promise<Metadata> {
  const res = await fetchFromApi<{ program: any }>(`/api/programs/${params.slug}`);
  if (!res.success || !res.data?.program) {
    return {
      title: 'Program Not Found | Shasthi Guru Dream Campus',
    };
  }

  const program = res.data.program;
  return {
    title: `${program.name} | Shasthi Guru Dream Campus`,
    description: program.overview?.slice(0, 160) || 'Academic program overview and admission guidance.',
    openGraph: {
      title: `${program.name} - Shasthi Guru Dream Campus`,
      description: program.overview?.slice(0, 160),
    },
  };
}

export default async function ProgramDetailPage({ params }: ProgramDetailProps) {
  const res = await fetchFromApi<{ program: any }>(`/api/programs/${params.slug}`);

  if (!res.success || !res.data?.program) {
    notFound();
  }

  const program = res.data.program;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Program Hero Banner */}
        <PageHero
          title={program.name}
          subtitle={program.overview}
          badge={program.category?.name || 'Academic Degree'}
          breadcrumbs={[
            { label: 'Programs', href: '/programs' },
            { label: program.name },
          ]}
        >
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <GraduationCap className="w-4 h-4 text-brand-emerald-400" />
              <span>Level: {program.degreeLevel}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-brand-gold-400" />
              <span>Duration: {program.durationYears}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-brand-emerald-300" />
              <span>Mode: Full Time On-Campus</span>
            </div>
          </div>
        </PageHero>

        {/* Content Section */}
        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Program Details & Academic Breakdown */}
              <div className="lg:col-span-8 space-y-8">
                {/* Visual Cover Poster if available */}
                {program.imageUrl && (
                  <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-soft-md bg-brand-navy-900 border border-slate-200">
                    <Image
                      src={program.imageUrl}
                      alt={program.name}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-emerald-300 block">
                        Academic Stream
                      </span>
                      <span className="text-xl font-bold">{program.name}</span>
                    </div>
                  </div>
                )}

                {/* Course Overview */}
                <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-4">
                  <h2 className="text-2xl font-black text-brand-navy-950 font-heading">
                    Program Overview
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-base">
                    {program.overview}
                  </p>
                </Card>

                {/* Verified Eligibility Criteria */}
                {program.eligibilityCriteria && (
                  <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-emerald-100 text-brand-emerald-700 flex items-center justify-center">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-black text-brand-navy-950 font-heading">
                        Eligibility Requirements
                      </h3>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm leading-relaxed">
                      {program.eligibilityCriteria}
                    </div>
                    <p className="text-xs text-slate-500">
                      Note: Subject cutoffs and qualifying entrance scores vary depending on individual institutional regulations and government counseling norms.
                    </p>
                  </Card>
                )}

                {/* Career Opportunities */}
                {program.careerOpportunities && (
                  <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy-100 text-brand-navy-800 flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-black text-brand-navy-950 font-heading">
                        Career Directions & Prospects
                      </h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Graduates from this discipline actively pursue roles across top corporate, healthcare, or research environments:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {program.careerOpportunities.split(',').map((career: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-brand-navy-900"
                        >
                          <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                          <span>{career.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Admission Support & Process */}
                <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-4">
                  <h3 className="text-xl font-black text-brand-navy-950 font-heading">
                    Admission Support Through Shasthi Guru
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Our team provides complete end-to-end assistance for this program:
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>Cutoff evaluation and institution mapping based on your 12th marks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>Guidance on merit seats, government counseling codes, and application deadlines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>Document verification checklist and parent counseling sessions</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Right Column: Sticky Action & Guidance Box */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                <Card className="p-6 border-brand-emerald-200 bg-gradient-to-br from-white to-brand-emerald-50/30 shadow-soft-md space-y-6">
                  <div>
                    <Badge variant="emerald" size="sm">
                      Apply for 2026 Admissions
                    </Badge>
                    <h3 className="text-xl font-bold text-brand-navy-950 mt-2 font-heading">
                      Interested in {program.name}?
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Submit an inquiry with this course pre-selected to connect directly with an advisor.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={`/admission-query?program=${encodeURIComponent(program.name)}&area=${encodeURIComponent(program.category?.name || '')}`}
                      className="block w-full"
                    >
                      <Button
                        variant="emerald"
                        size="lg"
                        className="w-full justify-center"
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                      >
                        Submit Admission Query
                      </Button>
                    </Link>

                    <Link href="/counseling" className="block w-full">
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full justify-center text-brand-navy-900 border-slate-300 hover:bg-slate-50"
                        leftIcon={<PhoneCall className="w-4 h-4" />}
                      >
                        Talk to a Counselor
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                      <span>Official admission guidance desk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-navy-600 shrink-0" />
                      <span>Response within 24 business hours</span>
                    </div>
                  </div>
                </Card>

                {/* Back to all programs */}
                <div className="text-center">
                  <Link
                    href="/programs"
                    className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>← Browse all academic programs</span>
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
