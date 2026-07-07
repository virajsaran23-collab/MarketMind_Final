'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400',
  Intermediate: 'bg-yellow-500/15 text-yellow-400',
  Advanced: 'bg-red-500/15 text-red-400',
}

export default function CaseStudyPage() {
  const { id } = useParams<{ id: string }>()
  const [cs, setCs] = useState<any>(null)

  useEffect(() => {
    if (id) api.caseStudy(id).then(setCs).catch(() => {})
  }, [id])

  if (!cs) return <div className="p-8 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/case-studies" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-6 gap-2')}>
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl mb-6">
        <Image src={cs.image} alt={cs.title} fill className="object-cover" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFF_COLOR[cs.difficulty]}`}>{cs.difficulty}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{cs.read_time}</span>
        {(cs.tags || []).map((t: string) => <Badge key={t} variant="muted" className="text-xs">{t}</Badge>)}
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{cs.title}</h1>
      <p className="mt-2 text-muted-foreground">{cs.description}</p>
      <div className="mt-6 prose prose-invert max-w-none">
        <p className="leading-relaxed text-foreground/90">{cs.long_description}</p>
      </div>
    </div>
  )
}
