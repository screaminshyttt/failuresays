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
                <h1 className="display mt-8 text-[40px] xs:text-[48px] sm:text-[64px] md:text-[84px] lg:text-[96px] leading-[1.02] md:leading-[1.02] break-words">
                  The harder you try<br />
                  to avoid failure,<br />
                  <span className="text-muted">the longer it owns you.</span>
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

      {/* COMPANY ANALYSES - horizontal scroll */}
      <SectionShell eyebrow="02 — Deep Dives" title="Company Analyses" href="/wisdom/company-analyses" description="Deep dives into how successful companies operate and compete." tone="grey">
        <HorizontalScroll articles={by('company-analyses')} loading={loading} />
      </SectionShell>

      {/* BUSINESS STRATEGY */}
      <SectionShell eyebrow="03 — Strategy" title="Business Strategy" href="/wisdom/business-strategy" description="Analysis of strategic decisions and competitive positioning." tone="grey">
        <CardGrid articles={by('business-strategy')} loading={loading} cols={3} />
      </SectionShell>

      {/* INDUSTRY RESEARCH - large editorial */}
      <SectionShell eyebrow="04 — Research" title="Industry Research" href="/wisdom/industry-research" description="Market trends, dynamics, and sector-specific insights." tone="grey">
        <div className="grid md:grid-cols-2 gap-8">
          {loading ? <Skeletons count={2} large /> : (by('industry-research').length === 0 ? <div className="md:col-span-2"><EmptyState /></div> : by('industry-research').slice(0, 4).map(a => <ArticleCard key={a.id} article={a} variant="large" />))}
        </div>
      </SectionShell>

      {/* FOUNDER PERSPECTIVES */}
      <SectionShell eyebrow="05 — Leadership" title="Founder Perspectives" href="/wisdom/founder-perspectives" description="Leadership lessons and founder decision-making frameworks." tone="grey">
        <CardGrid articles={by('founder-perspectives')} loading={loading} cols={3} />
      </SectionShell>

      {/* VENTURE CAPITAL */}
      <SectionShell eyebrow="06 — Funding" title="Venture Capital" href="/wisdom/venture-capital" description="Investment trends, funding rounds, and VC ecosystem coverage." tone="grey">
        <CardGrid articles={by('venture-capital')} loading={loading} cols={3} />
      </SectionShell>

      {/* LESSONS FROM FAILURE */}
      <SectionShell eyebrow="07 — Lessons" title="Lessons from Failure" href="/wisdom/lessons-from-failure" description="What went wrong, why it happened, and what we can learn." tone="grey">
        <CardGrid articles={by('lessons-from-failure')} loading={loading} cols={3} />
      </SectionShell>

      {/* CATEGORIES CTA */}
      <section className="container-editorial py-24">
        <FadeUp>
          <div className="border-t border-rule pt-12">
            <div className="grid md:grid-cols-2 gap-10 items-end">
              <h3 className="display text-5xl md:text-7xl">One publication.<br />Six perspectives.</h3>
              <p className="text-lg text-muted max-w-md">Independent journalism and analysis for founders, operators, investors, and professionals shaping the future of business.</p>
            </div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
          <div className="text-center">
            <div className="eyebrow">{eyebrow}</div>
            <h2 className="display mt-4 text-5xl md:text-7xl">{title}</h2>
            {description && <p className="mt-4 mx-auto max-w-xl text-muted">{description}</p>}
            {href && <Link href={href} className="inline-block mt-6 text-xs uppercase tracking-[0.24em] link-underline">View all →</Link>}
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
  const items = ['Company Analyses', 'Business Strategy', 'Industry Research', 'Founder Perspectives', 'Venture Capital', 'Lessons from Failure', 'Editorial', 'Innovation']
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
