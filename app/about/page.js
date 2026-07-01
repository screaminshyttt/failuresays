'use client'
import { motion } from 'framer-motion'

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

/**
 * Editorial section: massive left-aligned heading with body copy flowing
 * directly beneath it. Both anchored to the same left margin.
 */
function EditorialSection({ heading, children, first = false }) {
  return (
    <section className={`w-full mx-auto max-w-[1600px] px-6 md:px-16 lg:px-24 xl:px-28 ${first ? 'pt-16 md:pt-24' : 'pt-28 md:pt-40'} pb-16 md:pb-28`}>
      {/* HEADING — single line, fluid sizing so it always fits without wrapping */}
      <FadeIn>
        <h2 className="display uppercase leading-[0.95] tracking-[-0.005em] text-ink whitespace-nowrap text-[clamp(2.25rem,9vw,9rem)]">
          {heading}
        </h2>
      </FadeIn>

      {/* BODY — spans the full editorial container for a premium long-form feel */}
      <FadeIn delay={0.08}>
        <div className="mt-10 md:mt-14 w-full space-y-6 text-[18px] md:text-[19px] leading-[1.85] text-ink">
          {children}
        </div>
      </FadeIn>
    </section>
  )
}

/** Utility: renders lines of a heading stacked vertically (block elements). */
function Stacked({ lines }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">{line}</span>
      ))}
    </>
  )
}

export default function AboutPage() {
  return (
    <div className="bg-paper">
      {/* 01 — ABOUT. */}
      <EditorialSection heading="ABOUT." first>
        <div className="eyebrow mb-6">01 — The Publication</div>
        <p>Every successful company has a story.</p>
        <p>Most people stop at the ending.</p>
        <p>I don&rsquo;t.</p>
        <p>FailureSays was founded by Ananya as an independent platform to explore businesses beyond what the world sees. While headlines celebrate victories and social media debates failures, the real story is usually hidden beneath strategy, execution, culture, psychology, timing, competition, and the countless decisions that never make the news.</p>
        <p>This platform exists to uncover those stories.</p>
        <p>Here, you&rsquo;ll find startup analyses, company improvement ideas, case studies, startup concepts, market observations, and lessons drawn from both extraordinary successes and spectacular failures. Some articles question why a company succeeded. Others explore why it struggled. Many ask a different question altogether: What could it have done better?</p>
        <p>I don&rsquo;t believe any company is beyond criticism, and I don&rsquo;t believe any failure is without value. Every business, whether it&rsquo;s a garage startup or a global corporation, leaves behind patterns worth studying and assumptions worth challenging.</p>
        <p>FailureSays isn&rsquo;t built on consensus. It isn&rsquo;t driven by trends, algorithms, or sponsored opinions. Every article reflects my own research, perspective, and curiosity. The goal isn&rsquo;t to convince you that I&rsquo;m right—it&rsquo;s to make you think differently.</p>
        <p>The best ideas rarely come from looking where everyone else is looking.</p>
        <p>They come from asking questions no one else thought to ask.</p>
        <p>That&rsquo;s what FailureSays is.</p>
        <p>A place to question. To analyze. To challenge. To learn.</p>
      </EditorialSection>

      {/* Divider */}
      <div className="w-full mx-auto max-w-[1600px] px-6 md:px-16 lg:px-24 xl:px-28">
        <div className="rule" />
      </div>

      {/* 02 — WHO'S MR. ANANYA? */}
      <EditorialSection heading={"WHO\u2019S MR. ANANYA?"}>
        <div className="eyebrow mb-6">02 — The Founder</div>
        <p>At 19, Ananya is driven by one obsession: understanding how businesses are built, why they succeed, why they fail, and how they can become better.</p>
        <p>After founding a few ventures that ultimately failed, he realized that failure isn&rsquo;t just an outcome—it&rsquo;s one of the best teachers. That belief became the foundation of FailureSays.</p>
        <p>Today, he spends most of his time analysing startups, studying companies, exploring business models, questioning strategies, developing alternative approaches, forecasting outcomes, and documenting his thinking. Every article published here is part of that journey.</p>
        <p>He understands that analysing a business from the outside is not the same as operating one. Real businesses deal with constraints, imperfect information, and challenges that aren&rsquo;t always visible. But he believes that learning comes from thinking deeply, questioning assumptions, and constantly refining ideas—not from waiting until you&rsquo;re experienced enough to start.</p>
        <p>FailureSays is his way of learning in public. It&rsquo;s a record of his curiosity, his analyses, his successes, his mistakes, and his evolving perspective on business.</p>
        <p>He isn&rsquo;t trying to have the final answer.</p>
        <p>He&rsquo;s trying to ask better questions than he did yesterday.</p>
      </EditorialSection>

      {/* Divider */}
      <div className="w-full mx-auto max-w-[1600px] px-6 md:px-16 lg:px-24 xl:px-28">
        <div className="rule" />
      </div>

      {/* 03 — WHO THIS IS FOR? */}
      <EditorialSection heading="WHO THIS IS FOR?">
        <div className="eyebrow mb-6">03 — The Reader</div>
        <p>FailureSays is built for anyone curious about business, but it speaks most to those standing at the beginning.</p>
        <p>For students, aspiring founders, and young entrepreneurs trying to go from 0 to 1—the hardest step in entrepreneurship.</p>
        <p>Starting is uncertain. You don&rsquo;t have experience, a network, or years of execution behind you. All you have is curiosity and the willingness to learn. That&rsquo;s where FailureSays hopes to be useful.</p>
        <p>This platform won&rsquo;t guarantee success, and it won&rsquo;t replace real-world execution. But if it helps you think more clearly, avoid a few mistakes, ask better questions, or see opportunities others overlook, then it has served its purpose.</p>
        <p>Because once you step into the arena and start building, there&rsquo;s no turning back.</p>
        <p>And that&rsquo;s exactly where the real journey begins.</p>
      </EditorialSection>
    </div>
  )
}
