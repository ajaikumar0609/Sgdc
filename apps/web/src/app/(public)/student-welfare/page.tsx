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
import { fetchFromApi } from '@/lib/api';
import {
  Heart,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Student Welfare & Education Support | Shasthi Guru Dream Campus',
  description:
    'Dedicated to uplifting ambitious students through accessible education counselling, merit support, and holistic higher education enablement.',
};

export default async function StudentWelfarePage() {
  const storiesRes = await fetchFromApi<{ stories: any[] }>('/api/welfare/stories');
  const stories = storiesRes.success && storiesRes.data?.stories ? storiesRes.data.stories : [];
  const supportPillars = [
    {
      title: 'Free Academic Counselling',
      desc: 'Providing objective collegiate guidance to students from under-resourced rural and urban schools regardless of economic background.',
    },
    {
      title: 'Fee Transparency & Scholarship Guidance',
      desc: 'Helping families understand government welfare schemes, first-graduate concessions, and legitimate institutional merit fee concessions.',
    },
    {
      title: 'Documentation & Application Assistance',
      desc: 'Assisting first-generation college aspirants with application paperwork, certificates, and admission quota deadlines.',
    },
    {
      title: 'Post-Admission Mentorship',
      desc: 'Continuing support throughout the collegiate transition to ensure students adapt smoothly to campus academic environments.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Student Welfare & Education Enablement"
          subtitle="Education is the greatest equalizer. Shasthi Guru Dream Campus is committed to removing barriers so that deserving students can access quality collegiate opportunities."
          badge="Social Impact & Student Care"
          breadcrumbs={[{ label: 'Student Welfare' }]}
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/admission-query">
              <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Apply for Guidance
              </Button>
            </Link>
            <Link href="/donate">
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10" leftIcon={<Heart className="w-4 h-4 text-brand-gold-400" />}>
                Support Student Education
              </Button>
            </Link>
          </div>
        </PageHero>

        {/* Welfare Philosophy */}
        <Section background="white" spacing="lg">
          <Container className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="emerald" size="md">
                  Our Mission
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-brand-navy-950 font-heading">
                  Why We Champion Student Welfare
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">
                  Thousands of talented 12th standard students across Tamil Nadu miss out on accredited collegiate degrees simply due to a lack of accurate information, complex application procedures, or anxiety about fee structures.
                </p>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Our welfare initiatives ensure that every student has access to an experienced mentor who can walk them through real cutoff possibilities, government aid avenues, and career-aligned degree courses.
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs font-semibold text-brand-navy-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald-600" />
                    <span>Ethical Guidance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600" />
                    <span>Equal Opportunity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-600" />
                    <span>Transparent Support</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-soft-lg bg-brand-navy-900">
                <Image
                  src="/brand/poster-02.png"
                  alt="Student Welfare & Opportunity Guidance"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* Areas of Support */}
        <Section background="neutral" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="navy" size="md">
                Where Support Goes
              </Badge>
              <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                Key Student Welfare Initiatives
              </h3>
              <p className="text-slate-600 text-sm">
                How we assist students from various backgrounds to secure higher education access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportPillars.map((item, idx) => (
                <Card key={idx} className="p-6 border-slate-200/80 bg-white space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-emerald-100 text-brand-emerald-700 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-brand-navy-900 text-lg">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-11">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Student Stories (CMS) */}
        {stories.length > 0 && (
          <Section background="white" spacing="lg">
            <Container className="space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <Badge variant="emerald" size="md">
                  Success Stories
                </Badge>
                <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                  Real Student Outcomes
                </h3>
                <p className="text-slate-600 text-sm">
                  Hear directly from students who secured their dream collegiate program with our guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <Card key={story.id} className="p-0 border-slate-200/80 overflow-hidden shadow-soft-sm flex flex-col h-full">
                    {story.coverImage && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="p-6 pb-2">
                      <CardTitle className="text-xl font-black text-brand-navy-900 font-heading">
                        "{story.title}"
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-slate-600 italic line-clamp-4">
                        {story.content}
                      </p>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-navy-900 text-sm">
                            {story.studentName}
                          </span>
                          {story.program && (
                            <span className="text-xs text-brand-emerald-700 font-medium">
                              {story.program}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Support Student Education CTA Banner */}
        <Section background="navy" spacing="lg" className="bg-brand-navy-900 text-white text-center">
          <Container className="max-w-3xl space-y-6 mx-auto">
            <Badge variant="gold" size="sm">
              Community & Philanthropy
            </Badge>
            <h3 className="text-3xl font-black text-white font-heading">
              Support Higher Education For Deserving Students
            </h3>
            <p className="text-slate-300 text-base leading-relaxed">
              If you represent an educational trust, alumnus, or philanthropic organization interested in supporting student educational sponsorships, get in touch with our welfare team.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/donate">
                <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Learn About Welfare Sponsorship
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                  Contact Welfare Desk
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
