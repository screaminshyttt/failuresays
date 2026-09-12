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

const HOME_DEFAULTS = {
  hero: {
    eyebrow: 'FailureSays \u00b7 Est. 2025',
    intro: 'Startup thinking, business analysis, and lessons hidden inside failure.',
    headlineLines: ['The harder you try', 'to avoid failure,', 'the longer it owns you.'],
    ctaPrimaryLabel: 'Explore Wisdom', ctaPrimaryHref: '/wisdom',
    ctaSecondaryLabel: 'Read Latest', ctaSecondaryHref: '/blog',
  },
  marquee: ['Company Analyses', 'Business Strategy', 'Industry Research', 'Founder Perspectives', 'Venture Capital', 'Lessons from Failure', 'Editorial', 'Innovation'],
  sections: [
    { eyebrow: '01 — Fresh', title: 'Latest Articles', description: 'The most recent pieces across every category.', href: '/blog' },
    { eyebrow: '02 — Deep Dives', title: 'Company Analyses', description: 'Deep dives into how successful companies operate and compete.', href: '/wisdom/company-analyses' },
    { eyebrow: '03 — Strategy', title: 'Business Strategy', description: 'Analysis of strategic decisions and competitive positioning.', href: '/wisdom/business-strategy' },
    { eyebrow: '04 — Research', title: 'Industry Research', description: 'Market trends, dynamics, and sector-specific insights.', href: '/wisdom/industry-research' },
    { eyebrow: '05 — Leadership', title: 'Founder Perspectives', description: 'Leadership lessons and founder decision-making frameworks.', href: '/wisdom/founder-perspectives' },
    { eyebrow: '06 — Funding', title: 'Venture Capital', description: 'Investment trends, funding rounds, and VC ecosystem coverage.', href: '/wisdom/venture-capital' },
    { eyebrow: '07 — Lessons', title: 'Lessons from Failure', description: 'What went wrong, why it happened, and what we can learn.', href: '/wisdom/lessons-from-failure' },
  ],
}

function useHomeContent() {
  const [content, setContent] = useState(HOME_DEFAULTS)
  useEffect(() => {
    fetch('/api/pages/home').then(r => r.json()).then(d => {
      const p = d?.page
      if (!p) return
      setContent({
        hero: { ...HOME_DEFAULTS.hero, ...(p.hero || {}) },
        marquee: Array.isArray(p.marquee) && p.marquee.length ? p.marquee : HOME_DEFAULTS.marquee,
        sections: Array.isArray(p.sections) && p.sections.length ? p.sections : HOME_DEFAULTS.sections,
      })
    }).catch(() => {})
  }, [])
  return content
}

