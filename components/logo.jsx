'use client'
import Image from 'next/image'
import { LOGO_MARK } from '@/lib/brand'

export function LogoMark({ size = 32, className = '', invert = false }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Image src={LOGO_MARK} alt="FailureSays" width={size} height={size} className={invert ? 'invert' : ''} priority />
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
