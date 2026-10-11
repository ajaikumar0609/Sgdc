import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, User } from 'lucide-react';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  coverImage?: string | null;
  publishedAt: string | Date;
  author?: {
    name: string;
  };
}

export function NewsCard({ article }: { article: NewsItem }) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card
      hover
      className="flex flex-col h-full overflow-hidden border-slate-200/80 bg-white shadow-soft-sm transition-all duration-300 hover:shadow-soft-lg group"
    >
      {/* Cover Image or Fallback */}
      <div className="relative h-48 w-full overflow-hidden bg-brand-navy-900">
        <Image
          src={article.coverImage || '/brand/poster-01.png'}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <Badge variant="emerald" size="sm">
            {article.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-brand-emerald-600" />
          <span>{formattedDate}</span>
          {article.author?.name && (
            <>
              <span>•</span>
              <span className="truncate max-w-[150px]">{article.author.name}</span>
            </>
          )}
        </div>

        <CardTitle className="text-lg font-bold text-brand-navy-950 group-hover:text-brand-navy-700 transition-colors line-clamp-2">
          <Link href={`/news/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <Link
          href={`/news/${article.slug}`}
          className="text-xs font-bold text-brand-navy-800 group-hover:text-brand-emerald-600 inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Read Full Article</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
