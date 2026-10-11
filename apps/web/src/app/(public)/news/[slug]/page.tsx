import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchFromApi } from '@/lib/api';
import {
  Calendar,
  User,
  ArrowRight,
  Share2,
  Clock,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface NewsDetailProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const res = await fetchFromApi<{ article: any }>(`/api/news/${params.slug}`);
  if (!res.success || !res.data?.article) {
    return {
      title: 'Article Not Found | Shasthi Guru Dream Campus',
    };
  }

  const article = res.data.article;
  return {
    title: `${article.title} | Shasthi Guru Dream Campus`,
    description: article.excerpt?.slice(0, 160),
    openGraph: {
      title: `${article.title} - Shasthi Guru Dream Campus`,
      description: article.excerpt?.slice(0, 160),
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const [res, relatedRes] = await Promise.all([
    fetchFromApi<{ article: any }>(`/api/news/${params.slug}`),
    fetchFromApi<{ articles: any[] }>('/api/news?limit=3'),
  ]);

  if (!res.success || !res.data?.article) {
    notFound();
  }

  const article = res.data.article;
  const relatedArticles =
    relatedRes.success && relatedRes.data?.articles
      ? relatedRes.data.articles.filter((a) => a.slug !== article.slug).slice(0, 2)
      : [];

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title={article.title}
          subtitle={article.excerpt}
          badge={article.category}
          breadcrumbs={[
            { label: 'News & Insights', href: '/news' },
            { label: article.title },
          ]}
        >
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-emerald-400" />
              {formattedDate}
            </span>
            {article.author?.name && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-gold-400" />
                  {article.author.name}
                </span>
              </>
            )}
          </div>
        </PageHero>

        <Section background="neutral" spacing="lg">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Main Article Content */}
              <div className="lg:col-span-8 space-y-8">
                {/* Article Cover Image */}
                <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-soft-md bg-brand-navy-900 border border-slate-200">
                  <Image
                    src={article.coverImage || '/brand/poster-01.png'}
                    alt={article.title}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>

                {/* Article Body */}
                <Card className="p-8 sm:p-10 border-slate-200 bg-white shadow-soft-sm space-y-6">
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
                    {article.content.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-base sm:text-lg leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-emerald-600" />
                      <span>Published by Shasthi Guru Academic Guidance Desk</span>
                    </div>

                    <Link
                      href="/news"
                      className="font-semibold text-brand-navy-900 hover:text-brand-emerald-600 transition-colors inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to All News</span>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* Sidebar: Admission Query CTA & Related News */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                <Card className="p-6 border-brand-emerald-200 bg-gradient-to-br from-white to-brand-emerald-50/30 shadow-soft-md space-y-4">
                  <Badge variant="emerald" size="sm">
                    Admission Counseling
                  </Badge>
                  <h3 className="text-xl font-bold text-brand-navy-950 font-heading">
                    Need Personalized Guidance?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Connect with an academic counselor to evaluate your course eligibility, cutoff requirements, and college admission opportunities.
                  </p>
                  <Link href="/admission-query" className="block w-full">
                    <Button variant="emerald" size="md" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Submit Admission Query
                    </Button>
                  </Link>
                </Card>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <Card className="p-6 border-slate-200 bg-white shadow-soft-sm space-y-4">
                    <h4 className="font-bold text-brand-navy-950 text-base border-b border-slate-100 pb-2">
                      Related Articles
                    </h4>
                    <div className="space-y-4">
                      {relatedArticles.map((rel) => (
                        <div key={rel.id} className="space-y-1">
                          <Badge variant="navy" size="xs">
                            {rel.category}
                          </Badge>
                          <h5 className="font-bold text-brand-navy-900 text-sm hover:text-brand-emerald-600 transition-colors line-clamp-2">
                            <Link href={`/news/${rel.slug}`}>
                              {rel.title}
                            </Link>
                          </h5>
                          <span className="text-[11px] text-slate-400 block">
                            {new Date(rel.publishedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
