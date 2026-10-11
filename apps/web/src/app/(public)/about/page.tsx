import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  BookOpen,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Shasthi Guru Dream Campus',
  description:
    'Learn about Shasthi Guru Dream Campus — our guiding philosophy, commitment to ethical education counselling, and mission to help students discover their true potential.',
};

export default function AboutPage() {
  const coreValues = [
    {
      title: 'Integrity Above All',
      desc: 'We present factual, verified information on courses, college accreditations, and realistic admission timelines without exaggeration.',
      icon: <ShieldCheck className="w-6 h-6 text-brand-emerald-500" />,
    },
    {
      title: 'Student-First Orientation',
      desc: 'Every guidance conversation is tailored to the individual student’s aptitude, 12th marks, and long-term career fulfillment.',
      icon: <Compass className="w-6 h-6 text-brand-navy-600" />,
    },
    {
      title: 'Transparent Admissions',
      desc: 'We clarify the true difference between government counseling, management quotas, and institutional merit paths.',
      icon: <BookOpen className="w-6 h-6 text-brand-gold-500" />,
    },
    {
      title: 'Long-Term Mentorship',
      desc: 'Beyond admission, towards a great future. We believe guidance extends into campus acclimatization and continuous learning.',
      icon: <GraduationCap className="w-6 h-6 text-brand-emerald-600" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="About Shasthi Guru Dream Campus"
          subtitle="Guiding Dreams. Building Futures. We are a dedicated educational guidance and admission counseling organization committed to unlocking students' collegiate potential."
          badge="Our Story & Vision"
          breadcrumbs={[{ label: 'About Us' }]}
        />

        {/* Who We Are */}
        <Section background="white" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="emerald" size="md">
                  Who We Are
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-brand-navy-950 font-heading">
                  Empowering Every Aspiring Student to Find Their Direction
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">
                  Shasthi Guru Dream Campus was founded with a singular purpose: to demystify collegiate admissions for students and parents across Tamil Nadu and South India.
                </p>
                <p className="text-slate-600 leading-relaxed text-sm">
                  With rapid expansions in engineering subfields, paramedical technologies, nursing, and modern business curriculums, students often find the transition from 12th standard overwhelming. Our experienced academic advisors act as trusted navigators, mapping student talents to accredited institutions.
                </p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-semibold text-brand-navy-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Personalized Mentorship</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Verified Academic Pathways</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Zero Misleading Claims</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Complete Application Support</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-soft-lg bg-brand-navy-900 border border-slate-200">
                <Image
                  src="/brand/poster-01.png"
                  alt="Shasthi Guru Dream Campus Academic Direction"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* Core Values */}
        <Section background="neutral" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="navy" size="md">
                Guiding Principles
              </Badge>
              <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                Our Foundational Values
              </h3>
              <p className="text-slate-600 text-sm">
                Built on authentic counsel, student empathy, and institutional clarity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((val, idx) => (
                <Card key={idx} className="p-6 border-slate-200/80 bg-white space-y-3 shadow-soft-sm">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    {val.icon}
                  </div>
                  <h4 className="text-lg font-bold text-brand-navy-900 font-heading">
                    {val.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {val.desc}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Vision and Mission */}
        <Section background="white" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-brand-navy-100 bg-gradient-to-br from-white to-slate-50 space-y-4">
                <Badge variant="navy" size="sm">
                  Our Vision
                </Badge>
                <h3 className="text-2xl font-black text-brand-navy-950 font-heading">
                  A Future Where Every Student Has Clear Direction
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  To become the most reliable and student-centric higher education counselling platform, celebrated for integrity, personalized insight, and genuine student advancement across South India.
                </p>
              </Card>

              <Card className="p-8 border-brand-emerald-100 bg-gradient-to-br from-white to-brand-emerald-50/20 space-y-4">
                <Badge variant="emerald" size="sm">
                  Our Mission
                </Badge>
                <h3 className="text-2xl font-black text-brand-navy-950 font-heading">
                  Delivering Honest, Actionable Guidance
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  To provide transparent course analysis, cutoff evaluations, and step-by-step admission assistance that bridges aspiring students with legitimate colleges suited to their potential.
                </p>
              </Card>
            </div>
          </Container>
        </Section>

        {/* CTA Banner */}
        <Section background="navy" spacing="md" className="bg-brand-navy-900 text-white text-center">
          <Container className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-3xl font-black text-white font-heading">
              Ready to Explore Your Academic Possibilities?
            </h3>
            <p className="text-slate-300 text-sm">
              Connect with our counseling team today to discuss your 12th marks, course options, and college admissions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/admission-query">
                <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Submit Admission Query
                </Button>
              </Link>
              <Link href="/programs">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                  Explore Programs
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
