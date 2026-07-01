'use client'
import { useEffect, useState, useMemo } from 'react'
import { useParams, notFound } from 'next/navigation'
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
      <div className="container-editorial py-40 text-center">
        <div className="eyebrow">404</div>
        <h1 className="display text-6xl mt-4">Category not found</h1>
        <Link href="/wisdom" className="btn-ghost mt-8">Back to Wisdom</Link>
      </div>
    )
  }

  const dark = slug === 'failures-lessons'

  return (
    <div className={dark ? 'bg-black text-paper' : 'bg-paper'}>
      <section className={`${dark ? 'bg-black' : 'bg-paper'} container-editorial pt-20 pb-12`}>
        <Link href="/wisdom" className={`text-xs uppercase tracking-[0.24em] ${dark ? 'text-paper/60' : 'text-muted'} link-underline`}>← Wisdom</Link>
        <div className="eyebrow mt-8" style={dark ? {color:'rgba(241,239,231,0.6)'} : {}}>{CATEGORIES.findIndex(c=>c.slug===slug)+1 < 10 ? '0'+(CATEGORIES.findIndex(c=>c.slug===slug)+1) : CATEGORIES.findIndex(c=>c.slug===slug)+1} — Series</div>
        <h1 className="display mt-4 text-6xl md:text-[128px] leading-[0.9]">{cat.label}</h1>
        <p className={`mt-6 max-w-2xl text-lg ${dark ? 'text-paper/70' : 'text-muted'}`}>{cat.desc}</p>

        <div className={`mt-12 flex items-center gap-3 border ${dark ? 'border-white/20 bg-white/5' : 'border-rule bg-white'} px-4 py-3 max-w-md`}>
          <Search className={`w-4 h-4 ${dark ? 'text-paper/60' : 'text-muted'}`} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${cat.label}…`} className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </section>

      <section className={`container-editorial pb-24 ${dark ? '' : ''}`}>
        {loading ? <div className="grid md:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className={`h-[440px] ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-rule'} border animate-pulse`} />)}</div> :
          filtered.length === 0 ? (
            dark ? <div className="border border-dashed border-white/20 py-24 text-center text-paper/60"><div className="eyebrow text-paper/60">Coming soon</div><div className="mt-3">No pieces published yet.</div></div> : <EmptyState />
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filtered.map(a => <ArticleCard key={a.id} article={a} dark={dark} />)}
            </div>
          )
        }
      </section>
    </div>
  )
}
