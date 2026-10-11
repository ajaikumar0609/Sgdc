import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { NewsCard, NewsItem } from '@/components/public/NewsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { fetchFromApi } from '@/lib/api';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: 'News & Admission Insights | Shasthi Guru Dream Campus',
  description:
    'Latest educational updates, collegiate admission notifications, cutoff trends, and career guidance articles from Shasthi Guru Dream Campus.',
};

export default async function NewsListingPage({
  searchParams,
}: {
  searchParams?: { category?: string; page?: string };
}) {
  const currentCategory = searchParams?.category || '';
  const currentPage = searchParams?.page || '1';

  const queryParams = new URLSearchParams();
  if (currentCategory) queryParams.set('category', currentCategory);
  if (currentPage) queryParams.set('page', currentPage);

  const res = await fetchFromApi<{ articles: NewsItem[]; pagination: any }>(
    `/api/news?${queryParams.toString()}`
  );

  const articles = res.success && res.data?.articles ? res.data.articles : [];
  const pagination = res.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 };

  // First article can be featured if on first page without filter
  const featuredArticle = !currentCategory && articles.length > 0 ? articles[0] : null;
  const standardArticles = featuredArticle ? articles.slice(1) : articles;

  const categories = [
    'All',
    'Admission Guidance',
    'Career Insights',
    'Campus News',
    'Scholarship Updates',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="News & Academic Updates"
          subtitle="Stay informed on admission notifications, state counseling timelines, cutoff projections, and career trends curated by our education desk."
          badge="Education & Admission Insights"
          breadcrumbs={[{ label: 'News & Insights' }]}
        />

        <Section background="neutral" spacing="lg">
          <Container className="space-y-10">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
              {categories.map((cat) => {
                const isSelected =
                  cat === 'All' ? !currentCategory : currentCategory.toLowerCase() === cat.toLowerCase();
                const targetUrl =
                  cat === 'All' ? '/news' : `/news?category=${encodeURIComponent(cat)}`;

                return (
                  <Link key={cat} href={targetUrl}>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-brand-navy-900 text-white shadow-soft-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {cat}
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Featured Article Banner */}
            {featuredArticle && (
              <Card className="overflow-hidden border-slate-200/80 bg-white shadow-soft-md group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
                  <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-96 w-full bg-brand-navy-900 overflow-hidden">
                    <Image
                      src={featuredArticle.coverImage || '/brand/poster-01.png'}
                      alt={featuredArticle.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="emerald" size="md">
                        Featured Article
                      </Badge>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-8 sm:p-10 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="navy" size="sm">
                        {featuredArticle.category}
                      </Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-emerald-600" />
                        {new Date(featuredArticle.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-brand-navy-950 font-heading group-hover:text-brand-navy-700 transition-colors leading-tight">
                      <Link href={`/news/${featuredArticle.slug}`}>
                        {featuredArticle.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="pt-2">
                      <Link href={`/news/${featuredArticle.slug}`}>
                        <Button variant="emerald" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                          Read Full Article
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Articles Grid */}
            {standardArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : !featuredArticle ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-lg">No News Articles Found</h3>
                <p className="text-slate-500 text-sm mt-1">
                  There are no updates currently published in this category.
                </p>
                <div className="mt-4">
                  <Link href="/news">
                    <Button variant="outline" size="sm">
                      View All Updates
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Newsletter / Enquiry Callout */}
            <div className="bg-brand-navy-900 text-white rounded-2xl p-8 border border-brand-navy-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold font-heading">
                  Have an Admission or Counseling Query?
                </h3>
                <p className="text-slate-300 text-sm max-w-xl">
                  Connect with our counselors directly to discuss course eligibility and admission schedules.
                </p>
              </div>

              <Link href="/admission-query" className="shrink-0">
                <Button variant="emerald" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
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
