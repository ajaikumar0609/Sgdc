import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-24 bg-slate-50">
        <Container size="sm" className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-navy-50 text-brand-navy-800 text-3xl font-black font-heading border border-brand-navy-200 shadow-soft-sm">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-base text-slate-600 max-w-md mx-auto">
              The page or resource you are looking for does not exist or has been relocated within the Shasthi Guru Dream Campus platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/">
              <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
                Back to Homepage
              </Button>
            </Link>
            <Link href="/admission-query">
              <Button variant="emerald" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Submit Admission Query
              </Button>
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
