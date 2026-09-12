'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { ArrowLeft, List, X } from 'lucide-react'
import { CATEGORY_MAP } from '@/lib/brand'
import BlockRenderer, { buildToc } from '@/components/article/blocks'
import MetricsHero from '@/components/article/metrics-hero'

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) } catch { return '' }
}

function Toc({ items, mobile = false }) {
  const [open, setOpen] = useState(false)
  if (!items.length) return null
  const list = (
    <nav className="space-y-1">
      {items.map((it, i) => (
        <a key={it.id} href={`#${it.id}`} onClick={() => mobile && setOpen(false)}
          className={`group flex items-start gap-3 py-1.5 text-sm text-muted hover:text-black transition-colors ${it.level === 'h3' ? 'pl-4' : ''}`}>
          <span className="text-lime text-[11px] font-semibold mt-0.5 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <span className="leading-snug">{it.text}</span>
        </a>
      ))}
    </nav>
  )
  if (mobile) {
    return (
      <div className="xl:hidden border border-rule bg-white">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.22em]">
          <span className="inline-flex items-center gap-2"><List className="w-4 h-4 text-lime" /> In this article</span>
          {open ? <X className="w-4 h-4" /> : <span className="text-subtle">{items.length}</span>}
        </button>
        {open && <div className="px-4 pb-4 border-t border-rule pt-3">{list}</div>}
      </div>
    )
  }
  return (
    <div className="sticky top-28">
      <div className="eyebrow-accent mb-4">In this article</div>
      {list}
    </div>
  )
}

export default function ArticleView({ article, related = [] }) {
  const relatedMap = useMemo(() => Object.fromEntries((related || []).map(r => [r.id, r])), [related])
  const toc = useMemo(() => (article ? buildToc(article.blocks || []) : []), [article])

  if (!article) {
    return (
      <div className="container-editorial-wide py-40 text-center bg-transparent">
        <div className="eyebrow-accent justify-center">404</div>
        <h1 className="display text-6xl mt-4">Essay not found</h1>
        <Link href="/blog" className="btn-ghost mt-8">Back to Blog</Link>
      </div>
    )
  }

  const cat = CATEGORY_MAP[article.category] || { label: article.category, slug: article.category }
  const hasBlocks = Array.isArray(article.blocks) && article.blocks.length > 0
  const showToc = article.showToc !== false && toc.length > 0
  const author = article.author || {}

  return (
    <article className="bg-transparent">
      {/* HEADER — centered editorial */}
      <div className="container-editorial-wide pt-6 md:pt-10 pb-6">
        <div className="max-w-[860px] mx-auto text-center">
          <Link href={`/wisdom/${cat.slug}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-muted link-underline">
            <ArrowLeft className="w-3 h-3" /> {article.articleLabel || cat.label}
          </Link>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="display uppercase mt-6 leading-[0.95]" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.75rem)' }}>
            {article.title}
          </motion.h1>
          {article.subtitle && <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto">{article.subtitle}</p>}

          <div className="mt-8 inline-flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-subtle">
              {fmtDate(article.publishedAt) && <span>{fmtDate(article.publishedAt)}</span>}
              {fmtDate(article.publishedAt) && <span className="text-lime">•</span>}
              <span>{article.readingTime} min read</span>
            </div>
            <span className="mt-4 w-16 h-[3px] bg-lime" />
          </div>

          {author.name && (
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                {author.photo
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={author.photo} alt={author.name} className="w-10 h-10 rounded-full object-cover border border-rule" />
                  : <span className="w-10 h-10 rounded-full bg-black text-paper flex items-center justify-center text-sm font-semibold">{author.name[0]}</span>}
                <div className="text-left">
                  <div className="text-sm font-medium">{author.name}</div>
                  {author.bio && <div className="text-[11px] text-subtle max-w-[220px] truncate">{author.bio}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COVER */}
      {article.coverImage && (
        <div className="container-editorial-wide">
          <div className="max-w-[980px] mx-auto aspect-[16/9] overflow-hidden bg-cream border border-rule">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImage} alt={article.coverImageAlt || article.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* BODY — one central vertical axis; body always centered on the page */}
      <div className="container-editorial-wide pt-6 md:pt-8 pb-12 md:pb-16">
        <div className="relative max-w-[860px] mx-auto w-full">
          {/* Floating desktop TOC — sits in the left gutter so the body stays centered */}
          {showToc && (
            <aside className="hidden 2xl:block absolute top-0 right-full mr-8 w-[210px]">
              <Toc items={toc} />
            </aside>
          )}

          {/* Inline / collapsible TOC on smaller screens — keeps the body centered */}
          {showToc && <div className="2xl:hidden mb-8">{<Toc items={toc} mobile />}</div>}

          {hasBlocks ? (
            <BlockRenderer blocks={article.blocks} relatedMap={relatedMap} MetricsHero={MetricsHero} />
          ) : (
            <div className="prose-editorial max-w-none text-[18px] md:text-[19px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content || ''}</ReactMarkdown>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-rule flex items-center justify-between">
            <Link href="/blog" className="text-xs uppercase tracking-[0.24em] link-underline">← All essays</Link>
            <Link href={`/wisdom/${cat.slug}`} className="text-xs uppercase tracking-[0.24em] link-underline">More in {cat.label} →</Link>
          </div>
        </div>

        {/* Related stories */}
        {related.length > 0 && (
          <div className="max-w-[980px] mx-auto mt-20 pt-12 border-t border-rule">
            <div className="eyebrow-accent">Related stories</div>
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {related.slice(0, 3).map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group block border border-rule bg-white hover:border-black/30 transition-colors">
                  {r.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden bg-cream">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="badge-cat">{CATEGORY_MAP[r.category]?.label || r.category}</span>
                    <h4 className="mt-3 text-lg font-semibold leading-tight">{r.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
