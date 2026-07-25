'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Award,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormulaBlock } from '@/components/marketmind/market-math/formula-block'
import { RatioLabInteractive } from '@/components/marketmind/market-math/ratio-lab-interactive'
import { GrowthLabInteractive } from '@/components/marketmind/market-math/growth-lab-interactive'
import { RiskLabInteractive } from '@/components/marketmind/market-math/risk-lab-interactive'
import { PortfolioLabInteractive } from '@/components/marketmind/market-math/portfolio-lab-interactive'
import QuizModal from '@/components/marketmind/market-math/quiz-modal'
import { useLanguage } from '@/lib/language-context'
import { api } from '@/lib/api'

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function MathModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = (params.slug as string) || 'ratio-percentage-lab'
  const { t } = useLanguage()

  const [moduleData, setModuleData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [openQuiz, setOpenQuiz] = useState(false)

  const loadModule = () => {
    setIsLoading(true)
    api
      .mathModule(slug)
      .then(setModuleData)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadModule()
  }, [slug])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-muted/40 rounded-xl" />
        <div className="h-48 bg-muted/30 rounded-3xl" />
        <div className="h-96 bg-muted/20 rounded-3xl" />
      </div>
    )
  }

  if (!moduleData || moduleData.error) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Module Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested math lab module is unavailable.</p>
        <Link href="/market-math" className="inline-flex items-center gap-2 text-sm text-primary font-bold">
          <ArrowLeft className="size-4" /> Back to Market Math
        </Link>
      </div>
    )
  }

  const isComplete = moduleData.status === 'complete'

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          href="/market-math"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-4" /> {t('Back to Market Math', 'वापस मार्केट गणित पर')}
        </Link>
      </div>

      {/* Module Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card/30 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl opacity-50" />

        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={DIFF_COLOR[moduleData.difficulty] || DIFF_COLOR.Beginner + ' rounded-full px-2.5 py-0.5 text-[10px] font-bold border'}>
                {moduleData.difficulty}
              </span>
              <Badge variant="outline" className="text-[10px] bg-muted/40 font-semibold">
                Track: {moduleData.badge_track || 'Quant Lab'}
              </Badge>
              {isComplete && (
                <Badge className="bg-green-500/15 text-green-400 border-green-500/20 gap-1 text-[10px] font-bold">
                  <CheckCircle2 className="size-3" /> Completed (Score: {moduleData.quiz_score})
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{moduleData.title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{moduleData.concept_summary}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setOpenQuiz(true)}
              className="px-6 py-3 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="size-4" /> {isComplete ? 'Retake Quiz Gate' : 'Take Quiz Gate (≥80%)'}
            </button>
          </div>
        </div>
      </div>

      {/* PART 1: CONCEPT SUMMARY & FORMULAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest pl-1">
          <BookOpen className="size-4" /> Part 1: Financial Building Blocks
        </div>

        {slug === 'ratio-percentage-lab' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormulaBlock
              title="P/E Ratio"
              formula="P/E = Price ÷ EPS"
              description="Price-to-Earnings measures how much investors pay for every $1 of annual company earnings."
            />
            <FormulaBlock
              title="% Gain / Loss"
              formula="% Gain = (Current − Avg Buy) ÷ Avg Buy × 100"
              description="Measures your total return percentage relative to your average order execution price."
            />
            <FormulaBlock
              title="Market Cap"
              formula="Market Cap = Price × Shares Outstanding"
              description="Total market value of all company shares. Bucketed into Large (≥$10B), Mid ($2B–$10B), and Small (<$2B)."
            />
          </div>
        )}

        {slug === 'growth-compounding-lab' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormulaBlock
              title="Compound Interest"
              formula="A = P × (1 + r/n)^(n×t)"
              description="Calculates exponential growth where interest is earned on both initial principal and accumulated interest."
            />
            <FormulaBlock
              title="Rule of 72"
              formula="Years to Double ≈ 72 ÷ Interest Rate (%)"
              description="A quick mental math shortcut to estimate how many years it takes for an investment to double."
            />
            <FormulaBlock
              title="CAGR"
              formula="CAGR = (Ending ÷ Starting)^(1 ÷ Yrs) − 1"
              description="Compound Annual Growth Rate provides the smoothed annual rate of return over a multi-year period."
            />
          </div>
        )}

        {slug === 'statistics-risk-lab' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormulaBlock
              title="Volatility (σ)"
              formula="σ = √( Σ(x − μ)² ÷ N )"
              description="Standard deviation quantifies historical price fluctuations around the average return."
            />
            <FormulaBlock
              title="20-Day SMA"
              formula="SMA_20 = (Price_1 + ... + Price_20) ÷ 20"
              description="Smooths short-term price noise to help technical analysts identify underlying trend signals."
            />
            <FormulaBlock
              title="Correlation (r)"
              formula="r ∈ [-1.0, +1.0]"
              description="Measures how two assets move together. Low or negative correlation improves portfolio diversification."
            />
          </div>
        )}

        {slug === 'portfolio-math-lab' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormulaBlock
              title="Asset Weight (W_i)"
              formula="W_i = Asset Value_i ÷ Total Value × 100"
              description="The percentage proportion of your total portfolio allocated to a specific stock or asset."
            />
            <FormulaBlock
              title="Weighted Return"
              formula="R_p = Σ (Weight_i × Return_i)"
              description="Total portfolio return calculated by summing each asset's weighted return contribution."
            />
            <FormulaBlock
              title="Sharpe Ratio"
              formula="Sharpe = (Return − RiskFreeRate) ÷ Volatility"
              description="Measures risk-adjusted performance—higher Sharpe ratio means more return per unit of risk."
            />
          </div>
        )}
      </section>

      {/* PART 2: INTERACTIVE LAB */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest pl-1">
          <Calculator className="size-4" /> Part 2: Interactive Data Lab
        </div>

        {moduleData.interactive ? (
          slug === 'ratio-percentage-lab' ? (
            <RatioLabInteractive data={moduleData.interactive} />
          ) : slug === 'growth-compounding-lab' ? (
            <GrowthLabInteractive data={moduleData.interactive} />
          ) : slug === 'statistics-risk-lab' ? (
            <RiskLabInteractive data={moduleData.interactive} />
          ) : slug === 'portfolio-math-lab' ? (
            <PortfolioLabInteractive data={moduleData.interactive} />
          ) : null
        ) : (
          <Card className="p-8 text-center border-dashed border-border/80 bg-card/20 rounded-3xl">
            <p className="text-sm text-muted-foreground">Interactive component coming soon for this module.</p>
          </Card>
        )}
      </section>

      {/* PART 3: QUIZ GATE PROMPT CARD */}
      <section className="pt-6">
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-4" /> Final Step: Pass the Quiz Gate
            </div>
            <h3 className="text-xl font-extrabold">Ready to prove your understanding?</h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Answer 4 questions based on live data and core concepts. Score 80%+ to mark this module complete, earn +{moduleData.token_reward} bonus tokens, and unlock badge track progress!
            </p>
          </div>

          <button
            onClick={() => setOpenQuiz(true)}
            className="px-6 py-3 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition shadow-lg shadow-primary/20 shrink-0 cursor-pointer"
          >
            {isComplete ? 'Retake Quiz Gate' : 'Start Quiz Gate Now'}
          </button>
        </Card>
      </section>

      {/* Quiz Modal */}
      {openQuiz && (
        <QuizModal
          slug={slug}
          moduleTitle={moduleData.title}
          questions={moduleData.quiz || []}
          onClose={() => setOpenQuiz(false)}
          onSuccess={() => {
            loadModule()
          }}
        />
      )}
    </div>
  )
}
