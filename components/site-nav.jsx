'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { CATEGORIES, NAV_MARK, NAV_WORDMARK } from '@/lib/brand'

const wisdomItems = CATEGORIES.filter(c => c.slug !== 'blog')

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [wisdomOpen, setWisdomOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll(); window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 bg-black text-paper transition-all duration-500 ${scrolled ? 'py-1.5' : 'py-2.5'}`}
    >
      <div className="container-editorial flex items-center justify-between">
        {/* Logos - left */}
        <Link href="/" className="flex items-center gap-3" aria-label="FailureSays home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={NAV_MARK}
            alt=""
            style={{ height: scrolled ? 36 : 46, width: scrolled ? 36 : 46, objectFit: 'cover', display: 'block' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={NAV_WORDMARK}
            alt="FailureSays"
            style={{ height: scrolled ? 28 : 36, width: 'auto', display: 'block' }}
          />
        </Link>

        {/* Menu - center */}
        <nav className="hidden md:flex items-center gap-9 text-[13px] uppercase tracking-[0.2em]">
          <Link href="/" className="link-underline">Home</Link>
          <div
            className="relative"
            onMouseEnter={() => setWisdomOpen(true)}
            onMouseLeave={() => setWisdomOpen(false)}
          >
            <Link href="/wisdom" className="link-underline">Wisdom</Link>
            <AnimatePresence>
              {wisdomOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[280px]"
                >
                  <div className="bg-paper text-ink border border-rule p-2">
                    {wisdomItems.map(c => (
                      <Link
                        key={c.slug}
                        href={`/wisdom/${c.slug}`}
                        className="block px-4 py-3 text-[12px] tracking-[0.18em] hover:bg-cream transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                    <Link
                      href="/wisdom"
                      className="block px-4 py-3 text-[11px] tracking-[0.24em] border-t border-rule text-muted hover:text-ink"
                    >
                      All Wisdom →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/blog" className="link-underline">Blog</Link>
          <Link href="/about" className="link-underline">About</Link>
          <Link href="/contact" className="link-underline">Contact</Link>
        </nav>

        {/* Right side - just mobile menu button */}
        <div className="flex items-center">
          <button
            aria-label="Menu"
            className="md:hidden p-2"
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Spacer so desktop layout remains balanced with the logo lockup on the left */}
          <div className="hidden md:block w-[46px]" aria-hidden />
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="container-editorial py-6 flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
              <Link href="/" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/wisdom" onClick={() => setOpen(false)}>Wisdom</Link>
              {wisdomItems.map(c => (
                <Link
                  key={c.slug}
                  href={`/wisdom/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="pl-4 text-xs text-paper/70"
                >
                  {c.label}
                </Link>
              ))}
              <Link href="/blog" onClick={() => setOpen(false)}>Blog</Link>
              <Link href="/about" onClick={() => setOpen(false)}>About</Link>
              <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
