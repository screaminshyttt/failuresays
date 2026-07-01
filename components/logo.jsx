'use client'
import Image from 'next/image'
import { LOGO_MARK, LOGO_WORDMARK } from '@/lib/brand'

export function LogoMark({ size = 32, className = '', invert = false }) {
  return (
    <span className={`inline-flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size, filter: invert ? 'invert(1)' : 'none' }}>
      <Image src={LOGO_MARK} alt="FailureSays" width={size} height={size} className="object-contain" priority />
    </span>
  )
}

// Wordmark-only lockup — shows the uploaded wordmark image (no separate text).
// Height controls sizing; width scales via the intrinsic aspect ratio.
export function LogoWordmark({ height = 28, invert = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ height, filter: invert ? 'invert(1)' : 'none' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_WORDMARK} alt="FailureSays" style={{ height: '100%', width: 'auto', display: 'block' }} />
    </span>
  )
}

export function LogoLockup({ invert = false, size = 28 }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} invert={invert} />
      <span className={`display text-2xl tracking-[0.02em] ${invert ? 'text-paper' : 'text-ink'}`}>FailureSays</span>
    </div>
  )
}
