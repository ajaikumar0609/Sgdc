import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight,
  FileCheck2,
  Building,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support Student Education | Shasthi Guru Dream Campus',
  description:
    'Information regarding student educational sponsorships and welfare enablement. Transparent compliance notice regarding online payment processing.',
};

export default function DonatePage() {
  const isDonationModuleEnabled = process.env.ENABLE_DONATION_MODULE === 'true';
  const isPaymentGatewayEnabled = process.env.ENABLE_PAYMENT_GATEWAY === 'true';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Support Student Education"
          subtitle="Empower ambitious students with collegiate access, book grants, and merit guidance. Transparency and governance are at the heart of our mission."
          badge="Education Welfare"
          breadcrumbs={[
            { label: 'Student Welfare', href: '/student-welfare' },
            { label: 'Support Education' },
          ]}
        />

        <Section background="neutral" spacing="lg">
          <Container className="max-w-4xl space-y-10">
            {/* Controlled State Notice Box */}
            {(!isDonationModuleEnabled || !isPaymentGatewayEnabled) && (
              <Card className="p-8 border-brand-gold-300 bg-brand-gold-50/50 shadow-soft-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold-100 text-brand-gold-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <Badge variant="gold" size="sm">
                      Governance & Compliance Status
                    </Badge>
                    <h2 className="text-xl font-bold text-brand-navy-950">
                      Online Monetary Payment Gateway Is Under Scheduled Compliance Review
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      In strict adherence to financial transparency protocols and institutional compliance rules, automated online payment gateway transactions are currently paused until final statutory filings are active.
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We do not accept unverified online transactions. If you wish to sponsor student educational fees, please contact our authorized student welfare trustees directly.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Educational Sponsorship Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-emerald-100 text-brand-emerald-700 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy-950 text-lg">
                      Institutional Sponsorship
                    </h3>
                    <p className="text-xs text-slate-500">For trusts, alumni & corporate CSR</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Organizations and individuals who wish to sponsor student education can establish named scholarship grants or adopt a student cohort for college tuition.
                </p>

                <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Direct college tuition fee routing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Full academic progress reports provided</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Audited transparent accounts</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy-100 text-brand-navy-800 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy-950 text-lg">
                      Official Contact Desk
                    </h3>
                    <p className="text-xs text-slate-500">Direct verification and assistance</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  For all verified donation inquiries and formal verification:
                </p>

                <div className="space-y-3 pt-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Email Inquiry:</span>
                    <a
                      href="mailto:welfare@shasthiguru.com"
                      className="font-medium text-brand-navy-900 hover:text-brand-emerald-600"
                    >
                      welfare@shasthiguru.com
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Phone Consultation:</span>
                    <a
                      href="tel:+919876543210"
                      className="font-mono font-bold text-brand-navy-900 hover:text-brand-emerald-600"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Submit Sponsorship Inquiry
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
