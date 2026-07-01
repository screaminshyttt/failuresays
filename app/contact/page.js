'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Twitter, Linkedin, Github, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in your name, email, and message.'); return }
    setSending(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed')
      toast.success('Message received. I will respond thoughtfully.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch { toast.error('Something went wrong.') }
    finally { setSending(false) }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="bg-paper">
      <section className="container-editorial pt-20 pb-16">
        <div className="eyebrow">Say Hello</div>
        <h1 className="display mt-4 text-6xl md:text-[128px] leading-[0.9]">Contact.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">For ideas, essays, collaborations, or just a conversation about failure and what it teaches.</p>
      </section>

      <section className="container-editorial pb-24">
        <div className="grid md:grid-cols-12 gap-14">
          <div className="md:col-span-4 space-y-10">
            <div>
              <div className="eyebrow">Direct</div>
              <a href="mailto:hello@failuresays.com" className="mt-3 block text-2xl link-underline">hello@failuresays.com</a>
            </div>
            <div>
              <div className="eyebrow">Elsewhere</div>
              <div className="mt-4 flex gap-3">
                <a aria-label="Twitter" href="#" className="w-11 h-11 border border-rule bg-white flex items-center justify-center hover:bg-black hover:text-paper transition-colors"><Twitter className="w-4 h-4" /></a>
                <a aria-label="LinkedIn" href="#" className="w-11 h-11 border border-rule bg-white flex items-center justify-center hover:bg-black hover:text-paper transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a aria-label="GitHub" href="#" className="w-11 h-11 border border-rule bg-white flex items-center justify-center hover:bg-black hover:text-paper transition-colors"><Github className="w-4 h-4" /></a>
                <a aria-label="Email" href="mailto:hello@failuresays.com" className="w-11 h-11 border border-rule bg-white flex items-center justify-center hover:bg-black hover:text-paper transition-colors"><Mail className="w-4 h-4" /></a>
              </div>
            </div>
            <div>
              <div className="eyebrow">Response time</div>
              <p className="mt-3 text-muted">I read every message. Replies typically within a week.</p>
            </div>
          </div>

          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} onSubmit={submit} className="md:col-span-8 bg-white border border-rule p-8 md:p-12 space-y-8">
            <Field label="Name">
              <input required value={form.name} onChange={set('name')} className="input" placeholder="Your full name" />
            </Field>
            <Field label="Email">
              <input required type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" />
            </Field>
            <Field label="Subject">
              <input value={form.subject} onChange={set('subject')} className="input" placeholder="What is this about?" />
            </Field>
            <Field label="Message">
              <textarea required rows={7} value={form.message} onChange={set('message')} className="input resize-none" placeholder="Say what you actually mean." />
            </Field>
            <button disabled={sending} className="btn-primary disabled:opacity-60">{sending ? 'Sending…' : (<><span>Send message</span> <Send className="w-4 h-4" /></>)}</button>
            <style jsx>{`
              .input { width: 100%; background: transparent; border: 0; border-bottom: 1px solid #DDD9CF; padding: 0.75rem 0; outline: none; font-size: 1.05rem; }
              .input:focus { border-color: #000; }
              .input::placeholder { color: #8A8A8A; }
            `}</style>
          </motion.form>
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  )
}
