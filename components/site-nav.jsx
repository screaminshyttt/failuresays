'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { NAV_MARK, NAV_WORDMARK } from '@/lib/brand'

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

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
      <div className="container-editorial flex items-center">
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
      </div>
    </motion.header>
  )
}
