import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Shasthi Guru Dream Campus',
  description:
    'Official Privacy Policy for Shasthi Guru Dream Campus detailing student personal data collection, protection, and retention protocols.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Privacy Policy"
          subtitle="How Shasthi Guru Dream Campus collects, protects, and respects the personal information of students, parents, and visitors."
          badge="Data Governance"
          breadcrumbs={[{ label: 'Privacy Policy' }]}
        />

        <Section background="white" spacing="lg">
          <Container className="max-w-4xl">
            <Card className="p-8 sm:p-12 border-slate-200 bg-white shadow-soft-sm space-y-8 text-slate-700 leading-relaxed text-sm">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Effective Date: Academic Year 2026-27 | Last Revised: October 2026
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  1. Information We Collect
                </h2>
                <p>
                  When you submit an admission query, register an enquiry, or communicate with our education counselors, we collect necessary academic and contact details:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Student Contact Information:</strong> Full name, mobile phone number, email address, residential address, and district in Tamil Nadu or other states.</li>
                  <li><strong>Academic Profile:</strong> 12th standard (HSC / CBSE / ISC) percentage or marks, stream of study, and intended course of interest.</li>
                  <li><strong>Communication Records:</strong> Notes of counselling conversations, preferred college locations, and scheduled follow-up dates.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  2. Purpose of Data Processing
                </h2>
                <p>We process student data strictly for legitimate educational guidance purposes:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Evaluating collegiate eligibility and cutoff suitability for degree courses.</li>
                  <li>Contacting students and parents to provide transparent admission counsel.</li>
                  <li>Assigning a dedicated academic counselor to guide the application journey.</li>
                  <li>Generating and tracking your unique enquiry reference (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">SG-YYYY-XXXXX</code>).</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  3. Identity & Aadhaar Data Protection
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-brand-navy-950">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Aadhaar Policy & Encryption</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aadhaar collection is strictly controlled via system feature flags and is <strong>not mandatory</strong> for initial educational counselling. In the event Aadhaar information is provided during formal college registration assistance, it is encrypted immediately at the application tier using industry-standard AES-256-GCM encryption and is never exposed in plain text in public responses or logs.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  4. Non-Disclosure & Third-Party Sharing
                </h2>
                <p>
                  Shasthi Guru Dream Campus operates with strict confidentiality. We do not sell, rent, or lease student contact databases to telemarketers or unauthorized third-party commercial entities. Student information is shared only with verified collegiate admission offices upon explicit request and consent from the student and parent.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  5. Data Retention & Student Rights
                </h2>
                <p>
                  We retain enquiry records for the duration of the current academic admission cycle to provide continuous support. Students and parents retain the right to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Request a copy of the details stored against their enquiry reference.</li>
                  <li>Request correction of inaccurate academic marks or contact details.</li>
                  <li>Request deletion or closure of their admission query file at any time.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-3 border-t border-slate-100 pt-6">
                <h2 className="text-xl font-bold text-brand-navy-950 font-heading">
                  6. Contact the Data Governance Desk
                </h2>
                <p>
                  For any privacy questions or data access requests, please email us at{' '}
                  <a href="mailto:admissions@shasthiguru.com" className="font-semibold text-brand-emerald-700 hover:underline">
                    admissions@shasthiguru.com
                  </a>{' '}
                  or review our companion{' '}
                  <Link href="/data-consent" className="font-semibold text-brand-navy-900 hover:underline">
                    Data & Consent Policy
                  </Link>.
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
