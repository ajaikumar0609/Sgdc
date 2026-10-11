'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, LogIn, AlertCircle, ArrowLeft, KeyRound, UserCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your staff email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/admin/enquiries');
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-brand-navy-400/20 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-4 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-2xl bg-brand-navy-950 p-1.5 flex items-center justify-center border border-white/20 shadow-soft-md group-hover:scale-105 transition-transform">
            <Image
              src="/brand/logo.png"
              alt="Shasthi Guru Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
            Staff & Counselor Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Sign in to access your student guidance workspace and admission caseload.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Card className="p-8 sm:p-10 border-white/10 bg-white/95 backdrop-blur-md shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Input
              label="Staff Email Address *"
              type="email"
              placeholder="e.g. admin@shasthiguru.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Password *"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              className="w-full justify-center mt-2"
              isLoading={isSubmitting}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to CRM
            </Button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Quick Role Switch (Development Mode)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@shasthiguru.com', 'ShasthiAdmin2026!')}
                className="p-2.5 rounded-xl border border-slate-200 text-left hover:border-brand-navy-400 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-brand-navy-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald-600" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">Full system access</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('counselor.rajesh@shasthiguru.com', 'Counselor2026!')}
                className="p-2.5 rounded-xl border border-slate-200 text-left hover:border-brand-navy-400 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-brand-navy-900">
                  <UserCheck className="w-3.5 h-3.5 text-brand-gold-600" />
                  <span>Counselor</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">Rajesh (Engineering)</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-brand-navy-900 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
