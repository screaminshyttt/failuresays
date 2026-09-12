'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { CATEGORY_MAP } from '@/lib/brand'

export default function ArticleCard({ article, variant = 'default', dark = false }) {
  const cat = CATEGORY_MAP[article.category] || { label: article.category }

  // Horizontal "row" card used in the Latest Articles strip (text left, image right)
  if (variant === 'row') {
    return (
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group bg-white border border-rule overflow-hidden"
      >
        <Link href={`/blog/${article.slug}`} className="flex items-stretch">
          <div className="flex-1 p-6 flex flex-col">
            <span className="badge-cat self-start">{cat.label}</span>
            <h3 className="mt-4 display text-2xl md:text-3xl leading-[0.95]">{article.title}</h3>
            {article.excerpt && (
              <p className="mt-3 text-[14px] leading-relaxed text-muted line-clamp-3">{article.excerpt}</p>
            )}
            <div className="mt-auto pt-5 text-[11px] uppercase tracking-[0.24em] text-subtle">{article.readingTime} min read</div>
          </div>
          {article.coverImage && (
            <div className="relative w-[38%] shrink-0 overflow-hidden bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImage} alt={article.title} className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
            </div>
          )}
        </Link>
      </motion.article>
    )
  }

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
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105" />
          </div>
        )}
        <div className={`p-7 ${variant === 'large' ? 'md:p-10' : ''}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`badge-cat ${dark ? '!bg-lime' : ''}`}>{cat.label}</span>
            <span className={`text-[11px] uppercase tracking-[0.22em] ${dark ? 'text-paper/60' : 'text-subtle'}`}>{article.readingTime} min read</span>
          </div>
          <h3 className={`mt-4 ${variant === 'large' ? 'display text-3xl md:text-5xl leading-[0.95]' : 'text-xl md:text-2xl font-semibold leading-tight'} ${dark ? 'text-paper' : ''}`}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className={`mt-4 text-[15px] leading-relaxed ${dark ? 'text-paper/70' : 'text-muted'} line-clamp-3`}>{article.excerpt}</p>
          )}
          <div className={`mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] ${dark ? 'text-paper/70' : 'text-ink'}`}>
            Read essay <ArrowUpRight className="w-3.5 h-3.5 text-lime" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export function EmptyState({ label = 'No pieces published yet.' }) {
  return (
    <div className="border border-dashed border-rule bg-white/50 py-24 text-center">
      <div className="eyebrow-accent justify-center">Coming soon</div>
      <div className="mt-3 text-muted">{label}</div>
    </div>
  )
}
