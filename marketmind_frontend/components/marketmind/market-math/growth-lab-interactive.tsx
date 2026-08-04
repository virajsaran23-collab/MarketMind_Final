'use client'

import React, { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  Info,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GrowthLabInteractiveProps {
  data: {
    initial_principal: number
    default_rate: number
    default_years: number
    default_monthly: number
    user_portfolio_return: number
    user_portfolio_start: number
    user_portfolio_current: number
    rule_of_72_examples: Array<{ rate: number; years_to_double: number }>
  }
}

export function GrowthLabInteractive({ data }: GrowthLabInteractiveProps) {
  const [principal, setPrincipal] = useState<number>(data.initial_principal || 10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(data.default_monthly || 200)
  const [interestRate, setInterestRate] = useState<number>(data.default_rate || 8.0)
  const [years, setYears] = useState<number>(data.default_years || 10)
  const [rule72Rate, setRule72Rate] = useState<number>(8.0)

  // Build compound vs. simple chart data
  const chartData = []
  let compoundBalance = principal
  let simpleBalance = principal
  const monthlyRate = interestRate / 100 / 12

  for (let yr = 0; yr <= years; yr++) {
    chartData.push({
      year: `Yr ${yr}`,
      'With Compounding': Math.round(compoundBalance),
      'Simple Deposits Only': Math.round(simpleBalance),
    })
    for (let m = 0; m < 12; m++) {
      compoundBalance = (compoundBalance + monthlyContribution) * (1 + monthlyRate)
      simpleBalance += monthlyContribution
    }
  }

  const finalCompound = chartData[chartData.length - 1]?.['With Compounding'] || principal
  const totalContributions = principal + monthlyContribution * 12 * years
  const compoundInterestEarned = Math.max(0, finalCompound - totalContributions)
  const yearsToDouble = (72 / rule72Rate).toFixed(1)

  return (
    <div className="space-y-8">

      {/* ======= LAB 1: COMPOUND INTEREST ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">1. Compound Interest Visualizer</h3>
            <p className="text-xs text-muted-foreground">See the power of compounding vs just saving flat.</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="mb-6 p-4 bg-green-500/8 border border-green-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-green-400 flex items-center gap-1.5"><Info className="size-3.5" /> What is Compound Interest?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">Formula: A = P × (1 + r/n)^(n×t)</span>
          </p>
          <p className="text-muted-foreground">
            Simple interest only earns interest on your original deposit. <em>Compound interest</em> earns interest on your interest too — so your money grows
            faster and faster every year. The longer you wait, the bigger the difference becomes.
          </p>
          <div className="flex items-start gap-2 pt-1">
            <ArrowRight className="size-3 mt-0.5 text-green-400 shrink-0" />
            <span className="text-foreground/80">Think of it like a snowball rolling downhill — it gets bigger and bigger as it picks up more snow (interest).</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5 bg-muted/20 p-5 rounded-2xl border border-border/60 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span>Starting Amount:</span>
                <span className="text-primary font-mono">${principal.toLocaleString()}</span>
              </div>
              <input type="range" min={1000} max={100000} step={1000} value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>$1K</span><span>$100K</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span>Monthly Contribution:</span>
                <span className="text-primary font-mono">${monthlyContribution}/mo</span>
              </div>
              <input type="range" min={0} max={2000} step={50} value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>$0/mo</span><span>$2000/mo</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span>Annual Interest Rate:</span>
                <span className="text-green-400 font-mono">{interestRate}%</span>
              </div>
              <input type="range" min={1.0} max={20.0} step={0.5} value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>1%</span><span>20%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span>Time Period:</span>
                <span className="text-blue-400 font-mono">{years} Years</span>
              </div>
              <input type="range" min={1} max={30} step={1} value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>1 yr</span><span>30 yrs</span>
              </div>
            </div>

            {/* Results summary */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2.5 pt-3">
              <div className="font-bold text-primary flex items-center gap-1.5"><Sparkles className="size-4" /> After {years} Years</div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total deposited:</span>
                  <span className="font-bold text-foreground font-mono">${totalContributions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest earned:</span>
                  <span className="font-bold text-green-400 font-mono">+${compoundInterestEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-primary/20 pt-1.5">
                  <span className="font-bold">Total Value:</span>
                  <span className="text-primary text-base font-extrabold font-mono">${finalCompound.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                💡 Of your total value, <strong className="text-green-400">${compoundInterestEarned.toLocaleString()}</strong> was earned purely from compounding — not from any extra deposits!
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Growth Over Time</h4>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-green-400" /> Compounding</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-blue-400 border-dashed border border-blue-400" /> Deposits Only</span>
              </div>
            </div>
            <div className="h-72 w-full bg-muted/10 p-4 rounded-2xl border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="year" stroke="#888888" fontSize={11} tickLine={false} interval="preserveStartEnd" />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                    formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, String(name ?? '')]}
                  />
                  <Line type="monotone" dataKey="With Compounding" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Simple Deposits Only" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              The gap between the green and blue lines is <strong className="text-green-400">pure compound interest</strong> — money you earned without lifting a finger.
            </p>
          </div>
        </div>
      </Card>

      {/* ======= LAB 2: RULE OF 72 ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Zap className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">2. The Rule of 72 — Mental Math Shortcut</h3>
            <p className="text-xs text-muted-foreground">How long until your money doubles? Use this quick trick.</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="mb-6 p-4 bg-blue-500/8 border border-blue-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-blue-400 flex items-center gap-1.5"><Info className="size-3.5" /> The Rule of 72</div>
          <p className="text-foreground/80">
            <span className="font-semibold">Years to Double ≈ 72 ÷ Annual Return Rate (%)</span>
          </p>
          <p className="text-muted-foreground">
            Instead of complex math, investors use this shortcut to quickly estimate how long an investment takes to double.
            It's not perfectly precise, but it's extremely useful for quick mental calculations.
          </p>
          <div className="space-y-0.5 pt-1">
            <div className="flex items-center gap-2"><ArrowRight className="size-3 text-blue-400 shrink-0" /><span className="text-foreground/80">At <strong>8%/yr</strong>: 72 ÷ 8 = <strong>9 years</strong> to double</span></div>
            <div className="flex items-center gap-2"><ArrowRight className="size-3 text-blue-400 shrink-0" /><span className="text-foreground/80">At <strong>12%/yr</strong>: 72 ÷ 12 = <strong>6 years</strong> to double</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/60">
            <div className="flex justify-between text-xs font-bold">
              <span>Your Annual Return Rate:</span>
              <span className="text-blue-400 text-sm font-mono">{rule72Rate}%</span>
            </div>
            <input type="range" min={1.0} max={24.0} step={0.5} value={rule72Rate}
              onChange={(e) => setRule72Rate(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer h-2 bg-muted rounded-lg" />
            <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center space-y-2">
              <div className="text-xs text-muted-foreground">Time for your money to double:</div>
              <div className="text-5xl font-extrabold text-blue-400 font-mono">{yearsToDouble}</div>
              <div className="text-sm text-blue-300 font-semibold">Years</div>
              <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-2 mt-1">
                72 ÷ {rule72Rate}% = <strong className="text-blue-400">{yearsToDouble} years</strong>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {Number(yearsToDouble) <= 6 ? '🚀 Wow — very high growth rate!' :
               Number(yearsToDouble) <= 10 ? '📈 Strong return — above historical average' :
               Number(yearsToDouble) <= 14 ? '✅ Solid — around S&P 500 historical average' :
               '📊 Conservative — typical for bonds or savings accounts'}
            </p>
          </div>

          <div className="md:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Reference Table</h4>
            <div className="grid grid-cols-2 gap-3">
              {(data.rule_of_72_examples || []).map((ex) => (
                <div key={ex.rate} className="p-3 bg-muted/30 rounded-xl border border-border/40 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-foreground">{ex.rate}% per year</span>
                    <span className="text-[10px] text-muted-foreground block">72 ÷ {ex.rate} = {ex.years_to_double}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-primary border-primary/20">
                    {ex.years_to_double} Yrs
                  </Badge>
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/20 rounded-xl border border-border/40 text-xs text-muted-foreground">
              💡 <strong className="text-foreground">Real world example:</strong> The S&P 500 has historically returned ~10%/yr.
              At that rate, 72 ÷ 10 = <strong className="text-foreground">7.2 years</strong> to double your money.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
