import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00B4D8] to-[#0891b2] text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all duration-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5 text-white"
          aria-hidden="true"
        >
          <path d="M4 16l4-5 3.5 3 4-7L20 8" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
        Market<span className="text-[#00B4D8]">Mind</span>
      </span>
    </Link>
  )
}


