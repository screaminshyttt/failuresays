'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { CATEGORIES } from '@/lib/brand'
import ArticleCard, { EmptyState } from '@/components/article-card'

export default function WisdomPage() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [active, setActive] = useState('all')

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(d => { setAll(d.articles || []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return all.filter(a => {
      if (active !== 'all' && a.category !== active) return false
      if (q) {
        const s = (a.title + ' ' + (a.excerpt||'') + ' ' + (a.tags||[]).join(' ')).toLowerCase()
        if (!s.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [all, q, active])

  return (
    <div className="bg-paper">
      <section className="container-editorial pt-20 pb-14">
        <div className="eyebrow">Knowledge Hub</div>
        <h1 className="display mt-4 text-6xl md:text-[128px] leading-[0.9]">Wisdom.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">Everything worth knowing, organized. Startup analyses, company improvement ideas, case studies, startup ideas, and failures & lessons — all in one place.</p>
      </section>

      {/* Category tiles */}
      <section className="container-editorial pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.filter(c => c.slug !== 'blog').map((c, i) => (
            <motion.div key={c.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link href={`/wisdom/${c.slug}`} className="card-editorial p-6 block h-full">
                <div className="eyebrow">{String(i+1).padStart(2,'0')}</div>
                <div className="display text-3xl mt-4 leading-none">{c.label}</div>
                <p className="mt-4 text-sm text-muted">{c.desc}</p>
                <div className="mt-8 text-xs uppercase tracking-[0.24em]">Enter →</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Search + filters */}
      <section className="container-editorial py-10 border-t border-rule">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3 border border-rule bg-white px-4 py-3 w-full md:max-w-md">
            <Search className="w-4 h-4 text-muted" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search all wisdom…" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={active==='all'} onClick={() => setActive('all')}>All</FilterChip>
            {CATEGORIES.filter(c => c.slug !== 'blog').map(c => (
              <FilterChip key={c.slug} active={active===c.slug} onClick={() => setActive(c.slug)}>{c.label}</FilterChip>
            ))}
          </div>
        </div>
      </section>

      <section className="container-editorial py-16">
        {loading ? <div className="grid md:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-[440px] bg-white border border-rule animate-pulse" />)}</div> : filtered.length === 0 ? <EmptyState label="No pieces match your filter." /> : (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function FilterChip({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`text-[11px] uppercase tracking-[0.22em] px-4 py-2 border transition-colors ${active ? 'bg-black text-paper border-black' : 'border-rule text-muted hover:text-ink hover:border-ink'}`}>{children}</button>
  )
}
