'use client'
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import ArticleCard, { EmptyState } from '@/components/article-card'
import { CATEGORY_MAP, CATEGORIES } from '@/lib/brand'

export default function CategoryPage() {
  const params = useParams()
  const slug = params?.category
  const cat = CATEGORY_MAP[slug]
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!cat) return
    fetch(`/api/articles?category=${slug}`).then(r => r.json()).then(d => { setItems(d.articles || []); setLoading(false) })
  }, [slug, cat])

  const filtered = useMemo(() => items.filter(a => !q || (a.title+' '+(a.excerpt||'')).toLowerCase().includes(q.toLowerCase())), [items, q])

  if (!cat) {
    return (
      <div className="container-editorial-wide py-40 text-center">
        <div className="eyebrow">404</div>
        <h1 className="display text-6xl mt-4">Category not found</h1>
        <Link href="/wisdom" className="btn-ghost mt-8">Back to Wisdom</Link>
      </div>
    )
  }

  const index = CATEGORIES.findIndex(c => c.slug === slug) + 1

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="container-editorial-wide pt-4 md:pt-6 pb-10 md:pb-14">
        <Link href="/wisdom" className="text-xs uppercase tracking-[0.24em] text-muted link-underline">← Wisdom</Link>
        <div className="eyebrow mt-8">{String(index).padStart(2, '0')} — Series</div>
        <h1 className="page-heading-wrap mt-4">{cat.label.toUpperCase()}.</h1>
        <p className="mt-8 max-w-3xl text-lg md:text-xl text-muted leading-relaxed">{cat.desc}</p>

        <div className="mt-10 flex items-center gap-3 border border-rule bg-white px-4 py-3 max-w-md">
          <Search className="w-4 h-4 text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${cat.label}…`} className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </section>

      <section className="container-editorial-wide pb-24">
        {loading ? <div className="grid md:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-[440px] bg-white border border-rule animate-pulse" />)}</div> :
          filtered.length === 0 ? <EmptyState /> : (
            <div className="grid md:grid-cols-3 gap-6">
              {filtered.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          )
        }
      </section>
    </div>
  )
}
