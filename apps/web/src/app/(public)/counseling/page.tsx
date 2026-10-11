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
  Compass,
  BookOpen,
  UserCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Education & Career Counseling | Shasthi Guru Dream Campus',
  description:
    'Personalized educational counselling and course guidance for students after 12th standard. Unbiased support across colleges and academic streams in Tamil Nadu.',
};

export default function CounselingPage() {
  const counselingPillars = [
    {
      title: 'Career Counseling',
      icon: <Compass className="w-6 h-6 text-brand-emerald-500" />,
      description:
        'Helping students evaluate their innate interests, academic strengths, and long-term career aspirations to identify fitting industries.',
    },
    {
      title: 'Education Guidance',
      icon: <BookOpen className="w-6 h-6 text-brand-navy-600" />,
      description:
        'Demystifying degree hierarchies, curriculum differences, and postgraduate pathways across regular, professional, and allied health programs.',
    },
    {
      title: 'Course Selection',
      icon: <UserCheck className="w-6 h-6 text-brand-gold-500" />,
      description:
        'Mapping 12th mark cutoffs against realistic eligibility criteria to avoid mismatched course choices or academic burnout.',
    },
    {
      title: 'College Selection',
      icon: <Building2 className="w-6 h-6 text-brand-emerald-600" />,
      description:
        'Providing verified information on college accreditations, campus infrastructure, hostel facilities, and location factors.',
    },
    {
      title: 'Admission Guidance',
      icon: <GraduationCap className="w-6 h-6 text-brand-navy-700" />,
      description:
        'Guiding families through document preparation, application procedures, merit timelines, and official enrollment steps.',
    },
  ];

  const methodology = [
    {
      num: '1',
      title: 'Initial Profile Review',
      desc: 'We review your 12th standard subject stream, marks, and personal interests.',
    },
    {
      num: '2',
      title: 'Interactive 1-on-1 Dialogue',
      desc: 'Counselor discusses academic opportunities directly with you and your parents.',
    },
    {
      num: '3',
      title: 'Institutional Feasibility Analysis',
      desc: 'We map suitable courses and institutions matching your academic profile and budget.',
    },
    {
      num: '4',
      title: 'Actionable Admission Plan',
      desc: 'You receive clear timelines, documentation requirements, and step-by-step guidance.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Education & Career Counseling"
          subtitle="Your Dream, Our Direction. We provide personalized, evidence-based academic guidance to help students navigate critical higher education choices with clarity and confidence."
          badge="Student-Centered Guidance"
          breadcrumbs={[{ label: 'Counseling & Guidance' }]}
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/admission-query">
              <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Talk to a Counselor
              </Button>
            </Link>
            <Link href="/enquiry">
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                Submit General Enquiry
              </Button>
            </Link>
          </div>
        </PageHero>

        {/* 5 Core Pillars of Shasthi Guru Guidance */}
        <Section background="white" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <Badge variant="navy" size="md">
                Our Counselling Framework
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-navy-950 font-heading">
                Comprehensive Educational Guidance
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Every student possesses unique talents and constraints. Our five-pillar counselling framework ensures no decision is made on guesswork.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {counselingPillars.map((pillar, idx) => (
                <Card
                  key={idx}
                  hover
                  className="p-6 border-slate-200/80 bg-white space-y-4 hover:shadow-soft-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy-900 font-heading">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </Card>
              ))}

              {/* Special CTA Card */}
              <Card className="p-6 border-brand-emerald-200 bg-gradient-brand text-white flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Badge variant="gold" size="sm">
                    Ready to Connect?
                  </Badge>
                  <h3 className="text-xl font-bold font-heading">
                    Book a Free Guidance Session
                  </h3>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    Speak with an experienced educational mentor. We evaluate your marks and recommend verified college opportunities.
                  </p>
                </div>
                <Link href="/admission-query">
                  <Button variant="emerald" size="sm" className="w-full justify-center">
                    Book Session
                  </Button>
                </Link>
              </Card>
            </div>
          </Container>
        </Section>

        {/* Counselling Methodology */}
        <Section background="neutral" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="emerald" size="md">
                Transparent Process
              </Badge>
              <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                How Our Counselling Sessions Work
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {methodology.map((m, idx) => (
                <Card key={idx} className="p-6 border-slate-200 bg-white space-y-3 relative">
                  <span className="text-3xl font-black text-brand-emerald-500 font-mono">
                    {m.num}
                  </span>
                  <h4 className="font-bold text-brand-navy-900 text-base">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.desc}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Authentic Brand Campaign Visual Callout */}
        <Section background="white" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-soft-lg bg-brand-navy-900">
                <Image
                  src="/brand/poster-03.png"
                  alt="Shasthi Guru Academic Guidance Campaign"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="lg:col-span-6 space-y-6">
                <Badge variant="navy" size="md">
                  Beyond Admission
                </Badge>
                <h3 className="text-3xl font-black text-brand-navy-950 font-heading leading-tight">
                  Guiding You Towards a Great Future
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Our responsibility does not terminate at admission. We believe every aspiring student deserves access to accurate counsel, career awareness, and educational mentorship.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Mentors specialized across Engineering, Healthcare, and Management</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>In-depth knowledge of Tamil Nadu and national institutional requirements</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600 shrink-0" />
                    <span>Completely confidential student inquiry and consultation handling</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/admission-query">
                    <Button variant="emerald" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Request Counselling Call
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="md" className="border-slate-300">
                      Visit Guidance Desk
                    </Button>
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
