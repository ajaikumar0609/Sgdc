import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Card } from '@/components/ui/card';
import { ShieldCheck, FileCheck2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Shasthi Guru Dream Campus',
  description:
    'Terms of service and guidance conditions governing educational counselling and admission assistance at Shasthi Guru Dream Campus.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Terms & Conditions"
          subtitle="Conditions governing the educational counselling, admission advisory services, and platform usage of Shasthi Guru Dream Campus."
          badge="Advisory Terms"
          breadcrumbs={[{ label: 'Terms & Conditions' }]}
        />

        <Section background="white" spacing="lg">
          <Container className="max-w-4xl">
            <Card className="p-8 sm:p-12 border-slate-200 bg-white shadow-soft-sm space-y-8 text-slate-700 leading-relaxed text-sm">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Academic Year 2026-27 | Applicable to All Enquiries & Consultations
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  1. Scope of Educational Counselling
                </h2>
                <p>
                  Shasthi Guru Dream Campus operates as an independent higher education counselling and student advisory platform. Our services include:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Evaluation of student 12th marks, academic interests, and course eligibility.</li>
                  <li>Guidance regarding curriculum options across Engineering, Medical, Paramedical, Nursing, Pharmacy, Arts & Science, and Management.</li>
                  <li>Information sharing regarding college infrastructure, recognized approvals, and application schedules.</li>
                  <li>Step-by-step documentation and campus application submission support.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  2. Advisory Disclaimer & University Authority
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-brand-navy-950">
                    <AlertCircle className="w-4 h-4 text-brand-gold-600 shrink-0" />
                    <span>Important Guidance Disclaimer</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All final admission offers, seat allotments, cutoff revisions, and fee schedules are determined exclusively by the respective universities, statutory counseling bodies (such as TNEA, DME, etc.), and individual college management authorities. Shasthi Guru Dream Campus acts solely as an educational advisor and does not issue collegiate degree certificates or guarantee admissions contrary to statutory eligibility rules.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  3. Student & Parent Responsibility
                </h2>
                <p>
                  To ensure accurate guidance, applicants agree to provide authentic and accurate details regarding their 10th and 12th standard marks, subject stream, community status, and contact information. Inaccurate or fabricated academic details will invalidate counseling assessments.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  4. Intellectual Property
                </h2>
                <p>
                  All brand marks, logos, campaign posters, program guides, and curriculum analyses presented on this website are the property of Shasthi Guru Dream Campus and protected under applicable intellectual property laws. Unauthorized reproduction or commercial re-distribution without written permission is prohibited.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3 border-t border-slate-100 pt-6">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  5. Contact & Inquiries
                </h2>
                <p>
                  For any legal clarifications or official advisory terms inquiries, please reach out via our{' '}
                  <Link href="/contact" className="font-semibold text-brand-emerald-700 hover:underline">
                    Contact Desk
                  </Link>{' '}
                  or by email to{' '}
                  <a href="mailto:admissions@shasthiguru.com" className="font-semibold text-brand-navy-900 hover:underline">
                    admissions@shasthiguru.com
                  </a>.
                </p>
              </section>
            </Card>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
