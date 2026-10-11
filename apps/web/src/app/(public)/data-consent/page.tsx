import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Card } from '@/components/ui/card';
import { ShieldCheck, CheckCircle2, Lock, FileCheck2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data & Consent Policy | Shasthi Guru Dream Campus',
  description:
    'Detailed policy regarding student information collection, parental consent, Aadhaar data encryption safeguards, and communication preferences.',
};

export default function DataConsentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Data & Consent Policy"
          subtitle="Understanding how your consent is captured, how your information is safeguarded, and how you retain control over your academic data."
          badge="Informed Consent"
          breadcrumbs={[{ label: 'Data Consent' }]}
        />

        <Section background="white" spacing="lg">
          <Container className="max-w-4xl">
            <Card className="p-8 sm:p-12 border-slate-200 bg-white shadow-soft-sm space-y-8 text-slate-700 leading-relaxed text-sm">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Academic Year 2026-27 | Transparent Consent Framework
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  1. The Shasthi Guru Consent Model
                </h2>
                <p>
                  Before any student inquiry or admission query is registered in our database, we require unambiguous consent from the applicant or their parent/guardian. When you check the consent agreement on our enquiry forms, you authorize Shasthi Guru Dream Campus to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Store your academic profile, 12th marks, and contact details in our secure CRM.</li>
                  <li>Assign an authorized academic counselor to contact you via telephone call, SMS, or WhatsApp regarding suitable collegiate programs.</li>
                  <li>Share relevant educational brochures, cutoff analyses, and admission timelines.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  2. Parental & Guardian Representation
                </h2>
                <p>
                  Many 12th standard students completing secondary schooling are between 17 and 18 years old. We actively encourage and welcome parental involvement in every step of the counselling journey. A parent or legal guardian may submit queries on behalf of the student or participate directly in all guidance sessions.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  3. Identity & Aadhaar Information Protocol
                </h2>
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-brand-navy-950 text-base">
                    <Lock className="w-4 h-4 text-brand-emerald-600" />
                    <span>How We Treat Identity Credentials</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aadhaar numbers or government identity cards are <strong>never required</strong> for general counselling, course browsing, or initial college shortlisting.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If identity data is collected during later stages for formal institutional scholarship or application forms, it is handled with zero-trust application controls:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                    <li>Strict feature-flag gating (<code className="font-mono bg-white px-1 py-0.5 rounded border">ENABLE_AADHAAR_COLLECTION</code>).</li>
                    <li>Automatic symmetric encryption (AES-256-GCM) prior to database persistence.</li>
                    <li>Strict redaction: never displayed in plain text in counselor interfaces or API responses.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  4. Revocation of Consent & Opt-Out Rights
                </h2>
                <p>
                  Consent is voluntary and can be withdrawn at any time. If you decide to pause counselling or wish to remove your profile from our guidance database:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                  <li>Inform your assigned counselor during any follow-up call.</li>
                  <li>Alternatively, send an email to <a href="mailto:admissions@shasthiguru.com" className="font-semibold text-brand-emerald-700 hover:underline">admissions@shasthiguru.com</a> quoting your Enquiry Reference ID (e.g. <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">SG-YYYY-XXXXX</span>).</li>
                </ol>
                <p className="text-xs text-slate-500 pt-1">
                  Upon receiving an opt-out request, your file status is updated to closed within 2 business days and no further outreach will occur.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3 border-t border-slate-100 pt-6">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  5. Questions Regarding Data Practices
                </h2>
                <p>
                  Please review our full{' '}
                  <Link href="/privacy-policy" className="font-semibold text-brand-emerald-700 hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for details on data retention periods and security standards.
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
