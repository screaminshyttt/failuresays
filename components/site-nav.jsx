'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X } from 'lucide-react'
import { LogoLockup } from '@/components/logo'
import { CATEGORIES } from '@/lib/brand'
import { useRouter } from 'next/navigation'

const wisdomItems = CATEGORIES.filter(c => c.slug !== 'blog')

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [wisdomOpen, setWisdomOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll(); window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!q) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch {}
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => { setOpen(false); setSearchOpen(false) }, [])

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        className={`sticky top-0 z-50 bg-black text-paper transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}
      >
        <div className="container-editorial flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <LogoLockup invert size={scrolled ? 24 : 28} />
          </Link>

          <nav className="hidden md:flex items-center gap-9 text-[13px] uppercase tracking-[0.2em]">
            <Link href="/" className="link-underline">Home</Link>
            <div className="relative" onMouseEnter={() => setWisdomOpen(true)} onMouseLeave={() => setWisdomOpen(false)}>
              <Link href="/wisdom" className="link-underline">Wisdom</Link>
              <AnimatePresence>
                {wisdomOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[280px]"
                  >
                    <div className="bg-paper text-ink border border-rule p-2">
                      {wisdomItems.map(c => (
                        <Link key={c.slug} href={`/wisdom/${c.slug}`} className="block px-4 py-3 text-[12px] tracking-[0.18em] hover:bg-cream transition-colors">
                          {c.label}
                        </Link>
                      ))}
                      <Link href="/wisdom" className="block px-4 py-3 text-[11px] tracking-[0.24em] border-t border-rule text-muted hover:text-ink">All Wisdom →</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/blog" className="link-underline">Blog</Link>
            <Link href="/about" className="link-underline">About</Link>
            <Link href="/contact" className="link-underline">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button aria-label="Search" className="p-2 hover:opacity-70" onClick={() => setSearchOpen(true)}>
              <Search className="w-4 h-4" />
            </button>
            <button aria-label="Menu" className="md:hidden p-2" onClick={() => setOpen(v => !v)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-white/10">
              <div className="container-editorial py-6 flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
                <Link href="/" onClick={() => setOpen(false)}>Home</Link>
                <Link href="/wisdom" onClick={() => setOpen(false)}>Wisdom</Link>
                {wisdomItems.map(c => (
                  <Link key={c.slug} href={`/wisdom/${c.slug}`} onClick={() => setOpen(false)} className="pl-4 text-xs text-paper/70">{c.label}</Link>
                ))}
                <Link href="/blog" onClick={() => setOpen(false)}>Blog</Link>
                <Link href="/about" onClick={() => setOpen(false)}>About</Link>
                <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
            <motion.div initial={{ y: -30 }} animate={{ y: 0 }} exit={{ y: -30 }} onClick={e => e.stopPropagation()} className="bg-paper text-ink max-w-3xl mx-auto mt-24 border border-rule">
              <div className="flex items-center border-b border-rule px-6">
                <Search className="w-4 h-4 text-muted" />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles, ideas, lessons..." className="flex-1 bg-transparent px-4 py-5 outline-none text-lg" onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }} />
                <button onClick={() => setSearchOpen(false)} className="text-xs uppercase tracking-[0.2em] text-muted">ESC</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {q && results.length === 0 && (
                  <div className="px-6 py-8 text-muted text-sm">No results yet.</div>
                )}
                {results.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} onClick={() => setSearchOpen(false)} className="flex items-baseline justify-between gap-6 px-6 py-4 border-b border-rule hover:bg-cream transition-colors">
                    <div>
                      <div className="eyebrow">{r.categoryLabel}</div>
                      <div className="text-lg">{r.title}</div>
                    </div>
                    <div className="text-xs text-subtle whitespace-nowrap">{r.readingTime} min read</div>
                  </Link>
                ))}
                {!q && (
                  <div className="px-6 py-8 text-muted text-sm">Start typing to search across every article.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
