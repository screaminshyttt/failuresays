'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Copy, Check, ArrowUpRight, Send } from 'lucide-react'
import { toast } from 'sonner'
import BlockRenderer from '@/components/article/blocks'
import MetricsHero from '@/components/article/metrics-hero'

export default function ContactPage() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/pages/contact').then(r => r.json()).then(d => { setPage(d.page || null); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const p = page || {}
  const email = p.email || 'founder@failuresays.com'
  const socials = p.socials || []

  async function copyEmail() {
    try { await navigator.clipboard.writeText(email); setCopied(true); toast.success('Email copied.'); setTimeout(() => setCopied(false), 1600) }
    catch { toast.error('Could not copy.') }
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all fields.'); return }
    setSending(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed')
      toast.success('Message sent. Thank you!')
      setForm({ name: '', email: '', message: '' })
    } catch { toast.error('Could not send. Please email directly.') } finally { setSending(false) }
  }

  const input = 'w-full bg-white border border-rule px-4 py-3 outline-none focus:border-lime transition-colors text-sm'

  return (
    <div className="bg-transparent">
      <section className="container-editorial-wide pt-8 md:pt-12 pb-6 text-center">
        <div className="max-w-[760px] mx-auto">
          <div className="eyebrow-accent justify-center">{p.eyebrow || 'Say Hello'}</div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="page-heading mt-4">{p.title || 'CONTACT.'}</motion.h1>
          {p.subtitle && <p className="mt-8 text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto">{p.subtitle}</p>}
          <div className="mt-8 flex justify-center"><span className="w-16 h-[3px] bg-lime" /></div>
        </div>
      </section>

      <section className="container-editorial-wide pb-16">
        <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left: email + socials */}
          <div>
            <div className="eyebrow-accent">Write to</div>
            <a href={`mailto:${email}`} className="group mt-3 inline-flex items-center gap-3 flex-wrap">
              <span className="font-semibold tracking-[-0.015em] leading-[1.1] text-ink lowercase group-hover:opacity-80 break-all" style={{ fontSize: 'clamp(1.25rem, 2.8vw, 2rem)' }}>{email}</span>
              <ArrowUpRight className="w-5 h-5 text-lime group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <div className="mt-4">
              <button onClick={copyEmail} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] border border-black px-4 py-2.5 hover:bg-black hover:text-paper transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy email</>}
              </button>
            </div>
            {socials.length > 0 && (
              <div className="mt-10">
                <div className="eyebrow-accent">Elsewhere</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socials.map((s, i) => (
                    <a key={i} href={s.href || '#'} className="px-4 h-10 border border-rule bg-white flex items-center text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-paper transition-colors">{s.label}</a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: form */}
          {p.showForm !== false && (
            <form onSubmit={submit} className="border border-rule bg-white p-6 md:p-8 space-y-4">
              <div className="eyebrow-accent"><Mail className="w-3.5 h-3.5 text-lime" /> Send a message</div>
              <input className={input} placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className={input} placeholder="Your email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <textarea className={input} rows={5} placeholder="Your message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              <button disabled={sending} className="btn-primary w-full justify-center">{sending ? 'Sending…' : <>Send <Send className="w-4 h-4" /></>}</button>
            </form>
          )}
        </div>
      </section>

      {/* Optional extra content blocks */}
      {!loading && (p.blocks || []).length > 0 && (
        <section className="container-editorial-wide pb-24">
          <div className="max-w-[760px] mx-auto"><BlockRenderer blocks={p.blocks} MetricsHero={MetricsHero} /></div>
        </section>
      )}
    </div>
  )
}