export default function Home() {
  const { all, by, loading } = useArticles()
  const content = useHomeContent()
  const hero = content.hero || HOME_DEFAULTS.hero
  const S = (i) => content.sections?.[i] || HOME_DEFAULTS.sections[i]

  return (
    <div className="bg-transparent">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-editorial pt-4 md:pt-6 pb-24 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 relative">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="eyebrow-accent">{hero.eyebrow}</div>
                <p className="mt-6 text-muted text-lg max-w-lg">{hero.intro}</p>
                <h1 className="display mt-8 text-[40px] xs:text-[48px] sm:text-[64px] md:text-[84px] lg:text-[96px] leading-[1.02] md:leading-[1.02] break-words">
                  {(hero.headlineLines || []).map((ln, i, arr) => (
                    <span key={i} className={i === arr.length - 1 ? 'text-muted' : ''}>
                      {ln}{i < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </h1>
                <div className="mt-12 flex flex-wrap items-center gap-4">
                  <Link href={hero.ctaPrimaryHref || '/wisdom'} className="btn-primary">{hero.ctaPrimaryLabel} <ArrowRight className="w-4 h-4" /></Link>
                  <Link href={hero.ctaSecondaryHref || '/blog'} className="btn-ghost">{hero.ctaSecondaryLabel} <ArrowUpRight className="w-4 h-4" /></Link>
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-5 relative flex justify-center">
              <AnimatedMark size={520} />
            </div>
          </div>
        </div>
        <MarqueeBanner items={content.marquee} />
      </section>

      {/* LATEST ARTICLES - first one dark card, rest normal. Uses distinct 'stone' tone. */}
      <SectionShell eyebrow={S(0).eyebrow} title={S(0).title} href={S(0).href} description={S(0).description} tone="stone">
        <LatestGrid articles={all.slice(0, 6)} loading={loading} />
      </SectionShell>

      {/* COMPANY ANALYSES - horizontal scroll */}
      <SectionShell eyebrow={S(1).eyebrow} title={S(1).title} href={S(1).href} description={S(1).description} tone="grey">
        <HorizontalScroll articles={by('company-analyses')} loading={loading} />
      </SectionShell>

      {/* BUSINESS STRATEGY */}
      <SectionShell eyebrow={S(2).eyebrow} title={S(2).title} href={S(2).href} description={S(2).description} tone="grey">
        <CardGrid articles={by('business-strategy')} loading={loading} cols={3} />
      </SectionShell>

      {/* INDUSTRY RESEARCH - large editorial */}
      <SectionShell eyebrow={S(3).eyebrow} title={S(3).title} href={S(3).href} description={S(3).description} tone="grey">
        <div className="grid md:grid-cols-2 gap-8">
          {loading ? <Skeletons count={2} large /> : (by('industry-research').length === 0 ? <div className="md:col-span-2"><EmptyState /></div> : by('industry-research').slice(0, 4).map(a => <ArticleCard key={a.id} article={a} variant="large" />))}
        </div>
      </SectionShell>

      {/* FOUNDER PERSPECTIVES */}
      <SectionShell eyebrow={S(4).eyebrow} title={S(4).title} href={S(4).href} description={S(4).description} tone="grey">
        <CardGrid articles={by('founder-perspectives')} loading={loading} cols={3} />
      </SectionShell>

      {/* VENTURE CAPITAL */}
      <SectionShell eyebrow={S(5).eyebrow} title={S(5).title} href={S(5).href} description={S(5).description} tone="grey">
        <CardGrid articles={by('venture-capital')} loading={loading} cols={3} />
      </SectionShell>

      {/* LESSONS FROM FAILURE */}
      <SectionShell eyebrow={S(6).eyebrow} title={S(6).title} href={S(6).href} description={S(6).description} tone="grey">
        <CardGrid articles={by('lessons-from-failure')} loading={loading} cols={3} />
      </SectionShell>
    </div>
  )
}

function SectionShell({ eyebrow, title, href, description, children, tone = 'paper' }) {
  const bg =
    tone === 'cream' ? 'bg-cream' :
    tone === 'stone' ? 'bg-white/60' :
    tone === 'grey' ? 'bg-transparent' :
    'bg-transparent'
  return (
    <section className={`${bg} py-24 border-t border-rule`}>
      <div className="container-editorial">
        <FadeUp>
          <div className="text-center flex flex-col items-center">
            <div className="section-index"><b>{eyebrow}</b></div>
            <h2 className="display mt-4 text-5xl md:text-7xl">{title}</h2>
            {description && <p className="mt-4 mx-auto max-w-xl text-muted">{description}</p>}
            {href && <Link href={href} className="inline-flex items-center gap-1.5 mt-6 text-xs uppercase tracking-[0.24em] link-underline">View all <span className="text-lime">&rarr;</span></Link>}
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
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} variant="row" />)}
    </div>
  )
}

function Skeletons({ count = 3, dark = false, large = false }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`${dark ? 'bg-white/5 border-white/10' : 'bg-white border-rule'} border ${large ? 'h-[520px]' : 'h-[440px]'} animate-pulse`} />
  ))
}

function MarqueeBanner({ items }) {
  const list = Array.isArray(items) && items.length ? items : ['Company Analyses', 'Business Strategy', 'Industry Research', 'Founder Perspectives', 'Venture Capital', 'Lessons from Failure', 'Editorial', 'Innovation']
  return (
    <div className="border-y border-rule bg-white/70 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee py-5 text-[13px] uppercase tracking-[0.28em] text-muted">
        {[...list, ...list, ...list].map((t, i) => (
          <span key={i} className="mx-10 flex items-center gap-10"><span className="w-1.5 h-1.5 rounded-full bg-lime" />{t}</span>
        ))}
      </div>
    </div>
  )
}
