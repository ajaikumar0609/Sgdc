'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Container } from './container';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 15);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer upon route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Admission', href: '/admission' },
    { label: 'Study & Programs', href: '/programs' },
    { label: 'Counseling & Guidance', href: '/counseling' },
    { label: 'Enquiry', href: '/enquiry' },
    { label: 'Student Welfare', href: '/student-welfare' },
    { label: 'About', href: '/about' },
    { label: 'Our Impact', href: '/impact' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        isScrolled
          ? 'glass-nav border-b border-slate-200/80 shadow-soft-sm'
          : 'bg-white/95 border-b border-slate-100'
      )}
    >
      {/* Top Banner with Slogan and Portal Link */}
      <div className="bg-brand-navy-900 text-white text-xs py-1.5 px-4 hidden md:block">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-gold-400">
              Guiding Dreams. Building Futures.
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">
              Complete Higher Education Counselling & Admission Guidance
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <Link
              href="/admin/login"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald-400" />
              <span>Counselor & Admin Portal</span>
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Navbar */}
      <Container className="flex h-20 items-center justify-between">
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-navy-800 p-1 shadow-soft-sm group-hover:scale-105 transition-transform">
            <Image
              src="/brand/logo.png"
              alt="Shasthi Guru Dream Campus Official Logo"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-brand-navy-900 font-heading leading-tight group-hover:text-brand-navy-700 transition-colors">
              SHASTHI GURU
            </span>
            <span className="text-[11px] font-bold tracking-widest text-brand-emerald-600 uppercase">
              Dream Campus
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-semibold text-slate-700" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg transition-colors hover:text-brand-navy-800 hover:bg-slate-100/70',
                  isActive
                    ? 'text-brand-navy-800 font-bold bg-brand-navy-50'
                    : 'text-slate-600'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Primary Conversion CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admission-query">
            <Button
              variant="emerald"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Admission Query
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="xl:hidden rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-navy-800"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </Container>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[81px] bottom-0 bg-white border-t border-slate-200 z-50 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-base font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-navy-50 text-brand-navy-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <Link href="/admission-query" className="block w-full">
              <Button
                variant="emerald"
                size="lg"
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Admission Query
              </Button>
            </Link>

            <Link href="/admin/login" className="block w-full">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Counselor & Staff Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
