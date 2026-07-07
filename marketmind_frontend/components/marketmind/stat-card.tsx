import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
      ? 'text-success'
      : accent === 'danger'
        ? 'text-destructive'
        : 'text-primary'

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-xl bg-secondary">
            <Icon className={cn('size-4.5', accentClass)} />
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm">
        {typeof change === 'number' ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              positive ? 'text-success' : 'text-destructive',
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {positive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        ) : null}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  )
}
