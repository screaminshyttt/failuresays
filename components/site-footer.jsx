'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES, FOOTER_MARK, FOOTER_WORDMARK } from '@/lib/brand'

const FOOTER_DEFAULTS = {
  tagline: 'A premium editorial publication for founders, operators, investors, and lifelong learners.',
  quote: 'The harder you try to avoid failure, the longer it owns you.',
  exploreTitle: 'Explore',
  exploreLinks: [
    { label: 'Home', href: '/' },
    { label: 'Wisdom', href: '/wisdom' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  categoriesTitle: 'Categories',
  copyright: 'FailureSays. All rights reserved.',
  rightNote: 'Made with intent, not urgency.',
}

export default function SiteFooter() {
  const year = new Date().getFullYear()
  const [f, setF] = useState(FOOTER_DEFAULTS)

  useEffect(() => {
    fetch('/api/pages/footer').then(r => r.json()).then(d => {
      const p = d?.page
      if (!p) return
      setF({
        ...FOOTER_DEFAULTS,
        ...p,
        exploreLinks: Array.isArray(p.exploreLinks) && p.exploreLinks.length ? p.exploreLinks : FOOTER_DEFAULTS.exploreLinks,
      })
    }).catch(() => {})
  }, [])

  return (
    <footer className="bg-black text-paper mt-24">
      <div className="container-editorial py-20">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <span
                className="inline-flex items-center justify-center overflow-hidden shrink-0"
                style={{ width: 44, height: 44 }}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FOOTER_MARK}
                  alt=""
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </span>
              <span
                className="inline-flex items-center"
                style={{ height: 32 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FOOTER_WORDMARK}
                  alt="FailureSays"
                  className="h-full w-auto object-contain block"
                />
              </span>
            </div>
            <p className="mt-8 text-paper/70 text-lg max-w-md leading-relaxed">
              {f.tagline}
            </p>
            {f.quote && (
              <blockquote className="mt-10 pl-4 border-l-2 border-lime text-paper/90 italic max-w-md">
                &ldquo;{f.quote}&rdquo;
              </blockquote>
            )}
          </div>
          <div className="md:col-span-3">
            <div className="eyebrow text-paper/60">{f.exploreTitle}</div>
            <ul className="mt-5 space-y-3 text-sm">
              {(f.exploreLinks || []).map((l, i) => (
                <li key={i}><Link className="hover:text-lime" href={l.href || '#'}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="eyebrow text-paper/60">{f.categoriesTitle}</div>
            <ul className="mt-5 space-y-3 text-sm">
              {CATEGORIES.filter(c => c.slug !== 'blog').map(c => (
                <li key={c.slug}><Link className="hover:text-lime" href={`/wisdom/${c.slug}`}>{c.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-paper/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-paper/50">
          <div>&copy; {year} {f.copyright}</div>
          <div>{f.rightNote}</div>
        </div>
      </div>
    </footer>
  )
}
