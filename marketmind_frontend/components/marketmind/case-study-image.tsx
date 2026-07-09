'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

const FRAME_STYLES = [
  {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(14, 165, 233, 0.16))',
    glow: 'bg-cyan-400/20',
  },
  {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(239, 68, 68, 0.16))',
    glow: 'bg-rose-400/20',
  },
  {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(245, 158, 11, 0.16))',
    glow: 'bg-amber-400/20',
  },
  {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(34, 197, 94, 0.16))',
    glow: 'bg-emerald-400/20',
  },
]

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export function CaseStudyImage({
  src,
  alt,
  seed,
  className,
  priority = false,
  sizes = '(max-width: 1024px) 100vw, 33vw',
}: {
  src: string
  alt: string
  seed: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const isSvg = src.toLowerCase().endsWith('.svg')
  const frame = FRAME_STYLES[hashString(seed) % FRAME_STYLES.length]

  return (
    <div
      className={cn(
        'group relative overflow-hidden border border-border bg-slate-950/80 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.75)]',
        className,
      )}
    >
      <div className="absolute inset-0" style={{ background: frame.background }} />
      <div
        className={cn(
          'absolute -right-20 -top-20 size-56 rounded-full blur-3xl opacity-80',
          frame.glow,
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.02)_28%,rgba(0,0,0,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_44%)]" />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          'relative z-10 transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:rotate-[0.5deg]',
          isSvg ? 'object-contain p-5 sm:p-6' : 'object-cover',
        )}
      />
      <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/15 to-transparent z-10" />
      <div className="absolute inset-x-4 bottom-4 h-px bg-white/10 z-20" />
    </div>
  )
}