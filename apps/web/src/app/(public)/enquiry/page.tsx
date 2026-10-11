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
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  MapPin,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Student Enquiry & Academic Guidance | Shasthi Guru Dream Campus',
  description:
    'Register your student inquiry for personalized higher education advice, course selection, and college guidance across Tamil Nadu.',
};

export default function EnquiryPage({
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
          title="Student Guidance & Enquiry"
          subtitle="Looking for course clarity, institutional details, or application support? Submit your enquiry below to connect with an experienced educational advisor."
          badge="Higher Education Guidance Desk"
          breadcrumbs={[{ label: 'Student Enquiry' }]}
        />

        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Main Column: Reusable Student Enquiry Form */}
              <div className="lg:col-span-8">
                <StudentEnquiryForm
                  source="ENQUIRY_PAGE"
                  defaultProgram={initialProgram}
                  defaultArea={initialArea}
                  title="Official Student Enquiry Form"
                  subtitle="Submit your academic background and interests. Our team will verify your query and guide you through eligible courses."
                />
              </div>

              {/* Sidebar Companion Cards */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-6 border-brand-navy-100 bg-white shadow-soft-sm space-y-4">
                  <h3 className="font-bold text-brand-navy-950 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-brand-emerald-600" />
                    <span>Why Register With Us?</span>
                  </h3>

                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>One-on-one personalized counseling with verified advisors</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>Complete clarity on eligibility, cutoffs, and seat allocations</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>Zero bias — recommendations based on your merit and career goals</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0 mt-0.5" />
                      <span>Trackable reference ID generated instantly upon submission</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-navy-900 font-bold text-sm">
                    <Clock className="w-4 h-4 text-brand-gold-500 shrink-0" />
                    <span>Response Timeline</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our team reviews inquiries chronologically. You can expect contact from an assigned counselor within 24 business hours.
                  </p>
                </Card>

                <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-navy-900 font-bold text-sm">
                    <Phone className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Direct Counseling Helpline</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If you have an urgent inquiry or impending application deadline, please call:
                  </p>
                  <a
                    href="tel:+919876543210"
                    className="inline-block font-mono font-bold text-brand-navy-900 hover:text-brand-emerald-600 text-sm"
                  >
                    +91 98765 43210
                  </a>
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
