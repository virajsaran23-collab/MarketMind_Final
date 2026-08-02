'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

const FRAME_STYLES = [
  {
    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(56, 189, 248, 0.14))',
    glow: 'bg-cyan-300/20',
  },
  {
    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(251, 113, 133, 0.12))',
    glow: 'bg-rose-300/20',
  },
  {
    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(251, 191, 36, 0.14))',
    glow: 'bg-amber-300/20',
  },
  {
    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(52, 211, 153, 0.14))',
    glow: 'bg-emerald-300/20',
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
        'group relative overflow-hidden rounded-[1.75rem] border border-slate-200/75 bg-white shadow-[0_20px_60px_-28px_rgba(15,23,42,0.12)]',
        className,
      )}
    >
      <div className="absolute inset-0" style={{ background: frame.background }} />
      <div
        className={cn(
          'absolute -right-16 -top-12 size-52 rounded-full blur-3xl opacity-80',
          frame.glow,
        )}
      />
      <div className="absolute -left-20 -bottom-16 size-56 rounded-full blur-3xl opacity-60 bg-white/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.12)_48%,transparent_78%)]" />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          'relative z-10 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:-rotate-[0.5deg]',
          isSvg ? 'object-contain p-6' : 'object-cover',
        )}
      />
      <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.08)_48%,transparent_65%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 via-white/12 to-transparent z-10" />
      <div className="absolute inset-x-4 bottom-4 h-px bg-slate-300/40 z-20" />
    </div>
  )
}