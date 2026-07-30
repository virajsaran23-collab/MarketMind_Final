import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  hint,
  accent,
}: {
  label: string
  value: string
  change?: number
  icon?: LucideIcon
  hint?: string
  accent?: 'primary' | 'success' | 'danger'
}) {
  const positive = (change ?? 0) >= 0
  const accentClass =
    accent === 'success'
      ? 'text-[#00B4D8]'
      : accent === 'danger'
        ? 'text-rose-600'
        : 'text-[#00B4D8]'

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-700">
            <Icon className={cn('size-4.5', accentClass)} />
          </span>
        )}
      </div>
      <div className="mt-3 font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900">
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof change === 'number' ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-full',
              positive ? 'bg-cyan-50 text-[#00B4D8] border border-cyan-100' : 'bg-rose-50 text-rose-600 border border-rose-100',
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {positive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        ) : null}
        {hint && <span className="text-slate-500 font-medium">{hint}</span>}
      </div>
    </div>
  )
}


