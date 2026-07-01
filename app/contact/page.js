'use client'
import { motion } from 'framer-motion'
import { Mail, Twitter, Linkedin, Github, Copy, Check, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

const CONTACT_EMAIL = 'work.ananyagupta@gmail.com'

const SOCIALS = [
  { label: 'Twitter', href: '#', Icon: Twitter },
  { label: 'LinkedIn', href: '#', Icon: Linkedin },
  { label: 'GitHub', href: '#', Icon: Github },
  { label: 'Email', href: `mailto:${CONTACT_EMAIL}`, Icon: Mail },
]

export default function ContactPage() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      toast.success('Email copied.')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  // Single self-contained editorial page. Sized to fit within a standard
  // desktop viewport (above the fold) with a consistent 32/48/64 rhythm.
  return (
    <div className="bg-paper">
      <section className="container-editorial-wide pt-4 md:pt-6 pb-10 md:pb-14">
        {/* HERO ------------------------------------------------------- */}
        <div className="eyebrow">Say Hello</div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="page-heading mt-3"
        >
          CONTACT.
        </motion.h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg text-muted leading-relaxed">
          For ideas, essays, collaborations, or just a conversation about failure and what it teaches.
        </p>

        {/* EMAIL SECTION --------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-10 md:mt-12"
        >
          <div className="eyebrow">Write to</div>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group mt-3 inline-flex items-center gap-3 flex-wrap"
          >
            <span
              className="font-semibold tracking-[-0.02em] leading-[1.05] text-ink lowercase group-hover:opacity-80 transition-opacity break-all"
              style={{ fontSize: 'clamp(1.5rem, 4.2vw, 3.5rem)' }}
            >
              {CONTACT_EMAIL}
            </span>
            <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-ink group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>

          <div className="mt-4">
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] border border-black px-4 py-2.5 hover:bg-black hover:text-paper transition-colors"
            >
              {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy email</>)}
            </button>
          </div>
        </motion.div>

        {/* INFO STRIP — perfectly balanced 3-col grid ---------------- */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-rule">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            <MetaBlock title="Response time">
              I read every message. Replies typically within a week — sometimes sooner.
            </MetaBlock>

            <MetaBlock title="Best for">
              Essay ideas, thoughtful disagreement, startup analyses to dissect, collaborations.
            </MetaBlock>

            <MetaBlock title="Elsewhere">
              <div className="flex flex-wrap gap-2 mt-0.5">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 border border-rule bg-white flex items-center justify-center hover:bg-black hover:text-paper transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </MetaBlock>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetaBlock({ title, children }) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <div className="mt-3 text-[14px] md:text-[15px] text-muted leading-[1.65]">
        {children}
      </div>
    </div>
  )
}
