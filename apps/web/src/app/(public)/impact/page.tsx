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
import { fetchFromApi } from '@/lib/api';
import {
  Users,
  Building2,
  Smile,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Impact & Reach | Shasthi Guru Dream Campus',
  description:
    'Explore verified education counselling reach, academic guidance metrics, and student welfare impact across Tamil Nadu.',
};

export default async function ImpactPage() {
  const res = await fetchFromApi<{ statistics: any[] }>('/api/welfare/impact');
  const statistics = res.success && res.data?.statistics ? res.data.statistics : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Our Impact & Reach"
          subtitle="Empowering students across Tamil Nadu with transparent, ethical education counselling. Built on verified outcomes and genuine student success."
          badge="Verified Guidance Record"
          breadcrumbs={[{ label: 'Our Impact' }]}
        />

        {/* Dynamic CMS-Ready Impact Metric Cards */}
        <Section background="white" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="emerald" size="md">
                Platform Milestones
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-navy-950 font-heading">
                Measurable Student Progress
              </h2>
              <p className="text-slate-600 text-sm">
                Real-time data powered by the Shasthi Guru education management system.
              </p>
            </div>

            {statistics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statistics.map((stat) => (
                  <Card
                    key={stat.id}
                    hover
                    className="p-8 border-slate-200/80 bg-white text-center space-y-3 shadow-soft-sm transition-all"
                  >
                    <span className="text-4xl sm:text-5xl font-black text-brand-navy-900 font-heading block">
                      {stat.numberLabel}
                    </span>
                    <h3 className="text-base font-bold text-brand-emerald-700">
                      {stat.title}
                    </h3>
                    {stat.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {stat.description}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">
                  Impact statistics are undergoing quarterly verification by our academic review team.
                </p>
              </div>
            )}
          </Container>
        </Section>

        {/* Geographic Coverage across Tamil Nadu */}
        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="navy" size="md">
                  Regional Reach
                </Badge>
                <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                  Guidance Across All 38 Districts of Tamil Nadu
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  From major metropolitan hubs like Chennai, Coimbatore, and Madurai to rural districts across Thanjavur, Dharmapuri, and Tirunelveli, Shasthi Guru Dream Campus reaches students who need authentic advice.
                </p>

                <div className="space-y-3 text-xs text-slate-700 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Statewide educational admission helpline and online guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Comprehensive coverage of government and private collegiate cutoffs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Equal focus on professional degrees and allied vocational disciplines</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-4">
                  <h4 className="font-bold text-brand-navy-900 text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-emerald-600" />
                    <span>Key Educational Hubs Covered</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">Chennai Region</div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">Coimbatore Belt</div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">Madurai & South</div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">Tiruchirappalli</div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">Salem & Erode</div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">Delta Districts</div>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="navy" spacing="md" className="bg-brand-navy-900 text-white text-center">
          <Container className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-3xl font-black text-white font-heading">
              Be Part of Our Next Success Journey
            </h3>
            <p className="text-slate-300 text-sm">
              Take the first step toward your academic future with verified admission counseling.
            </p>
            <div className="pt-2">
              <Link href="/admission-query">
                <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Submit Admission Query
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
