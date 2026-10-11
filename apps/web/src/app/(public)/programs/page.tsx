import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/layout/container';
import { PageHero } from '@/components/public/PageHero';
import { ProgramsCatalog } from '@/components/public/ProgramsCatalog';
import { fetchFromApi } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Higher Education Programs & Courses | Shasthi Guru Dream Campus',
  description:
    'Explore verified undergraduate and postgraduate academic programs across Engineering, Medical, Paramedical, Nursing, Pharmacy, and Management.',
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams?: { category?: string; search?: string };
}) {
  // Fetch real categories and programs from the real PostgreSQL-backed API
  const [catRes, progRes] = await Promise.all([
    fetchFromApi<{ categories: any[] }>('/api/categories'),
    fetchFromApi<{ programs: any[] }>('/api/programs'),
  ]);

  const categories = catRes.success && catRes.data?.categories ? catRes.data.categories : [];
  const programs = progRes.success && progRes.data?.programs ? progRes.data.programs : [];

  const initialCategory = searchParams?.category || 'all';
  const initialSearch = searchParams?.search || '';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <PageHero
          title="Study & Academic Programs"
          subtitle="Discover verified collegiate degree programs, eligibility details, and curriculum paths designed for academic excellence."
          badge="Verified Course Directory"
          breadcrumbs={[{ label: 'Programs' }]}
        />

        <Section background="neutral" spacing="lg">
          <Container>
            <ProgramsCatalog
              categories={categories}
              programs={programs}
              initialCategory={initialCategory}
              initialSearch={initialSearch}
            />
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
