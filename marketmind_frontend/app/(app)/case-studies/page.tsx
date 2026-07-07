'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400',
  Intermediate: 'bg-yellow-500/15 text-yellow-400',
  Advanced: 'bg-red-500/15 text-red-400',
}

export default function CaseStudiesPage() {
  const [studies, setStudies] = useState<any[]>([])

  useEffect(() => {
    api.caseStudies().then(setStudies).catch(() => {})
  }, [])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Case Studies</h1>
        <p className="mt-1 text-muted-foreground">Learn from real market-moving events.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {studies.map((cs) => (
          <Link key={cs.id} href={`/case-studies/${cs.id}`}>
            <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer">
              <div className="relative aspect-[16/7] w-full overflow-hidden">
                <Image src={cs.image} alt={cs.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFF_COLOR[cs.difficulty]}`}>{cs.difficulty}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />{cs.read_time}
                  </span>
                </div>
                <h2 className="font-semibold text-lg">{cs.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{cs.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(cs.tags || []).map((t: string) => (
                    <Badge key={t} variant="muted" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
