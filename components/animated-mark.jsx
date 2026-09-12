'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LOGO_MARK } from '@/lib/brand'

/**
 * Responsive rotating mark for the hero, dressed with concentric rings and
 * lime "crosshair" ticks to match the editorial signal theme. The `size`
 * prop sets the desktop size but on small screens we clamp to fit the
 * viewport so it never overflows.
 */
export default function AnimatedMark({ size = 520 }) {
  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{
        width: `min(${size}px, 82vw)`,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
      }}
    >
      {/* faint outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-rule"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
      />
      {/* inner ring */}
      <motion.div
        className="absolute inset-[9%] rounded-full border border-rule"
        animate={{ rotate: -360 }}
        transition={{ duration: 140, ease: 'linear', repeat: Infinity }}
      />
      {/* innermost dashed ring */}
      <div className="absolute inset-[20%] rounded-full border border-dashed border-black/10" />

      {/* lime crosshair ticks */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-8 bg-lime" />
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-[2px] w-8 bg-lime" />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-[2px] w-8 bg-lime" />

      {/* rotating mark */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 360] }}
        transition={{
          y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 120, repeat: Infinity, ease: 'linear' },
        }}
        className="relative"
        style={{ width: '68%', height: '68%' }}
      >
        <Image src={LOGO_MARK} alt="FailureSays" fill className="object-contain" priority />
      </motion.div>
    </div>
  )
}
