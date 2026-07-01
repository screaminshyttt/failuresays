'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { CATEGORY_MAP } from '@/lib/brand'
import { ArrowLeft } from 'lucide-react'

export default function ArticlePage() {
  const params = useParams()
  const slug = params?.slug
  const [article, setArticle] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/articles/${slug}`).then(async r => {
      if (!r.ok) { setNotFound(true); setLoading(false); return }
      const d = await r.json(); setArticle(d.article); setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="container-editorial pt-20 pb-40">
        <div className="h-6 w-40 bg-white border border-rule animate-pulse" />
        <div className="mt-8 h-24 w-full max-w-3xl bg-white border border-rule animate-pulse" />
        <div className="mt-4 h-6 w-64 bg-white border border-rule animate-pulse" />
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="container-editorial py-40 text-center">
        <div className="eyebrow">404</div>
        <h1 className="display text-6xl mt-4">Essay not found</h1>
        <Link href="/blog" className="btn-ghost mt-8">Back to Blog</Link>
      </div>
    )
  }

  const cat = CATEGORY_MAP[article.category] || { label: article.category, slug: article.category }
  const dateStr = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : ''

  return (
    <article className="bg-paper">
      <div className="container-editorial pt-16 pb-24 max-w-4xl">
        <Link href={`/wisdom/${cat.slug}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted link-underline">
          <ArrowLeft className="w-3 h-3" /> {cat.label}
        </Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="display mt-8 text-5xl md:text-7xl leading-[0.95]">
          {article.title}
        </motion.h1>
        {article.excerpt && <p className="mt-6 text-xl text-muted max-w-3xl leading-relaxed">{article.excerpt}</p>}
        <div className="mt-10 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.22em] text-subtle">
          {dateStr && <span>{dateStr}</span>}
          <span className="w-1 h-1 rounded-full bg-subtle" />
          <span>{article.readingTime} min read</span>
          {article.tags?.length > 0 && (<>
            <span className="w-1 h-1 rounded-full bg-subtle" />
            <span className="text-muted">{article.tags.map(t => `#${t}`).join(' · ')}</span>
          </>)}
        </div>
      </div>

      {article.coverImage && (
        <div className="container-editorial max-w-6xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }} className="aspect-[16/9] overflow-hidden bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </motion.div>
        </div>
      )}

      <div className="container-editorial max-w-3xl py-16">
        <div className="prose-editorial">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content || ''}</ReactMarkdown>
        </div>

        <div className="mt-20 pt-8 border-t border-rule flex items-center justify-between">
          <Link href="/blog" className="text-xs uppercase tracking-[0.24em] link-underline">← All essays</Link>
          <Link href={`/wisdom/${cat.slug}`} className="text-xs uppercase tracking-[0.24em] link-underline">More in {cat.label} →</Link>
        </div>
      </div>
    </article>
  )
}
