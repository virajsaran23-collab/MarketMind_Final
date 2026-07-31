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
  CheckCircle2,
} from 'lucide-react'
import { LandingHeader } from '@/components/marketmind/landing-header'
import { CaseStudyImage } from '@/components/marketmind/case-study-image'
import { useLanguage } from '@/lib/language-context'

export default function LandingPage() {
  const { t } = useLanguage()
  const [caseStudies, setCaseStudies] = useState<any[]>([
    {
      id: 'lemonade-stand',
      title: 'The Great Lemonade Stand (What is a Stock?)',
      description: 'Learn what a stock and dividend are with Timmy\'s lemonade business!',
      difficulty: 'Beginner',
      read_time: '3 min',
      image: '/case-lemonade.png',
    },
    {
      id: 'candy-craze',
      title: 'The Candy Craze (Supply & Demand)',
      description: 'Discover how supply and demand change prices when everyone wants the same treat!',
      difficulty: 'Beginner',
      read_time: '4 min',
      image: '/case-candy.png',
    },
    {
      id: 'egg-basket',
      title: 'Don\'t Put All Eggs in One Basket',
      description: 'Learn why spreading your money across different investments protects your savings.',
      difficulty: 'Beginner',
      read_time: '3 min',
      image: '/case-eggs.png',
    },
    {
      id: 'magic-snowball',
      title: 'The Magic Snowball (Compound Interest)',
      description: 'See how your savings grow exponentially over time when interest earns interest!',
      difficulty: 'Beginner',
      read_time: '3 min',
      image: '/case-snowball.png',
    },
  ])

  useEffect(() => {
    async function loadCaseStudies() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/case-studies/`
        )
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setCaseStudies(data)
          }
        }
      } catch {
        // Fallback to initial state
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Soft Ambient Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-[#00B4D8]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-40 size-[400px] rounded-full bg-[#38bdf8]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00B4D8]/10 px-3.5 py-1.5 text-xs font-semibold text-[#00B4D8] border border-[#00B4D8]/20 shadow-xs">
              <Sparkles className="size-3.5 text-[#00B4D8]" />
              <span>{t('Learn by doing, not by reading', 'पढ़कर नहीं, करके सीखें')}</span>
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 leading-[1.1]">
              {t('Learn the Stock Market by Playing It', 'शेयर बाज़ार को खेल-खेल में सीखें')}
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
              {t(
                'Invest virtual money, react to real-world events, and understand how markets move — all in one simple, interactive simulation platform.',
                'आभासी पैसे का निवेश करें, वास्तविक दुनिया की घटनाओं पर प्रतिक्रिया दें और समझें कि बाज़ार कैसे बदलता है - सब एक ही सिमुलेशन प्लेटफॉर्म पर।'
              )}
            </p>

            <div className="flex flex-col gap-3.5 sm:flex-row pt-2">
              <Link
                href="/dashboard"
                className="h-12 px-7 text-sm font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('Start Investing', 'निवेश शुरू करें')}
                <ArrowRight className="size-4 ml-2" />
              </Link>
              <Link
                href="/case-studies"
                className="h-12 px-6 text-sm font-semibold flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                {t('Explore Case Studies', 'केस स्टडीज़ देखें')}
              </Link>
            </div>

            <dl className="grid max-w-md grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              {stats.map((s) => (
                <div key={s.l}>
                  <dt className="font-mono text-2xl font-bold text-[#00B4D8] tracking-tight">
                    {s.v}
                  </dt>
                  <dd className="text-xs text-slate-500 font-medium mt-1">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-[#00B4D8]/15 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-200">
              <Image
                src="/hero-dashboard.png"
                alt="MarketMind dashboard preview showing stock charts, commodities, and portfolio growth"
                width={720}
                height={560}
                priority
                className="w-full rounded-xl border border-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 border-t border-slate-100"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest">
            {t('Interactive Features', 'इंटरैक्टिव सुविधाएं')}
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 mt-2">
            {t('Everything you need to master the markets', 'बाज़ार में महारत हासिल करने के लिए सब कुछ')}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {t(
              'A complete learning environment built around real decisions and real consequences.',
              'वास्तविक निर्णयों और परिणामों पर आधारित एक संपूर्ण शिक्षण वातावरण।'
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#00B4D8]/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-gradient-to-tr group-hover:from-[#00B4D8] group-hover:to-[#0891b2] group-hover:text-white transition-all duration-300">
                <f.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 font-normal">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Case studies preview */}
      <section
        id="case-studies"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 border-t border-slate-100 bg-slate-50/50"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00B4D8]/10 px-3 py-1 text-xs font-semibold text-[#00B4D8] border border-[#00B4D8]/20 mb-3">
              <CheckCircle2 className="size-3.5" />
              {t('The differentiator', 'मुख्य विशेषता')}
            </span>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
              {t("Learn from history's biggest market moments", 'इतिहास के सबसे बड़े बाज़ार क्षणों से सीखें')}
            </h2>
          </div>
          <Link
            href="/case-studies"
            className="h-10 px-4 text-xs font-semibold flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            {t('View all', 'सभी देखें')}
            <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((cs: any) => (
            <Link
              key={cs.id}
              href={`/case-studies/${cs.id}`}
              className="group rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:border-[#00B4D8]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <CaseStudyImage
                src={cs.image}
                alt={cs.title}
                seed={cs.id}
                className="aspect-[16/10] border-b border-slate-100"
              />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="rounded-full bg-cyan-50 text-[#00B4D8] px-2.5 py-0.5 font-semibold border border-cyan-100">
                    {cs.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {cs.read_time}
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm leading-snug text-slate-900 group-hover:text-[#00B4D8] transition-colors">
                  {cs.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 font-normal leading-relaxed">
                  {cs.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-cyan-50/30 to-white p-10 text-center sm:p-16 shadow-xl shadow-cyan-500/5">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#00B4D8]/10 blur-3xl" />
          <h2 className="relative text-balance text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
            {t('Start building real investing intuition today', 'आज ही निवेश की वास्तविक समझ विकसित करना शुरू करें')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-600 font-normal">
            {t(
              'Join thousands of learners using MarketMind to understand markets through hands-on simulation — completely risk-free.',
              'सिमुलेशन के माध्यम से बाज़ार को समझने के लिए MarketMind का उपयोग करने वाले हज़ारों शिक्षार्थियों से जुड़ें - पूरी तरह से जोखिम मुक्त।'
            )}
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="h-12 px-8 text-sm font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              {t('Start Investing', 'निवेश शुरू करें')}
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[#00B4D8] text-white text-xs font-bold">M</span>
            <span className="font-bold text-slate-900 text-sm">MarketMind</span>
          </div>
          <p>
            © {new Date().getFullYear()} MarketMind. {t('Educational simulation only.', 'केवल शैक्षणिक सिमुलेशन हेतु।')}
          </p>
        </div>
      </footer>
    </div>
  )
}


