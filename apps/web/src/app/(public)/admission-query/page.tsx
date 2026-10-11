import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { StudentEnquiryForm } from '@/components/forms/StudentEnquiryForm';
import { Card } from '@/components/ui/card';
import {
  ShieldCheck,
  Phone,
  Clock,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submit Admission Query | Shasthi Guru Dream Campus',
  description:
    'Submit your official higher education admission query. Receive trackable reference code and personalized guidance from Shasthi Guru education counselors.',
};

export default function AdmissionQueryPage({
  searchParams,
}: {
  searchParams?: { program?: string; area?: string };
}) {
  const initialProgram = searchParams?.program || '';
  const initialArea = searchParams?.area || '';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Student Admission Query"
          subtitle="Take the first step toward your dream career. Fill out your details below to receive personalized guidance, cutoff evaluation, and course advice from our counseling desk."
          badge="2026-27 Academic Admissions"
          breadcrumbs={[
            { label: 'Admission', href: '/admission' },
            { label: 'Admission Query' },
          ]}
        />

        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Main Column: Official Reusable Single Student Enquiry Form */}
              <div className="lg:col-span-8">
                <StudentEnquiryForm
                  source="ADMISSION_QUERY"
                  defaultProgram={initialProgram}
                  defaultArea={initialArea}
                  title="Official Admission & Guidance Query"
                  subtitle="Submit your verified details. Our counseling team will review your subject background and discuss collegiate opportunities with you."
                />
              </div>

              {/* Sidebar Companion Cards: Trust, Verification & Steps */}
              <div className="lg:col-span-4 space-y-6">
                {/* What Happens Next Card */}
                <Card className="p-6 border-brand-navy-100 bg-white shadow-soft-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-emerald-100 text-brand-emerald-700 flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-brand-navy-950 text-base">
                      What Happens Next?
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-navy-100 text-brand-navy-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <p>
                        <strong className="text-slate-900 block font-semibold">Instant Tracking Code</strong>
                        You immediately receive a unique reference code (e.g. <span className="font-mono text-brand-navy-800">SG-2026-XXXXX</span>) for your query.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-navy-100 text-brand-navy-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <p>
                        <strong className="text-slate-900 block font-semibold">Counselor Assignment</strong>
                        An academic mentor specializing in your area of interest is assigned to evaluate your 12th marks and stream.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-navy-100 text-brand-navy-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <p>
                        <strong className="text-slate-900 block font-semibold">Personalized Guidance Call</strong>
                        Our counselor connects with you and your family to explain eligible courses, college environments, and timelines.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Data Privacy & Consent Box */}
                <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Data Privacy Commitment</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your personal information is strictly utilized for academic counselling and admission guidance. We do not sell or distribute student data to third-party marketing companies.
                  </p>
                </Card>

                {/* Direct Telephone Helpline */}
                <Card className="p-6 border-brand-navy-200 bg-brand-navy-900 text-white shadow-soft-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-gold-400 font-bold text-sm">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>Need Immediate Guidance?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Prefer speaking to a counselor right now? Call our admission helpdesk directly during office hours (9:00 AM - 6:00 PM IST).
                  </p>
                  <div className="pt-1">
                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center gap-2 font-mono font-bold text-brand-emerald-400 hover:text-brand-emerald-300 text-sm"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
