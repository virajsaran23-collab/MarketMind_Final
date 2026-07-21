'use client'

import { useEffect, useState } from 'react'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { CaseStudyImage } from '@/components/marketmind/case-study-image'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const { t } = useLanguage()
  const [caseStudies, setCaseStudies] = useState<any[]>([])

  useEffect(() => {
    async function loadCaseStudies() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/case-studies/`
        )
        if (res.ok) {
          const data = await res.json()
          setCaseStudies(data)
        }
      } catch {
        // Fallback or handle offline
      }
    }
    loadCaseStudies()
  }, [])

  const features = [
    {
      icon: Wallet,
      title: t('Virtual Trading', 'आभासी व्यापार'),
      description: t(
        'Practice investing with risk-free virtual money across stocks, industries and commodities.',
        'शेयरों, उद्योगों और कमोडिटीज़ में बिना किसी जोखिम के आभासी धन के साथ निवेश का अभ्यास करें।'
      ),
    },
    {
      icon: Globe2,
      title: t('Real-World Event Simulation', 'वास्तविक घटना सिमुलेशन'),
      description: t(
        'See how wars, elections, policy changes, and economic events impact markets in real time.',
        'देखें कि युद्ध, चुनाव, नीतिगत बदलाव और आर्थिक घटनाएं वास्तविक समय में बाज़ार को कैसे प्रभावित करती हैं।'
      ),
    },
    {
      icon: BookOpen,
      title: t('Interactive Case Studies', 'इंटरैक्टिव केस स्टडीज़'),
      description: t(
        'Learn through historical market events and understand their lasting consequences.',
        'ऐतिहासिक बाज़ार की घटनाओं से सीखें और उनके दीर्घकालिक परिणामों को समझें।'
      ),
    },
    {
      icon: LineChart,
      title: t('Performance Analytics', 'प्रदर्शन एनालिटिक्स'),
      description: t(
        'Track portfolio growth and compare your decisions over time with deep analytics.',
        'पोर्टफोलियो विकास को ट्रैक करें और गहन विश्लेषण के साथ समय के साथ अपने निर्णयों की तुलना करें।'
      ),
    },
  ]

  const stats = [
    { v: '50K+', l: t('Active learners', 'सक्रिय शिक्षार्थी') },
    { v: '120+', l: t('Market events', 'बाज़ार की घटनाएं') },
    { v: '$0', l: t('Real money at risk', 'जोखिम में वास्तविक धन') },
  ]

  return (
    <div className="min-h-screen">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="relative">
            <Badge variant="default" className="mb-5">
              <Sparkles className="size-3 mr-1" />
              {t('Learn by doing, not by reading', 'पढ़कर नहीं, करके सीखें')}
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {t('Learn the Stock Market by Playing It', 'शेयर बाज़ार को खेल-खेल में सीखें')}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {t(
                'Invest virtual money, react to real-world events, and understand how markets move — all in one immersive simulation platform.',
                'आभासी पैसे का निवेश करें, वास्तविक दुनिया की घटनाओं पर प्रतिक्रिया दें और समझें कि बाज़ार कैसे बदलता है - सब एक ही सिमुलेशन प्लेटफॉर्म पर।'
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={cn(buttonVariants(), 'h-12 px-6 text-base')}
              >
                {t('Start Investing', 'निवेश शुरू करें')}
                <ArrowRight className="size-4 ml-1" />
              </Link>
              <Link
                href="/case-studies"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-12 px-6 text-base'
                )}
              >
                {t('Explore Case Studies', 'केस स्टडीज़ देखें')}
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {stats.map((s) => (
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
            {t('Everything you need to master the markets', 'बाज़ार में महारत हासिल करने के लिए सब कुछ')}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            {t(
              'A complete learning environment built around real decisions and real consequences.',
              'वास्तविक निर्णयों और परिणामों पर आधारित एक संपूर्ण शिक्षण वातावरण।'
            )}
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
              {t('The differentiator', 'मुख्य विशेषता')}
            </Badge>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("Learn from history's biggest market moments", 'इतिहास के सबसे बड़े बाज़ार क्षणों से सीखें')}
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              {t(
                'Step into pivotal economic events and make the calls. See how your decisions would have played out.',
                'महत्वपूर्ण आर्थिक घटनाओं में कदम रखें और निर्णय लें। देखें कि आपके फैसले कैसे रंग लाते।'
              )}
            </p>
          </div>
          <Link
            href="/case-studies"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
          >
            {t('View all', 'सभी देखें')}
            <ArrowRight className="size-4 ml-1" />
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
            {t('Start building real investing intuition today', 'आज ही निवेश की वास्तविक समझ विकसित करना शुरू करें')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {t(
              'Join thousands of learners using MarketMind to understand markets through hands-on simulation — completely risk-free.',
              'सिमुलेशन के माध्यम से बाज़ार को समझने के लिए MarketMind का उपयोग करने वाले हज़ारों शिक्षार्थियों से जुड़ें - पूरी तरह से जोखिम मुक्त।'
            )}
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className={cn(buttonVariants(), 'h-12 px-7 text-base')}
            >
              {t('Start Investing', 'निवेश शुरू करें')}
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold tracking-tight">MarketMind</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MarketMind. {t('Educational simulation only.', 'केवल शैक्षणिक सिमुलेशन हेतु।')}
          </p>
        </div>
      </footer>
    </div>
  )
}
