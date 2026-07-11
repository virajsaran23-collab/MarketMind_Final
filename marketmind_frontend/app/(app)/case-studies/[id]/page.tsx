'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  ChevronRight, 
  TrendingUp, 
  Info,
  BookOpen
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CaseStudyImage } from '@/components/marketmind/case-study-image'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth, checkChallengeCompletions } from '@/lib/auth-context'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400',
  Intermediate: 'bg-yellow-500/15 text-yellow-400',
  Advanced: 'bg-red-500/15 text-red-400',
}

interface TimelineItem {
  date: string
  event: string
  description: string
}

interface StatItem {
  label: string
  value: string
}

interface ChartPoint {
  date: string
  value: number
}

interface QuizQuestion {
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface CaseStudyDetails {
  id: string
  title: string
  description: string
  long_description: string
  difficulty: string
  read_time: string
  image: string
  tags: string[]
  timeline?: TimelineItem[]
  stats?: StatItem[]
  lessons?: string[]
  chart_data?: ChartPoint[]
  quiz?: QuizQuestion[]
}

export default function CaseStudyPage() {
  const { id } = useParams<{ id: string }>()
  const { refresh: refreshAuth, showToast } = useAuth()
  const [cs, setCs] = useState<CaseStudyDetails | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz'>('overview')
  
  // Quiz state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  useEffect(() => {
    if (id) {
      api.caseStudy(id)
        .then((data) => {
          setCs(data as CaseStudyDetails)
        })
        .catch(() => {})
    }
  }, [id])

  if (!cs) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground animate-pulse">
        Loading case study details...
      </div>
    )
  }

  // Helper function to format chart values based on case study type
  const formatChartValue = (val: number) => {
    if (cs.id === 'rate-hikes') {
      return `${val.toFixed(2)}%`
    }
    if (cs.id === 'tulip-mania') {
      return `${val.toLocaleString()} guilders`
    }
    if (['russia-ukraine', 'precious-metals-history', 'history-of-currencies'].includes(cs.id)) {
      return `$${val.toLocaleString()}`
    }
    return val.toLocaleString()
  }

  // Get dynamic chart stroke & fill colors based on ID
  const getChartColors = () => {
    switch (cs.id) {
      case 'ai-boom':
        return { stroke: '#10B981', fill: '#10B981' } // Emerald green
      case 'russia-ukraine':
        return { stroke: '#F97316', fill: '#F97316' } // Orange
      case 'covid-crash':
        return { stroke: '#EF4444', fill: '#EF4444' } // Red
      case 'precious-metals-history':
      case 'history-of-currencies':
        return { stroke: '#EAB308', fill: '#EAB308' } // Amber Gold
      default:
        return { stroke: '#6366F1', fill: '#6366F1' } // Indigo default
    }
  }

  const chartColors = getChartColors()

  // Handle quiz answer selection
  const handleSelectOption = (option: string) => {
    if (isSubmitted) return
    setSelectedOption(option)
  }

  // Handle quiz submission
  const handleCheckAnswer = () => {
    if (!selectedOption || !cs.quiz || isSubmitted) return
    
    const correct = selectedOption === cs.quiz[currentQuestionIdx].answer
    if (correct) {
      setScore((prev) => prev + 1)
    }
    setIsSubmitted(true)
  }

  // Handle quiz next question
  const handleNextQuestion = () => {
    if (!cs.quiz) return
    
    const nextIdx = currentQuestionIdx + 1
    if (nextIdx < cs.quiz.length) {
      setCurrentQuestionIdx(nextIdx)
      setSelectedOption(null)
      setIsSubmitted(false)
    } else {
      setQuizFinished(true)
      api.completeSimulation(score * 100).then((res) => {
        if (res.challenges) {
          checkChallengeCompletions(res.challenges, showToast)
        }
        refreshAuth()
      }).catch(() => {})
    }
  }

  // Reset quiz
  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0)
    setSelectedOption(null)
    setIsSubmitted(false)
    setScore(0)
    setQuizFinished(false)
  }

  const currentQuestion = cs.quiz && cs.quiz[currentQuestionIdx]
  const quizLength = cs.quiz ? cs.quiz.length : 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <Link href="/case-studies" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-6 gap-2 hover:bg-muted text-muted-foreground hover:text-foreground')}>
        <ArrowLeft className="size-4" /> Back to Case Studies
      </Link>

      {/* Header Info */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFF_COLOR[cs.difficulty]}`}>
            {cs.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            <Clock className="size-3" /> {cs.read_time} read
          </span>
          {(cs.tags || []).map((t: string) => (
            <Badge key={t} variant="outline" className="text-xs border-border/80">
              {t}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{cs.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl">{cs.description}</p>
      </div>

      {/* Main Grid: Desktop side-by-side, mobile stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Main content area (Chart, Tabs, Lessons, Quiz) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed Chart Card */}
          {cs.chart_data && cs.chart_data.length > 0 && (
            <Card className="p-6 bg-card/45 border-border backdrop-blur-sm shadow-xl animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Historical Asset & Market Performance</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {cs.id === 'rate-hikes' ? 'Interest Rate Level' : 'Market Index / Commodity Price'}
                </span>
              </div>
              
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cs.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.fill} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={chartColors.fill} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => cs.id === 'rate-hikes' ? `${v}%` : `$${v.toLocaleString()}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const point = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                              <p className="text-xs text-muted-foreground font-medium mb-1">{point.date}</p>
                              <p className="text-base font-bold tabular-nums" style={{ color: chartColors.stroke }}>
                                {formatChartValue(point.value)}
                              </p>
                              {point.event && (
                                <p className="mt-2 text-xs border-t border-border/80 pt-1 text-primary-foreground font-semibold">
                                  ★ {point.event}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColors.stroke}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#chartFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed flex gap-1.5 items-start">
                <Info className="size-3.5 shrink-0 text-muted-foreground/80 mt-0.5" />
                This chart illustrates the key market moves during the period. Hover over data points to see date and value parameters.
              </p>
            </Card>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-5 py-3 text-sm font-semibold border-b-2 -mb-[2px] transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'overview'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="size-4" /> Overview & Key Takeaways
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={cn(
                'px-5 py-3 text-sm font-semibold border-b-2 -mb-[2px] transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'quiz'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Trophy className="size-4" /> Test Your Knowledge
            </button>
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Detailed Long Description */}
              <div className="bg-card/30 rounded-xl p-6 border border-border/50">
                <h3 className="text-lg font-bold mb-3">Case Analysis</h3>
                <p className="leading-relaxed text-muted-foreground text-[15px] whitespace-pre-line">
                  {cs.long_description}
                </p>
              </div>

              {/* Key Lessons Section */}
              {cs.lessons && cs.lessons.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Lightbulb className="size-5 text-yellow-500" />
                    Crucial Market Lessons
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {cs.lessons.map((lesson, idx) => (
                      <div 
                        key={idx} 
                        className="flex gap-4 p-5 rounded-xl border border-border/60 bg-gradient-to-r from-card to-card/50 hover:border-border/100 transition"
                      >
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="text-[14.5px] leading-relaxed text-foreground/90 font-medium font-sans">
                            {lesson}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Interactive Quiz */}
          {activeTab === 'quiz' && (
            <div className="bg-card/45 border-border backdrop-blur-sm p-6 rounded-2xl shadow-xl border animate-in fade-in duration-300">
              {!cs.quiz || cs.quiz.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No quiz questions currently configured for this case study.
                </div>
              ) : quizFinished ? (
                /* Quiz Finished State */
                <div className="text-center py-8 space-y-5 animate-in zoom-in duration-300">
                  <div className="mx-auto w-16 h-16 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center">
                    <Trophy className="size-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Congratulations on testing your learning! You scored <span className="font-semibold text-foreground">{score}</span> out of <span className="font-semibold text-foreground">{quizLength}</span>.
                    </p>
                  </div>
                  
                  {/* Score Indicator */}
                  <div className="text-4xl font-extrabold text-primary tabular-nums">
                    {Math.round((score / quizLength) * 100)}%
                  </div>

                  <p className="text-sm italic text-muted-foreground/80">
                    {score === quizLength 
                      ? "Perfect! You've completely mastered this case study!" 
                      : "Great effort! Review the takeaways and try again to secure a perfect score."}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleResetQuiz}
                      className={cn(buttonVariants({ variant: 'default' }), 'px-6 py-2 cursor-pointer')}
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ) : (
                /* Question Render State */
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Case Study Quiz</h4>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Question {currentQuestionIdx + 1} of {quizLength}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-[17px] font-semibold text-foreground/95 leading-snug">
                    {currentQuestion?.question}
                  </h3>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    {currentQuestion?.options.map((option, idx) => {
                      const isSelected = selectedOption === option
                      const isCorrect = option === currentQuestion.answer
                      
                      let optionStyle = 'border-border bg-card/30 text-foreground/80 hover:bg-muted hover:border-border/100'
                      let Icon = null

                      if (isSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'border-green-500/50 bg-green-500/10 text-green-400 font-medium'
                          Icon = <CheckCircle className="size-4 shrink-0 text-green-500" />
                        } else if (isSelected) {
                          optionStyle = 'border-red-500/50 bg-red-500/10 text-red-400 font-medium'
                          Icon = <XCircle className="size-4 shrink-0 text-red-500" />
                        } else {
                          optionStyle = 'border-border/40 bg-card/10 text-muted-foreground/60 cursor-not-allowed'
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-primary bg-primary/10 text-primary font-medium'
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(option)}
                          className={cn(
                            'flex items-center justify-between w-full p-4 border text-left rounded-xl transition cursor-pointer text-sm',
                            optionStyle
                          )}
                        >
                          <span>{option}</span>
                          {Icon}
                        </button>
                      )
                    })}
                  </div>

                  {/* Explanation panel shows after submitting */}
                  {isSubmitted && currentQuestion && (
                    <div className="p-4 bg-muted/40 rounded-xl border border-border/80 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-bottom-3 duration-300">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                        <Lightbulb className="size-4 text-yellow-500" /> Explanation
                      </div>
                      {currentQuestion.explanation}
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="flex justify-end pt-3 border-t border-border/60">
                    {!isSubmitted ? (
                      <button
                        onClick={handleCheckAnswer}
                        disabled={!selectedOption}
                        className={cn(buttonVariants({ variant: 'default' }), 'px-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed')}
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className={cn(buttonVariants({ variant: 'default' }), 'gap-2 px-5 cursor-pointer')}
                      >
                        {currentQuestionIdx + 1 === quizLength ? 'Finish Quiz' : 'Next Question'}
                        <ChevronRight className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Sidebar (Key Statistics & Event Timeline) */}
        <div className="space-y-6">
          
          {/* Key Statistics Card */}
          {cs.stats && cs.stats.length > 0 && (
            <Card className="p-5 bg-card/45 border-border backdrop-blur-sm shadow-xl">
              <h3 className="font-bold text-base border-b border-border/60 pb-3 mb-4 flex items-center gap-2">
                <TrendingUp className="size-4.5 text-primary" /> Key Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {cs.stats.map((stat, idx) => (
                  <div key={idx} className="bg-muted/30 p-3 rounded-lg border border-border/40">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-semibold mb-0.5">{stat.label}</p>
                    <p className="text-base font-bold text-foreground tabular-nums">{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Timeline Card */}
          {cs.timeline && cs.timeline.length > 0 && (
            <Card className="p-5 bg-card/45 border-border backdrop-blur-sm shadow-xl">
              <h3 className="font-bold text-base border-b border-border/60 pb-3 mb-4 flex items-center gap-2">
                <Clock className="size-4.5 text-primary" /> Event Timeline
              </h3>
              
              <div className="relative pl-4 border-l border-border/80 space-y-6 ml-2">
                {cs.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border border-primary bg-background shrink-0" />
                    
                    {/* Timeline Item Content */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                        {item.date}
                      </span>
                      <h4 className="text-xs font-bold text-foreground pt-1">{item.event}</h4>
                      <p className="text-[11px] leading-relaxed text-muted-foreground/90">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>
    </div>
  )
}
