import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './container';
import { Mail, Phone, MapPin, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy-950 text-slate-300 border-t border-brand-navy-900 pt-16 pb-12 mt-auto">
      <Container className="space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-navy-800 p-1 flex items-center justify-center border border-brand-navy-700 shadow-soft-sm">
                <Image
                  src="/brand/logo.png"
                  alt="Shasthi Guru Dream Campus Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white font-heading tracking-tight block">
                  SHASTHI GURU
                </span>
                <span className="text-xs font-bold tracking-widest text-brand-emerald-400 uppercase">
                  Dream Campus
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Guiding Dreams. Building Futures. Shasthi Guru Dream Campus is a dedicated education counselling and admission support organization empowering students across Tamil Nadu and India to achieve their higher education aspirations.
            </p>

            <div className="pt-2 text-xs text-brand-emerald-400 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Personalized Guidance • Wide Range of Universities • Transparent Admission Support</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/admission" className="hover:text-white transition-colors">
                  Admission Overview
                </Link>
              </li>
              <li>
                <Link href="/admission-query" className="hover:text-brand-emerald-400 transition-colors font-medium text-slate-300">
                  Admission Query
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">
                  Study & Programs
                </Link>
              </li>
              <li>
                <Link href="/counseling" className="hover:text-white transition-colors">
                  Counseling & Guidance
                </Link>
              </li>
              <li>
                <Link href="/enquiry" className="hover:text-white transition-colors">
                  Student Enquiry
                </Link>
              </li>
              <li>
                <Link href="/student-welfare" className="hover:text-white transition-colors">
                  Student Welfare
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-white transition-colors">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  News & Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Disciplines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Study Areas
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/programs?category=Engineering" className="hover:text-white transition-colors">
                  Engineering & Tech
                </Link>
              </li>
              <li>
                <Link href="/programs?category=Medical" className="hover:text-white transition-colors">
                  Medical & Healthcare
                </Link>
              </li>
              <li>
                <Link href="/programs?category=Paramedical" className="hover:text-white transition-colors">
                  Paramedical Sciences
                </Link>
              </li>
              <li>
                <Link href="/programs?category=Nursing" className="hover:text-white transition-colors">
                  Nursing & Pharmacy
                </Link>
              </li>
              <li>
                <Link href="/programs?category=Management" className="hover:text-white transition-colors">
                  Management & MBA
                </Link>
              </li>
              <li>
                <Link href="/programs?category=Arts" className="hover:text-white transition-colors">
                  Arts & Science
                </Link>
              </li>
              <li>
                <Link href="/programs?category=Design" className="hover:text-white transition-colors">
                  Design & IT
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Get in Touch
            </h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-emerald-400 shrink-0 mt-0.5" />
                <span>Dream Campus Educational Center, Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-emerald-400 shrink-0" />
                <a href="mailto:admissions@shasthiguru.com" className="hover:text-white transition-colors">
                  admissions@shasthiguru.com
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 text-xs text-brand-gold-400 hover:text-brand-gold-300 transition-colors"
              >
                <span>Support Student Education</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-brand-navy-900 border border-brand-navy-800"
              >
                <span>Staff & Counselor Login</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-brand-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Shasthi Guru Dream Campus. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/data-consent" className="hover:text-slate-300 transition-colors">
              Data & Consent Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
