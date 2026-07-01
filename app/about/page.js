'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogoMark } from '@/components/logo'

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

const sections = [
  { key: 'about', label: 'About FailureSays' },
  { key: 'ananya', label: 'About Ananya' },
  { key: 'audience', label: 'Who This Is For' },
]

export default function AboutPage() {
  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="container-editorial pt-20 pb-16">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="eyebrow">About the Publication</div>
            <h1 className="display mt-4 text-6xl md:text-[128px] leading-[0.9]">About.</h1>
            <p className="mt-8 max-w-2xl text-lg text-muted leading-relaxed">
              A personal brand, portfolio, and knowledge platform — built for founders, operators, investors, students, and anyone curious about how businesses actually work.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
              <LogoMark size={220} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="container-editorial py-16">
        <div className="grid md:grid-cols-12 gap-16">
          {/* Sticky ToC */}
          <aside className="md:col-span-3">
            <div className="sticky top-28">
              <div className="eyebrow">Contents</div>
              <ul className="mt-5 space-y-3 text-sm">
                {sections.map(s => (
                  <li key={s.key}>
                    <a href={`#${s.key}`} className="link-underline text-muted hover:text-ink">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-9 space-y-28">
            {/* ---------- ABOUT FAILURESAYS ---------- */}
            <section id="about" className="scroll-mt-32">
              <FadeUp>
                <div className="eyebrow">01</div>
                <h2 className="display mt-3 text-5xl md:text-7xl">About FailureSays</h2>
              </FadeUp>

              <FadeUp delay={0.05}>
                <div className="mt-10 space-y-6 text-[17px] md:text-[19px] leading-[1.8] text-ink max-w-3xl">
                  <p className="display text-3xl md:text-5xl leading-[1.05] text-ink !mb-2">
                    Every successful company has a story.
                  </p>
                  <p className="text-muted italic text-xl md:text-2xl">
                    Most people stop at the ending. I don&rsquo;t.
                  </p>

                  <div className="rule mt-8 mb-4" />

                  <p>
                    FailureSays was founded by <span className="font-medium">Ananya</span> as an independent platform to explore businesses beyond what the world sees. While headlines celebrate victories and social media debates failures, the real story is usually hidden beneath strategy, execution, culture, psychology, timing, competition, and the countless decisions that never make the news.
                  </p>

                  <p className="border-l-2 border-black pl-6 italic text-muted">
                    This platform exists to uncover those stories.
                  </p>

                  <p>
                    Here, you&rsquo;ll find startup analyses, company improvement ideas, case studies, startup concepts, market observations, and lessons drawn from both extraordinary successes and spectacular failures. Some articles question why a company succeeded. Others explore why it struggled. Many ask a different question altogether: <span className="italic">What could it have done better?</span>
                  </p>

                  <p>
                    I don&rsquo;t believe any company is beyond criticism, and I don&rsquo;t believe any failure is without value. Every business — whether it&rsquo;s a garage startup or a global corporation — leaves behind patterns worth studying and assumptions worth challenging.
                  </p>

                  <p>
                    FailureSays isn&rsquo;t built on consensus. It isn&rsquo;t driven by trends, algorithms, or sponsored opinions. Every article reflects my own research, perspective, and curiosity. The goal isn&rsquo;t to convince you that I&rsquo;m right — it&rsquo;s to make you think differently.
                  </p>

                  <div className="pt-6">
                    <p className="display text-2xl md:text-4xl leading-[1.15] text-ink">
                      The best ideas rarely come from looking where everyone else is looking.
                    </p>
                    <p className="mt-3 display text-2xl md:text-4xl leading-[1.15] text-muted">
                      They come from asking questions no one else thought to ask.
                    </p>
                  </div>

                  <p className="pt-2">That&rsquo;s what FailureSays is.</p>

                  <p className="text-sm uppercase tracking-[0.28em] text-subtle">
                    A place to question. To analyze. To challenge. To learn.
                  </p>
                </div>
              </FadeUp>
            </section>

            {/* ---------- ABOUT ANANYA ---------- */}
            <section id="ananya" className="scroll-mt-32">
              <FadeUp>
                <div className="eyebrow">02</div>
                <h2 className="display mt-3 text-5xl md:text-7xl">About Ananya</h2>
              </FadeUp>

              <FadeUp delay={0.05}>
                <div className="mt-10 grid md:grid-cols-12 gap-10 max-w-4xl">
                  <div className="md:col-span-4">
                    <div className="bg-white border border-rule p-6 sticky top-28">
                      <div className="eyebrow">Founder</div>
                      <div className="mt-4 display text-4xl leading-none">Ananya</div>
                      <div className="mt-3 text-sm text-muted">Age 19 · Independent Analyst · Founder, FailureSays</div>
                      <div className="mt-6 grid gap-3 text-xs uppercase tracking-[0.22em] text-subtle">
                        <div>Startup analysis</div>
                        <div>Business strategy</div>
                        <div>Failure post-mortems</div>
                        <div>Learning in public</div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-6 text-[17px] md:text-[19px] leading-[1.8] text-ink">
                    <p>
                      At <span className="font-medium">19</span>, Ananya is driven by one obsession: understanding how businesses are built, why they succeed, why they fail, and how they can become better.
                    </p>

                    <p>
                      After founding a few ventures that ultimately failed, he realized that failure isn&rsquo;t just an outcome — it&rsquo;s one of the best teachers. That belief became the foundation of FailureSays.
                    </p>

                    <p>
                      Today, he spends most of his time analysing startups, studying companies, exploring business models, questioning strategies, developing alternative approaches, forecasting outcomes, and documenting his thinking. Every article published here is part of that journey.
                    </p>

                    <p>
                      He understands that analysing a business from the outside is not the same as operating one. Real businesses deal with constraints, imperfect information, and challenges that aren&rsquo;t always visible. But he believes that learning comes from thinking deeply, questioning assumptions, and constantly refining ideas — not from waiting until you&rsquo;re experienced enough to start.
                    </p>

                    <p>
                      FailureSays is his way of learning in public. It&rsquo;s a record of his curiosity, his analyses, his successes, his mistakes, and his evolving perspective on business.
                    </p>

                    <div className="pt-4 border-l-2 border-black pl-6">
                      <p className="text-xl md:text-2xl italic text-ink leading-[1.5]">
                        He isn&rsquo;t trying to have the final answer.
                      </p>
                      <p className="text-xl md:text-2xl italic text-muted leading-[1.5] mt-1">
                        He&rsquo;s trying to ask better questions than he did yesterday.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </section>

            {/* ---------- WHO THIS IS FOR ---------- */}
            <section id="audience" className="scroll-mt-32">
              <FadeUp>
                <div className="eyebrow">03</div>
                <h2 className="display mt-3 text-5xl md:text-7xl">Who This Is For</h2>
              </FadeUp>

              <FadeUp delay={0.05}>
                <div className="mt-10 space-y-6 text-[17px] md:text-[19px] leading-[1.8] text-ink max-w-3xl">
                  <p>
                    FailureSays is built for anyone curious about business, but it speaks most to those standing at the beginning.
                  </p>

                  <p className="display text-3xl md:text-5xl leading-[1.05] text-ink !mb-2">
                    For students, aspiring founders, and young entrepreneurs trying to go from 0 to 1 — the hardest step in entrepreneurship.
                  </p>

                  <p>
                    Starting is uncertain. You don&rsquo;t have experience, a network, or years of execution behind you. All you have is curiosity and the willingness to learn. That&rsquo;s where FailureSays hopes to be useful.
                  </p>

                  <p>
                    This platform won&rsquo;t guarantee success, and it won&rsquo;t replace real-world execution. But if it helps you think more clearly, avoid a few mistakes, ask better questions, or see opportunities others overlook, then it has served its purpose.
                  </p>

                  <div className="rule mt-8 mb-4" />

                  <p className="display text-2xl md:text-4xl leading-[1.15] text-ink">
                    Because once you step into the arena and start building, there&rsquo;s no turning back.
                  </p>
                  <p className="display text-2xl md:text-4xl leading-[1.15] text-muted">
                    And that&rsquo;s exactly where the real journey begins.
                  </p>
                </div>
              </FadeUp>

              {/* CTA */}
              <FadeUp delay={0.15}>
                <div className="mt-16 border-t border-rule pt-10 flex flex-wrap items-center justify-between gap-6 max-w-3xl">
                  <div>
                    <div className="eyebrow">Start reading</div>
                    <p className="mt-2 text-muted">Explore the essays, analyses, and lessons.</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/wisdom" className="btn-primary">Explore Wisdom</Link>
                    <Link href="/contact" className="btn-ghost">Get in touch</Link>
                  </div>
                </div>
              </FadeUp>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
