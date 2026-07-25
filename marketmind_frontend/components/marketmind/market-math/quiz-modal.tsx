'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface QuizQuestion {
  id: string
  type: string
  question: string
  options: string[]
  explanation: string
}

interface QuizModalProps {
  slug: string
  moduleTitle: string
  questions: QuizQuestion[]
  onClose: () => void
  onSuccess?: () => void
}

export default function QuizModal({
  slug,
  moduleTitle,
  questions,
  onClose,
  onSuccess,
}: QuizModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSelect = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(selectedAnswers).length < questions.length) {
      setErrorMsg('Please answer all questions before submitting.')
      return
    }
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const res = await api.submitMathQuiz(slug, selectedAnswers)
      setResult(res)
      if (res.passed && onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to grade quiz.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setSelectedAnswers({})
    setErrorMsg(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <Badge variant="outline" className="mb-1 text-[10px] uppercase font-bold tracking-wider text-primary border-primary/20">
              Quiz Gate • {moduleTitle}
            </Badge>
            <h3 className="text-xl font-extrabold tracking-tight">Interactive Knowledge Gate</h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 font-medium">
            <XCircle className="size-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Quiz Form */}
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="bg-muted/20 p-5 rounded-2xl border border-border/50 space-y-3">
                  <div className="flex gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-extrabold">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-bold text-foreground leading-relaxed">{q.question}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                    {q.options.map((opt) => {
                      const isChecked = selectedAnswers[q.id] === opt
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleSelect(q.id, opt)}
                          className={cn(
                            'p-3 text-xs rounded-xl font-medium border text-left transition cursor-pointer flex items-center justify-between',
                            isChecked
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm'
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <span>{opt}</span>
                          {isChecked && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Grading Answers...' : 'Submit Quiz'}
              </button>
            </div>
          </form>
        ) : (
          /* Results View */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Banner */}
            <div
              className={cn(
                'p-6 rounded-2xl text-center space-y-2 border',
                result.passed
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              )}
            >
              <div className="flex justify-center mb-1">
                {result.passed ? <Award className="size-12" /> : <XCircle className="size-12" />}
              </div>
              <h4 className="text-2xl font-extrabold">
                {result.passed ? 'Module Completed! 🎉' : 'Quiz Not Passed'}
              </h4>
              <p className="text-xs text-muted-foreground">
                You scored <span className="font-bold text-foreground">{result.score}</span> / {result.total} (
                {Math.round((result.score / result.total) * 100)}%). Minimum required to pass is 80%.
              </p>
              {result.token_reward > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-extrabold mt-2">
                  <Sparkles className="size-4" /> +{result.token_reward} Bonus Tokens Earned!
                </div>
              )}
            </div>

            {/* Question Breakdown */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Detailed Feedback</h5>
              {(result.results || []).map((res: any, idx: number) => (
                <div
                  key={res.id || idx}
                  className={cn(
                    'p-4 rounded-xl border text-xs space-y-1',
                    res.correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                  )}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {res.correct ? <CheckCircle2 className="size-4 text-green-400" /> : <XCircle className="size-4 text-red-400" />}
                      Question {idx + 1}
                    </span>
                    <span className={res.correct ? 'text-green-400' : 'text-red-400'}>
                      {res.correct ? 'Correct' : `Expected: ${res.expected}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground pt-1 leading-relaxed">{res.explanation}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              {!result.passed ? (
                <button
                  onClick={handleRetry}
                  className="px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="size-4" /> Try Again
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  Done <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
