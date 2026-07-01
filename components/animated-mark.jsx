'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LOGO_MARK } from '@/lib/brand'

export default function AnimatedMark({ size = 520 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size, maxWidth: '100%' }}>
      <motion.div
        className="absolute inset-0 rounded-full border border-rule"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border border-rule"
        animate={{ rotate: -360 }}
        transition={{ duration: 140, ease: 'linear', repeat: Infinity }}
      />
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 360] }}
        transition={{ y: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 120, repeat: Infinity, ease: 'linear' } }}
        className="relative"
        style={{ width: size * 0.72, height: size * 0.72 }}
      >
        <Image src={LOGO_MARK} alt="FailureSays" fill className="object-contain" priority />
      </motion.div>
    </div>
  )
}
