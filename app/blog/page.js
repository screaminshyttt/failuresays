'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ArticleCard, { EmptyState } from '@/components/article-card'

export default function BlogPage() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(d => { setAll(d.articles || []); setLoading(false) })
  }, [])

  const featured = all.find(a => a.featured)
  const rest = all.filter(a => a.id !== featured?.id)

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="container-editorial-wide pt-4 md:pt-6 pb-10 md:pb-14 text-center">
        <div className="eyebrow">The Journal</div>
        <h1 className="page-heading mt-4">BLOG.</h1>
        <p className="mt-8 mx-auto max-w-3xl text-lg md:text-xl text-muted leading-relaxed">
          Essays on startups, strategy, philosophy, and the founder mind.
        </p>
      </section>

      {featured && (
        <section className="container-editorial-wide pb-12">
          <Link href={`/blog/${featured.slug}`} className="card-editorial group grid md:grid-cols-2 overflow-hidden">
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-cream">
              {featured.coverImage && /* eslint-disable-next-line @next/next/no-img-element */ <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />}
            </div>
            <div className="p-8 md:p-14 flex flex-col justify-center">
              <div className="eyebrow">Featured essay</div>
              <h2 className="display mt-4 text-4xl md:text-6xl leading-[0.95]">{featured.title}</h2>
              {featured.excerpt && <p className="mt-6 text-muted text-lg">{featured.excerpt}</p>}
              <div className="mt-8 text-xs uppercase tracking-[0.24em] text-subtle">Read essay &nbsp;→</div>
            </div>
          </Link>
        </section>
      )}

      <section className="container-editorial-wide py-16 border-t border-rule">
        {loading ? <div className="grid md:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-[440px] bg-white border border-rule animate-pulse" />)}</div> : rest.length === 0 ? <EmptyState /> : (
          <div className="grid md:grid-cols-3 gap-6">{rest.map(a => <ArticleCard key={a.id} article={a} />)}</div>
        )}
      </section>
    </div>
  )
}
