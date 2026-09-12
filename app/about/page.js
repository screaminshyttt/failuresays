'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BlockRenderer from '@/components/article/blocks'
import MetricsHero from '@/components/article/metrics-hero'

export default function AboutPage() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pages/about').then(r => r.json()).then(d => { setPage(d.page || null); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const p = page || {}
  return (
    <div className="bg-transparent">
      <section className="container-editorial-wide pt-8 md:pt-12 pb-6 text-center">
        <div className="max-w-[760px] mx-auto">
          {p.eyebrow && <div className="eyebrow-accent justify-center">{p.eyebrow}</div>}
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="page-heading mt-4">{p.title || 'ABOUT.'}</motion.h1>
          {p.subtitle && <p className="mt-8 text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto">{p.subtitle}</p>}
          <div className="mt-8 flex justify-center"><span className="w-16 h-[3px] bg-lime" /></div>
        </div>
      </section>

      <section className="container-editorial-wide pb-24">
        <div className="max-w-[760px] mx-auto">
          {loading ? (
            <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-5 bg-white/60 border border-rule animate-pulse" />)}</div>
          ) : (
            <BlockRenderer blocks={p.blocks || []} MetricsHero={MetricsHero} />
          )}
        </div>
      </section>
    </div>
  )
}
