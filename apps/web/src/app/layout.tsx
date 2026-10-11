import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.FRONTEND_URL || 'https://shasthiguru.com'),
  title: 'Shasthi Guru Dream Campus | Guiding Dreams. Building Futures.',
  description:
    'Premier education counselling, career guidance, and complete admission support platform. Helping students discover academic pathways across Engineering, Medical, Arts & Science, and more.',
  keywords: [
    'Shasthi Guru Dream Campus',
    'Education Counselling',
    'Admission Support',
    'Career Guidance',
    'Higher Education India',
    'College Admissions',
    'Student Welfare',
  ],
  authors: [{ name: 'Shasthi Guru Dream Campus' }],
  openGraph: {
    title: 'Shasthi Guru Dream Campus - Guiding Dreams. Building Futures.',
    description:
      'Personalized career counselling and admission guidance for higher education. Expert guidance. Global opportunities. Limitless possibilities.',
    url: 'https://shasthiguru.com',
    siteName: 'Shasthi Guru Dream Campus',
    images: [
      {
        url: '/brand/logo.png',
        width: 1000,
        height: 1000,
        alt: 'Shasthi Guru Dream Campus Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F2C59',
};

import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-emerald-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
