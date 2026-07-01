'use client'
import { motion } from 'framer-motion'
import { LogoMark } from '@/components/logo'

const sections = [
  { key: 'mission', label: 'Mission' },
  { key: 'vision', label: 'Vision' },
  { key: 'journey', label: 'Journey' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'philosophy', label: 'Personal Philosophy' },
]

export default function AboutPage() {
  return (
    <div className="bg-paper">
      <section className="container-editorial pt-20 pb-16">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="eyebrow">About the Publication</div>
            <h1 className="display mt-4 text-6xl md:text-[128px] leading-[0.9]">About.</h1>
            <p className="mt-8 max-w-2xl text-lg text-muted leading-relaxed">
              FailureSays is a personal brand, portfolio, and knowledge platform — built for founders, operators, investors, students, and ambitious people who love learning.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
              <LogoMark size={220} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container-editorial py-16">
        <div className="grid md:grid-cols-12 gap-16">
          <aside className="md:col-span-3">
            <div className="sticky top-28">
              <div className="eyebrow">Contents</div>
              <ul className="mt-5 space-y-3 text-sm">
                {sections.map(s => (
                  <li key={s.key}><a href={`#${s.key}`} className="link-underline text-muted hover:text-ink">{s.label}</a></li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="md:col-span-9 space-y-24">
            {sections.map((s, i) => (
              <motion.section key={s.key} id={s.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: i * 0.05 }} className="scroll-mt-32">
                <div className="eyebrow">{String(i+1).padStart(2,'0')}</div>
                <h2 className="display mt-3 text-5xl md:text-7xl">{s.label}</h2>
                <div className="mt-8 border-l-2 border-black pl-6 py-4 text-muted italic">
                  This section is intentionally empty. Author to fill.
                </div>
                <div className="mt-8 grid gap-4">
                  {Array.from({ length: 3 }).map((_, k) => (
                    <div key={k} className="h-3 w-full bg-cream border border-rule" style={{ maxWidth: `${100 - k*8}%` }} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
