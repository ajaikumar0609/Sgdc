import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
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
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  PhoneCall,
  FileCheck2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admission Guidance & Process | Shasthi Guru Dream Campus',
  description:
    'Discover transparent, step-by-step higher education admission guidance. Explore degree programs, understand institutional processes, and connect with academic counselors.',
};

export default function AdmissionPage() {
  const journeySteps = [
    {
      step: '01',
      title: 'Discover Your Potential',
      icon: <Compass className="w-6 h-6 text-brand-emerald-500" />,
      description:
        'Identify your academic strengths, career aspirations, and personal inclinations through structured skill mapping.',
    },
    {
      step: '02',
      title: 'Explore Courses & Institutions',
      icon: <BookOpen className="w-6 h-6 text-brand-navy-600" />,
      description:
        'Browse accredited programs across Engineering, Paramedical, Nursing, Pharmacy, and Management with transparent details.',
    },
    {
      step: '03',
      title: 'Personalized Counseling',
      icon: <UserCheck className="w-6 h-6 text-brand-gold-500" />,
      description:
        'Meet dedicated educational mentors who review your 12th marks, subject combinations, and family preferences.',
    },
    {
      step: '04',
      title: 'Submit Admission Query',
      icon: <ClipboardList className="w-6 h-6 text-brand-emerald-600" />,
      description:
        'Register your official inquiry into our verified student guidance system to initiate verified case tracking.',
    },
    {
      step: '05',
      title: 'Document & Seat Guidance',
      icon: <FileCheck2 className="w-6 h-6 text-brand-navy-700" />,
      description:
        'Receive step-by-step help with mark sheets, community certificates, transfer certificates, and application deadlines.',
    },
    {
      step: '06',
      title: 'Campus Onboarding Support',
      icon: <GraduationCap className="w-6 h-6 text-brand-emerald-500" />,
      description:
        'Complete formal admission procedures smoothly with verified guidance until your first day on campus.',
    },
  ];

  const faqs = [
    {
      q: 'How does Shasthi Guru help students with college admissions?',
      a: 'We provide personalized academic counselling, course exploration, and transparent guidance on institutional admission procedures. We help students understand which programs match their 12th standard marks and career ambitions without making exaggerated or misleading claims.',
    },
    {
      q: 'What academic streams do you provide guidance for?',
      a: 'We assist students across Engineering & Technology, Medical & Healthcare, Paramedical Sciences, Nursing, Pharmacy, Management, Arts & Science, and Design.',
    },
    {
      q: 'What documents are typically required during college admission counselling?',
      a: 'Standard documentation includes 10th & 12th Mark Sheets, Transfer Certificate (TC), Conduct Certificate, Community Certificate, passport-size photographs, and relevant entrance test scorecards if applicable.',
    },
    {
      q: 'How can I submit an admission enquiry?',
      a: 'You can submit your details online through our official Admission Query form or contact our counseling center directly. An assigned academic mentor will connect with you to discuss options.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Transparent Admission Guidance"
          subtitle="Empowering students and parents with unbiased advice, clear timelines, and verified guidance for collegiate admissions across Tamil Nadu and India."
          badge="Higher Education Admission 2026-27"
          breadcrumbs={[{ label: 'Admission Guidance' }]}
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/admission-query">
              <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Submit Admission Query
              </Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                Browse Academic Programs
              </Button>
            </Link>
          </div>
        </PageHero>

        {/* The 6-Step Admission Journey */}
        <Section background="white" spacing="lg">
          <Container className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <Badge variant="emerald" size="md">
                Step-by-Step Flow
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-navy-950 font-heading">
                The Student Admission Journey
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We believe higher education decisions should be structured, stress-free, and based on authentic information. Here is how our counselling team supports you from initial discovery to final enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {journeySteps.map((item, index) => (
                <Card
                  key={index}
                  hover
                  className="border-slate-200/80 bg-white relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-100 rounded-bl-3xl flex items-center justify-center font-black text-slate-300 group-hover:text-brand-emerald-500 group-hover:bg-brand-emerald-50 transition-colors text-lg">
                    {item.step}
                  </div>
                  <CardHeader className="space-y-4 pt-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-brand-navy-900">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Transparent Principles */}
        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="gold" size="md">
                  Our Commitment
                </Badge>
                <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                  Guidance Built on Integrity & Student Welfare
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Choosing a college and a course is one of the most critical decisions a student and their family will make. Shasthi Guru Dream Campus operates strictly with a student-first philosophy:
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-brand-navy-900 text-sm">No False Guarantees</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        We do not manufacture impossible placement guarantees or unsupported admission claims. We present authentic college criteria and actual eligibility norms.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-brand-navy-900 text-sm">Mark-Appropriate Recommendations</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        We objectively evaluate your 12th standard marks, cutoffs, and aptitude to recommend realistic, viable degree pathways.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-brand-navy-900 text-sm">Parental Inclusivity</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Parents are integral partners in every counselling dialogue, ensuring transparent understanding of fee structures and career horizons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <Card className="border-brand-navy-100 bg-white p-6 shadow-soft-md space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-emerald-100 flex items-center justify-center text-brand-emerald-700">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-navy-900">Official Enquiry Reference</h4>
                      <p className="text-xs text-slate-500">Trackable student journey from Day 1</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    When you submit an admission query, our platform automatically generates a unique tracking code (such as <span className="font-mono font-bold text-brand-navy-800">SG-2026-XXXXX</span>). This ensures that every student query is documented, assigned to a verified academic counselor, and resolved with care.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Ready to start?</span>
                      <span className="text-sm font-bold text-brand-navy-900">Takes less than 2 minutes</span>
                    </div>
                    <Link href="/admission-query">
                      <Button variant="emerald" size="sm">
                        Submit Query
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </Section>

        {/* Frequently Asked Questions */}
        <Section background="white" spacing="lg">
          <Container className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="navy" size="md">
                Got Questions?
              </Badge>
              <h3 className="text-3xl font-black text-brand-navy-950 font-heading">
                Admission Guidance FAQ
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="border-slate-200/80 bg-white p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-bold text-brand-navy-950 text-base leading-snug">
                        {faq.q}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Bottom CTA Banner */}
        <Section background="navy" spacing="md" className="bg-brand-navy-900 text-white text-center">
          <Container className="space-y-6 max-w-3xl mx-auto">
            <h3 className="text-3xl font-black text-white font-heading">
              Have Questions About 2026 Admissions?
            </h3>
            <p className="text-slate-300 text-base">
              Connect with our academic guidance team today for transparent, student-first advice.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/admission-query">
                <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Submit Admission Query
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                  Contact Information
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
