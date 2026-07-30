import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/20',
        success: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
        danger: 'bg-rose-50 text-rose-600 border border-rose-200',
        warning: 'bg-amber-50 text-amber-600 border border-amber-200',
        info: 'bg-sky-50 text-sky-600 border border-sky-200',
        muted: 'bg-slate-100 text-slate-600 border border-slate-200',
        outline: 'bg-white text-slate-700 border border-slate-200 shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
