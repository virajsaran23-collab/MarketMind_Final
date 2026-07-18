import { cn } from '@/lib/utils'

export function RiskMeter({
  value,
  className,
}: {
  value: number // 0-100
  className?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))
  const level = clamped < 34 ? 'Low' : clamped < 67 ? 'Moderate' : 'High'
  const levelColor =
    clamped < 34 ? 'text-success' : clamped < 67 ? 'text-chart-3' : 'text-destructive'

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Risk Level</span>
        <span className={cn('font-semibold', levelColor)}>{level}</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clamped}%`,
            background:
              'linear-gradient(90deg, var(--success), var(--chart-3), var(--destructive))',
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Safe</span>
        <span>Balanced</span>
        <span>Risky</span>
      </div>
    </div>
  )
}
