'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CATEGORY_MAP } from '@/lib/brand'

export default function ArticleCard({ article, variant = 'default', dark = false }) {
  const cat = CATEGORY_MAP[article.category] || { label: article.category }
  const base = dark ? 'bg-[#0A0A0A] border-white/10 text-paper' : 'bg-white border-rule text-ink'
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className={`group border ${base} overflow-hidden`}
    >
      <Link href={`/blog/${article.slug}`}>
        {article.coverImage && (
          <div className="relative aspect-[16/10] overflow-hidden bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          </div>
        )}
        <div className={`p-7 ${variant === 'large' ? 'md:p-10' : ''}`}>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted">
            <span>{cat.label}</span>
            <span>{article.readingTime} min read</span>
          </div>
          <h3 className={`mt-4 ${variant === 'large' ? 'display text-3xl md:text-5xl leading-[0.95]' : 'text-xl md:text-2xl font-semibold leading-tight'} ${dark ? 'text-paper' : ''}`}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className={`mt-4 text-[15px] leading-relaxed ${dark ? 'text-paper/70' : 'text-muted'} line-clamp-3`}>{article.excerpt}</p>
          )}
          <div className={`mt-6 text-[11px] uppercase tracking-[0.24em] ${dark ? 'text-paper/60' : 'text-subtle'}`}>Read essay &nbsp;→</div>
        </div>
      </Link>
    </motion.article>
  )
}

export function EmptyState({ label = 'No pieces published yet.' }) {
  return (
    <div className="border border-dashed border-rule bg-white/40 py-24 text-center">
      <div className="eyebrow">Coming soon</div>
      <div className="mt-3 text-muted">{label}</div>
    </div>
  )
}
