import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgramCard, ProgramItem } from '@/components/public/ProgramCard';
import { NewsCard, NewsItem } from '@/components/public/NewsCard';
import { StudentEnquiryForm } from '@/components/forms/StudentEnquiryForm';
import { fetchFromApi } from '@/lib/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  BookOpen,
  HeartHandshake,
  Award,
  CheckCircle2,
  PhoneCall,
  Clock,
  UserCheck,
  Building2,
  GraduationCap,
  Heart,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shasthi Guru Dream Campus | Guiding Dreams. Building Futures.',
  description:
    'Complete higher education counselling, course discovery, and collegiate admission support for ambitious students across Tamil Nadu and India.',
};

export default async function HomePage() {
  // Fetch real dynamic data from the Express REST API
  const [progRes, newsRes, impactRes] = await Promise.all([
    fetchFromApi<{ programs: ProgramItem[] }>('/api/programs'),
    fetchFromApi<{ articles: NewsItem[] }>('/api/news?limit=3'),
    fetchFromApi<{ statistics: any[] }>('/api/impact'),
  ]);

  const featuredPrograms =
    progRes.success && progRes.data?.programs ? progRes.data.programs.slice(0, 3) : [];
  const latestNews =
    newsRes.success && newsRes.data?.articles ? newsRes.data.articles.slice(0, 3) : [];
  const impactStatistics =
    impactRes.success && impactRes.data?.statistics ? impactRes.data.statistics : [];

  const admissionSteps = [
    {
      num: '01',
      title: 'Discover',
      desc: 'Identify your true potential, academic strengths, and career aspirations.',
    },
    {
      num: '02',
      title: 'Explore',
      desc: 'Compare accredited programs across Engineering, Healthcare, and Management.',
    },
    {
      num: '03',
      title: 'Get Guidance',
      desc: 'Receive transparent 1-on-1 counsel tailored to your 12th marks and cutoff.',
    },
    {
      num: '04',
      title: 'Submit Enquiry',
      desc: 'Register an official tracked query into our student guidance network.',
    },
    {
      num: '05',
      title: 'Counseling',
      desc: 'Review eligible college environments, quotas, and application timelines.',
    },
    {
      num: '06',
      title: 'Admission Support',
      desc: 'Receive step-by-step documentation and reporting assistance.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION WITH AUTHENTIC BRAND IDENTITY & POSTERS */}
        <Section background="navy" spacing="lg" className="relative overflow-hidden bg-gradient-brand">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-brand-navy-400/20 blur-3xl pointer-events-none" />

          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Authentic Brand Value Proposition */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-400" />
                  <span>Your Dream, Our Direction</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  Guiding Dreams.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald-400 to-emerald-200">
                    Building Futures.
                  </span>
                </h1>

                <p className="text-lg text-slate-200 max-w-xl leading-relaxed">
                  Beyond admission. Towards a great future. Shasthi Guru Dream Campus provides expert educational counselling, course discovery, and complete admission support tailored for ambitious students.
                </p>

                {/* Primary Conversion CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/admission-query">
                    <Button
                      variant="emerald"
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Admission Query
                    </Button>
                  </Link>
                  <Link href="/programs">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-white border-white/30 hover:bg-white/10"
                      leftIcon={<BookOpen className="w-5 h-5 text-brand-gold-400" />}
                    >
                      Explore Programs
                    </Button>
                  </Link>
                  <Link href="/counseling">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-slate-200 hover:text-white hover:bg-white/10"
                      leftIcon={<PhoneCall className="w-4 h-4 text-brand-emerald-400" />}
                    >
                      Talk to a Counselor
                    </Button>
                  </Link>
                </div>

                {/* Key Value Points from Brand Posters */}
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                    <span>Expert Counselling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                    <span>Wide Range of Colleges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                    <span>Complete Admission Support</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Authentic Poster Showcase */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-brand-navy-950 group">
                  <Image
                    src="/brand/poster-01.png"
                    alt="Shasthi Guru Official Educational Guidance Poster"
                    width={500}
                    height={750}
                    className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-950/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-300">
                        Official Campaign Asset
                      </span>
                      <Badge variant="emerald" size="sm">Verified</Badge>
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      Explore • Learn • Achieve
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* 2. WHY SHASTHI GURU SECTION */}
        <Section background="white" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="emerald" size="md">
                Why Shasthi Guru
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                We Don&apos;t Just Guide, We Build Futures
              </h2>
              <p className="text-base text-slate-600">
                Choosing the right education pathway after 12th standard shapes a lifetime. Our dedicated education mentors help you select courses and universities with clarity and confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card hover className="p-6 border-slate-200/80 bg-white transition-all shadow-soft-sm group">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy-50 text-brand-navy-800 flex items-center justify-center mb-5 group-hover:bg-brand-navy-800 group-hover:text-white transition-colors">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-heading">Expert Counselling</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Personalized 1-on-1 guidance from experienced academic consultants assessing eligibility, aptitude, and long-term career prospects.
                </p>
              </Card>

              <Card hover className="p-6 border-slate-200/80 bg-white transition-all shadow-soft-sm group">
                <div className="w-12 h-12 rounded-2xl bg-brand-emerald-50 text-brand-emerald-700 flex items-center justify-center mb-5 group-hover:bg-brand-emerald-600 group-hover:text-white transition-colors">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-heading">Wide Range of Universities</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Connections with recognized colleges offering Engineering, Medical, Paramedical, Nursing, Arts & Science, and Management.
                </p>
              </Card>

              <Card hover className="p-6 border-slate-200/80 bg-white transition-all shadow-soft-sm group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5 group-hover:bg-brand-gold-500 group-hover:text-slate-900 transition-colors">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-heading">Complete Admission Support</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Transparent guidance through application documentation, verification, fee structures, and scholarship awareness from enquiry to enrollment.
                </p>
              </Card>
            </div>
          </Container>
        </Section>

        {/* 3. ADMISSION JOURNEY SECTION */}
        <Section background="neutral" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="navy" size="md">
                Streamlined Path
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-navy-950 font-heading">
                The Student Admission Journey
              </h2>
              <p className="text-slate-600 text-sm">
                From initial curiosity to your first lecture on campus, here is our 6-step roadmap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {admissionSteps.map((step, idx) => (
                <Card
                  key={idx}
                  className="p-5 border-slate-200 bg-white space-y-2 text-center relative hover:border-brand-emerald-300 transition-colors"
                >
                  <span className="text-2xl font-black text-brand-emerald-600 font-mono block">
                    {step.num}
                  </span>
                  <h4 className="font-bold text-brand-navy-900 text-sm">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-snug">
                    {step.desc}
                  </p>
                </Card>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link href="/admission">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Learn more about the admission process
                </Button>
              </Link>
            </div>
          </Container>
        </Section>

        {/* 4. STUDY & PROGRAMS (REAL BACKEND API) */}
        {featuredPrograms.length > 0 && (
          <Section background="white" spacing="lg">
            <Container className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="emerald" size="sm">
                    Verified Degree Programs
                  </Badge>
                  <h2 className="text-3xl font-black text-brand-navy-950 font-heading">
                    Explore Featured Courses
                  </h2>
                  <p className="text-slate-600 text-sm max-w-xl">
                    Browse accredited programs in high-demand fields like Engineering, Paramedical Sciences, and Nursing.
                  </p>
                </div>
                <Link href="/programs" className="shrink-0">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All Programs
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPrograms.map((prog) => (
                  <ProgramCard key={prog.id} program={prog} />
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* 5. COUNSELING & GUIDANCE SPOTLIGHT */}
        <Section background="navy" spacing="lg" className="bg-brand-navy-900 text-white">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="gold" size="sm">
                  1-on-1 Guidance
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-white font-heading leading-tight">
                  Confused About Cutoffs & Eligible Colleges?
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our educational counselors assess your 12th marks, interests, and budget to recommend the most viable institutions without false claims or hidden fees.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                    <span>Transparent cutoff and merit quota analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                    <span>Parent-inclusive consultations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                    <span>Clear document requirements for smooth admission</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link href="/counseling">
                    <Button variant="emerald" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Explore Counseling
                    </Button>
                  </Link>
                  <Link href="/admission-query">
                    <Button variant="outline" size="md" className="text-white border-white/30 hover:bg-white/10">
                      Submit Query
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl bg-brand-navy-950 border border-white/10">
                <Image
                  src="/brand/poster-03.png"
                  alt="Counseling and guidance session"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* 6. OUR IMPACT (REAL CMS METRICS) */}
        {impactStatistics.length > 0 && (
          <Section background="neutral" spacing="lg">
            <Container className="space-y-10">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <Badge variant="navy" size="sm">
                  Track Record
                </Badge>
                <h2 className="text-3xl font-black text-brand-navy-950 font-heading">
                  Guidance at a Glance
                </h2>
                <p className="text-slate-600 text-sm">
                  Verified platform data reflecting student interactions and statewide coverage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {impactStatistics.map((stat) => (
                  <Card key={stat.id} className="p-6 border-slate-200/80 bg-white text-center space-y-2 shadow-soft-sm">
                    <span className="text-4xl font-black text-brand-navy-900 font-heading block">
                      {stat.numberLabel}
                    </span>
                    <h3 className="text-sm font-bold text-brand-emerald-700">
                      {stat.title}
                    </h3>
                    {stat.description && (
                      <p className="text-xs text-slate-500">{stat.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* 7. NEWS / UPDATES (REAL BACKEND API) */}
        {latestNews.length > 0 && (
          <Section background="white" spacing="lg">
            <Container className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="emerald" size="sm">
                    Latest Insights
                  </Badge>
                  <h2 className="text-3xl font-black text-brand-navy-950 font-heading">
                    Academic News & Updates
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Official admission announcements, career trends, and collegiate guidelines.
                  </p>
                </div>
                <Link href="/news">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All News
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* 8. FINAL CONVERSION SECTION: EMBEDDED SINGLE STUDENT ENQUIRY FORM */}
        <Section background="neutral" spacing="lg" className="border-t border-slate-200">
          <Container>
            <div className="max-w-4xl mx-auto">
              <StudentEnquiryForm
                source="HOME_HERO"
                title="Start Your Higher Education Journey Today"
                subtitle="Submit your details for personalized course shortlisting, cutoff evaluation, and admission guidance."
              />
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
