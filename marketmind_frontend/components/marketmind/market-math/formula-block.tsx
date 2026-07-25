import { cn } from '@/lib/utils'

type FormulaBlockProps = {
  title: string
  formula: string
  description?: string
  className?: string
}

export function FormulaBlock({ title, formula, description, className }: FormulaBlockProps) {
  return (
    <div className={cn('rounded-xl border border-border/70 bg-card/40 p-5', className)}>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{title}</h3>
      <div className="mb-2 rounded-lg bg-muted/50 px-4 py-3 font-mono text-lg text-foreground">
        {formula}
      </div>
      {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  )
}
