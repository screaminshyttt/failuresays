'use client'
import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { CATEGORIES } from '@/lib/brand'
import ArticleCard, { EmptyState } from '@/components/article-card'

export default function WisdomPage() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(d => { setAll(d.articles || []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return all.filter(a => {
      if (q) {
        const s = (a.title + ' ' + (a.excerpt||'') + ' ' + (a.tags||[]).join(' ')).toLowerCase()
        if (!s.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [all, q])

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="container-editorial-wide pt-4 md:pt-6 pb-10 md:pb-14 text-center">
        <div className="eyebrow">Knowledge Hub</div>
        <h1 className="page-heading mt-4">WISDOM.</h1>
        <p className="mt-8 mx-auto max-w-3xl text-lg md:text-xl text-muted leading-relaxed">
          Everything worth knowing, organized. Startup analyses, company improvement ideas, case studies, startup ideas, and failures &amp; lessons — all in one place.
        </p>
        
        {/* Search bar - centered */}
        <div className="mt-10 mx-auto flex items-center gap-3 border border-rule bg-white px-4 py-3 max-w-md">
          <Search className="w-4 h-4 text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search all wisdom…" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </section>

      <section className="container-editorial-wide py-16 border-t border-rule">
        {loading ? <div className="grid md:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-[440px] bg-white border border-rule animate-pulse" />)}</div> : filtered.length === 0 ? <EmptyState label="No pieces match your filter." /> : (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </section>
    </div>
  )
}
