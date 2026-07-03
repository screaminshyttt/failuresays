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
    <section className={`container-editorial-wide ${first ? 'pt-4 md:pt-6' : 'pt-28 md:pt-40'} pb-16 md:pb-28`}>
      {/* HEADING — single line, fluid sizing so it always fits without wrapping */}
      <FadeIn>
        <h2 className="page-heading text-center">{heading}</h2>
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
      {/* ABOUT */}
      <EditorialSection heading="ABOUT." first>
        <p>Failure Says is an independent editorial publication dedicated to startups, entrepreneurship, venture capital, technology, innovation, and modern business.</p>
        <p>We produce original reporting, editorial analysis, long-form features, company case studies, founder profiles, market intelligence, venture capital coverage, product and business strategy breakdowns, industry research, opinion essays, and data-driven insights that help readers understand the forces shaping the global startup ecosystem.</p>
        <p>Our editorial philosophy is built on a simple belief: understanding a company requires more than following its milestones. Behind every product launch, funding round, acquisition, market shift, or breakthrough lies a series of decisions, assumptions, trade-offs, and moments of uncertainty that rarely receive the attention they deserve. Those are the stories we choose to examine.</p>
        <p>Our reporting extends across every stage of the entrepreneurial journey—from ambitious founders building their first company to category-defining businesses transforming global industries. We cover emerging startups, established technology companies, venture capital firms, product innovation, leadership, business models, competitive strategy, market dynamics, regulation, artificial intelligence, consumer behavior, and the broader economic trends influencing the future of business.</p>
        <p>Every article is developed through research, verification, and analysis with an emphasis on accuracy, clarity, and context. Rather than simply reporting events, we seek to explain their significance—connecting individual developments to the larger patterns that shape industries and define long-term outcomes. Our objective is not only to inform readers about what happened, but to provide the perspective needed to understand why it matters and what may come next.</p>
        <p>Failure Says is read by founders, entrepreneurs, operators, investors, students, researchers, and professionals who believe that better decisions begin with better understanding. Whether you&rsquo;re exploring an emerging startup, studying an iconic company&rsquo;s evolution, following investment trends, or learning from businesses that challenged conventional thinking, our mission remains the same: to deliver journalism and analysis that is rigorous, accessible, and enduring.</p>
        <p>In a world saturated with information, we believe lasting value comes from context, critical thinking, and independent analysis.</p>
        <p>Because the future of business is written not only by the companies that succeed, but by the ideas, decisions, and lessons that shape them.</p>
      </EditorialSection>
    </div>
  )
}
