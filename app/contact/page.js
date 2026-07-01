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

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="container-editorial-wide pt-4 md:pt-6 pb-6 md:pb-10">
        <div className="eyebrow">Say Hello</div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="page-heading mt-4"
        >
          CONTACT.
        </motion.h1>
        <p className="mt-8 max-w-3xl text-lg md:text-xl text-muted leading-relaxed">
          For ideas, essays, collaborations, or just a conversation about failure and what it teaches.
        </p>
      </section>

      {/* PRIMARY EMAIL — the whole page's centrepiece */}
      <section className="container-editorial-wide pt-8 md:pt-16 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow">Write to</div>

          {/* Email as a giant editorial statement */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group mt-6 inline-flex items-baseline gap-4 flex-wrap"
          >
            <span
              className="display uppercase tracking-[-0.005em] leading-[0.95] text-ink group-hover:opacity-80 transition-opacity"
              style={{ fontSize: 'clamp(1.9rem, 6.4vw, 6rem)' }}
            >
              {CONTACT_EMAIL}
            </span>
            <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 text-ink group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>

          {/* Copy action */}
          <div className="mt-8">
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] border border-black px-5 py-3 hover:bg-black hover:text-paper transition-colors"
            >
              {copied ? (<><Check className="w-3.5 h-3.5" /> Copied</>) : (<><Copy className="w-3.5 h-3.5" /> Copy email</>)}
            </button>
          </div>
        </motion.div>

        {/* Meta strip — response time, hours, and elsewhere */}
        <div className="mt-20 md:mt-28 grid gap-10 md:gap-14 md:grid-cols-3 border-t border-rule pt-14">
          <MetaBlock title="Response time">
            <p>I read every message. Replies typically within a week — sometimes sooner, occasionally longer if the reply deserves thought.</p>
          </MetaBlock>

          <MetaBlock title="Best for">
            <p>Essay ideas, thoughtful disagreement, startup analyses you want dissected, collaborations, and long-form conversations.</p>
          </MetaBlock>

          <MetaBlock title="Elsewhere">
            <div className="flex flex-wrap gap-3 mt-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 border border-rule bg-white flex items-center justify-center hover:bg-black hover:text-paper transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </MetaBlock>
        </div>
      </section>
    </div>
  )
}

function MetaBlock({ title, children }) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <div className="mt-4 text-[15px] md:text-base text-muted leading-relaxed">
        {children}
      </div>
    </div>
  )
}
