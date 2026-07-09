import Link from 'next/link'
import Image from 'next/image'
import {
  Wallet,
  Globe2,
  BookOpen,
  LineChart,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import { LandingHeader } from '@/components/marketmind/landing-header'
import { Logo } from '@/components/marketmind/logo'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { CaseStudyImage } from '@/components/marketmind/case-study-image'

import { cn } from '@/lib/utils'

const features = [
  {
    icon: Wallet,
    title: 'Virtual Trading',
    description:
      'Practice investing with risk-free virtual money across stocks, industries and commodities.',
  },
  {
    icon: Globe2,
    title: 'Real-World Event Simulation',
    description:
      'See how wars, elections, policy changes, and economic events impact markets in real time.',
  },
  {
    icon: BookOpen,
    title: 'Interactive Case Studies',
    description:
      'Learn through historical market events and understand their lasting consequences.',
  },
  {
    icon: LineChart,
    title: 'Performance Analytics',
    description:
      'Track portfolio growth and compare your decisions over time with deep analytics.',
  },
]

async function fetchCaseStudies() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/case-studies/`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function LandingPage() {
  const caseStudies = await fetchCaseStudies()
  return (
    <div className="min-h-screen">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="relative">
            <Badge variant="default" className="mb-5">
              <Sparkles className="size-3" />
              Learn by doing, not by reading
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Learn the Stock Market by Playing It
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Invest virtual money, react to real-world events, and understand
              how markets move — all in one immersive simulation platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={cn(buttonVariants(), 'h-12 px-6 text-base')}
              >
                Start Investing
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/case-studies"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-12 px-6 text-base',
                )}
              >
                Explore Case Studies
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { v: '50K+', l: 'Active learners' },
                { v: '120+', l: 'Market events' },
                { v: '$0', l: 'Real money at risk' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-2xl font-semibold tracking-tight">
                    {s.v}
                  </dt>
                  <dd className="text-sm text-muted-foreground">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-2xl" />
            <Image
              src="/hero-dashboard.png"
              alt="MarketMind dashboard preview showing stock charts, commodities, and portfolio growth"
              width={720}
              height={560}
              priority
              className="w-full rounded-3xl border border-border shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to master the markets
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A complete learning environment built around real decisions and real
            consequences.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className="p-6 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="size-5.5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Case studies preview */}
      <section
        id="case-studies"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <Badge variant="default" className="mb-4">
              The differentiator
            </Badge>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Learn from history&apos;s biggest market moments
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Step into pivotal economic events and make the calls. See how your
              decisions would have played out.
            </p>
          </div>
          <Link
            href="/case-studies"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((cs: any) => (
            <Link
              key={cs.id}
              href={`/case-studies/${cs.id}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
            >
              <CaseStudyImage
                src={cs.image}
                alt={cs.title}
                seed={cs.id}
                className="aspect-[16/10] overflow-hidden rounded-none"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="muted">{cs.difficulty}</Badge>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {cs.read_time}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold leading-snug">{cs.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {cs.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <Card className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-success/10 blur-3xl" />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Start building real investing intuition today
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Join thousands of learners using MarketMind to understand markets
            through hands-on simulation — completely risk-free.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className={cn(buttonVariants(), 'h-12 px-7 text-base')}
            >
              Start Investing
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MarketMind. Educational simulation only.
          </p>
        </div>
      </footer>
    </div>
  )
}
