import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { ContactForm } from '@/components/forms/ContactForm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Shasthi Guru Dream Campus',
  description:
    'Get in touch with Shasthi Guru Dream Campus admission guidance and student counselling team in Tamil Nadu.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Contact Shasthi Guru Dream Campus"
          subtitle="Have questions about college admission, courses, cutoffs, or educational counselling? Connect with our team today."
          badge="Guidance Helpline"
          breadcrumbs={[{ label: 'Contact Us' }]}
        />

        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Official Contact Form */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              {/* Right Column: Verified Contact Information & Hours */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-6">
                  <h3 className="font-bold text-brand-navy-950 text-xl font-heading border-b border-slate-100 pb-3">
                    Contact Information
                  </h3>

                  <div className="space-y-5 text-sm text-slate-700">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-brand-emerald-100 text-brand-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy-900 text-xs uppercase tracking-wider">
                          Center Location
                        </h4>
                        <p className="mt-0.5 text-slate-600 leading-relaxed text-sm">
                          Dream Campus Educational Center, Tamil Nadu, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-brand-navy-100 text-brand-navy-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy-900 text-xs uppercase tracking-wider">
                          Phone Helpline
                        </h4>
                        <a
                          href="tel:+919876543210"
                          className="mt-0.5 block font-mono font-bold text-brand-navy-900 hover:text-brand-emerald-600 transition-colors"
                        >
                          +91 98765 43210
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-brand-gold-100 text-brand-gold-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy-900 text-xs uppercase tracking-wider">
                          Email Enquiries
                        </h4>
                        <a
                          href="mailto:admissions@shasthiguru.com"
                          className="mt-0.5 block font-medium text-brand-navy-900 hover:text-brand-emerald-600 transition-colors"
                        >
                          admissions@shasthiguru.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy-900 text-xs uppercase tracking-wider">
                          Counseling Office Hours
                        </h4>
                        <p className="mt-0.5 text-slate-600 text-xs">
                          Monday – Saturday: 9:00 AM – 6:00 PM IST
                        </p>
                        <p className="text-slate-400 text-xs">Closed on National & Public Holidays</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Response Quality Commitment */}
                <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Our Response Guarantee</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All student questions and admission inquiries are answered by verified academic advisors. We treat your information with complete confidentiality.
                  </p>
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
