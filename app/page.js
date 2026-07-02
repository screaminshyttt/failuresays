'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import AnimatedMark from '@/components/animated-mark'
import ArticleCard, { EmptyState } from '@/components/article-card'
import { CATEGORIES } from '@/lib/brand'

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay, ease: [0.22,1,0.36,1] }}>
    {children}
  </motion.div>
)

function useArticles() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(d => { setAll(d.articles || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])
  const by = (slug) => all.filter(a => a.category === slug)
  return { all, loading, by }
}

export default function Home() {
  const { all, by, loading } = useArticles()

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-editorial pt-4 md:pt-6 pb-24 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="eyebrow">FailureSays &middot; Est. 2025</div>
                <p className="mt-6 text-muted text-lg max-w-lg">Startup thinking, business analysis, and lessons hidden inside failure.</p>
                <h1 className="display mt-8 text-[44px] xs:text-[52px] sm:text-[72px] md:text-[96px] lg:text-[112px] leading-[0.95] md:leading-[0.92] break-words">
                  Every Great Company<br /><span className="text-muted">Has a Story.</span><br />
                  Every Failure Has<br />a Lesson.
                </h1>
                <div className="mt-12 flex flex-wrap items-center gap-4">
                  <Link href="/wisdom" className="btn-primary">Explore Wisdom <ArrowRight className="w-4 h-4" /></Link>
                  <Link href="/blog" className="btn-ghost">Read Latest <ArrowUpRight className="w-4 h-4" /></Link>
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <AnimatedMark size={520} />
            </div>
          </div>
        </div>
        <MarqueeBanner />
      </section>

      {/* LATEST ARTICLES - first one dark card, rest normal. Uses distinct 'stone' tone. */}
      <SectionShell eyebrow="01 — Fresh" title="Latest Articles" href="/blog" description="The most recent pieces across every category." tone="stone">
        <LatestGrid articles={all.slice(0, 6)} loading={loading} />
      </SectionShell>

      {/* STARTUP ANALYSES - horizontal scroll */}
      <SectionShell eyebrow="02 — Series" title="Startup Analyses" href="/wisdom/startup-analyses" description="Deep dives into how great companies actually work, told without the myth-making." tone="grey">
        <HorizontalScroll articles={by('startup-analyses')} loading={loading} />
      </SectionShell>

      {/* COMPANY IMPROVEMENT IDEAS */}
      <SectionShell eyebrow="03 — Ideas" title="Company Improvement Ideas" href="/wisdom/company-improvement-ideas" description="Opinionated, practical directions to make good companies great." tone="grey">
        <CardGrid articles={by('company-improvement-ideas')} loading={loading} cols={3} />
      </SectionShell>

      {/* CASE STUDIES - large editorial */}
      <SectionShell eyebrow="04 — Long form" title="Case Studies" href="/wisdom/case-studies" description="Investigations of pivotal moments — rises, falls, comebacks, betrayals." tone="grey">
        <div className="grid md:grid-cols-2 gap-8">
          {loading ? <Skeletons count={2} large /> : (by('case-studies').length === 0 ? <div className="md:col-span-2"><EmptyState /></div> : by('case-studies').slice(0, 4).map(a => <ArticleCard key={a.id} article={a} variant="large" />))}
        </div>
      </SectionShell>

      {/* STARTUP IDEAS */}
      <SectionShell eyebrow="05 — Sketches" title="Startup Ideas" href="/wisdom/startup-ideas" description="Overlooked problems worth building a company around." tone="grey">
        <CardGrid articles={by('startup-ideas')} loading={loading} cols={3} />
      </SectionShell>

      {/* FAILURES & LESSONS - same warm palette as other sections */}
      <SectionShell eyebrow="06 — Autopsies" title="Failures & Lessons" href="/wisdom/failures-lessons" description="What died, why it died, and what it taught us. The best classroom is the graveyard." tone="grey">
        <CardGrid articles={by('failures-lessons')} loading={loading} cols={3} />
      </SectionShell>

      {/* CATEGORIES CTA */}
      <section className="container-editorial py-24">
        <FadeUp>
          <div className="border-t border-rule pt-12">
            <div className="grid md:grid-cols-2 gap-10 items-end">
              <h3 className="display text-5xl md:text-7xl">One publication.<br />Five ways to think.</h3>
              <p className="text-lg text-muted max-w-md">A knowledge platform for founders, operators, investors, students, and ambitious people who love learning.</p>
            </div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CATEGORIES.filter(c => c.slug !== 'blog').map((c, i) => (
                <Link key={c.slug} href={`/wisdom/${c.slug}`} className="card-editorial p-6 group">
                  <div className="eyebrow">{String(i+1).padStart(2,'0')}</div>
                  <div className="mt-4 text-xl leading-snug">{c.label}</div>
                  <div className="mt-6 text-xs uppercase tracking-[0.24em] text-subtle group-hover:text-ink">Enter →</div>
                </Link>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}

function SectionShell({ eyebrow, title, href, description, children, tone = 'paper' }) {
  const bg =
    tone === 'cream' ? 'bg-cream' :
    tone === 'stone' ? 'bg-[#EDE9DC]' :
    tone === 'grey' ? 'bg-[#E4E1D5]' :
    'bg-paper'
  return (
    <section className={`${bg} py-24`}>
      <div className="container-editorial">
        <FadeUp>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="eyebrow">{eyebrow}</div>
              <h2 className="display mt-4 text-5xl md:text-7xl">{title}</h2>
              {description && <p className="mt-4 max-w-xl text-muted">{description}</p>}
            </div>
            {href && <Link href={href} className="text-xs uppercase tracking-[0.24em] link-underline">View all →</Link>}
          </div>
        </FadeUp>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  )
}

function HorizontalScroll({ articles, loading }) {
  if (loading) return <div className="flex gap-6 overflow-x-auto hide-scrollbar">{Array.from({length: 4}).map((_,i) => <div key={i} className="min-w-[380px] h-[420px] bg-white border border-rule animate-pulse" />)}</div>
  if (!articles.length) return <EmptyState />
  return (
    <div className="-mx-6 md:-mx-10 px-6 md:px-10 flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
      {articles.map(a => (
        <div key={a.id} className="min-w-[85%] sm:min-w-[440px] md:min-w-[420px] snap-start">
          <ArticleCard article={a} />
        </div>
      ))}
    </div>
  )
}

function CardGrid({ articles, loading, cols = 3 }) {
  const gridCls = cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
  if (loading) return <div className={`grid ${gridCls} gap-6`}><Skeletons count={cols} /></div>
  if (!articles.length) return <EmptyState />
  return (
    <div className={`grid ${gridCls} gap-6`}>
      {articles.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} />)}
    </div>
  )
}

function LatestGrid({ articles, loading }) {
  if (loading) return <div className="grid md:grid-cols-3 gap-6"><Skeletons count={3} /></div>
  if (!articles.length) return <EmptyState />
  const [first, ...rest] = articles
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1"><ArticleCard article={first} dark /></div>
      {rest.slice(0, 5).map(a => <ArticleCard key={a.id} article={a} />)}
    </div>
  )
}

function Skeletons({ count = 3, dark = false, large = false }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`${dark ? 'bg-white/5 border-white/10' : 'bg-white border-rule'} border ${large ? 'h-[520px]' : 'h-[440px]'} animate-pulse`} />
  ))
}

function MarqueeBanner() {
  const items = ['Startup Analyses', 'Company Improvement Ideas', 'Case Studies', 'Startup Ideas', 'Failures & Lessons', 'Philosophy', 'Psychology', 'Strategy']
  return (
    <div className="border-y border-rule bg-cream overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee py-5 text-[13px] uppercase tracking-[0.28em] text-muted">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="mx-10 flex items-center gap-10"><span className="w-1 h-1 rounded-full bg-muted" />{t}</span>
        ))}
      </div>
    </div>
  )
}
