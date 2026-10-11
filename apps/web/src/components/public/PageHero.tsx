import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  badge,
  breadcrumbs,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative bg-gradient-brand text-white py-14 sm:py-20 overflow-hidden border-b border-brand-navy-800',
        className
      )}
    >
      {/* Ambient background glow matching authentic brand palette */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-brand-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-brand-navy-400/20 blur-3xl pointer-events-none" />

      <Container className="relative z-10 space-y-4">
        {/* Breadcrumb Navigation */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-brand-emerald-300 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Badge / Pill */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-400 shrink-0" />
            <span>{badge}</span>
          </div>
        )}

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}

        {children && <div className="pt-4">{children}</div>}
      </Container>
    </section>
  );
}
