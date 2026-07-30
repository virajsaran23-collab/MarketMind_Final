'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  Search, 
  ArrowRight, 
  SlidersHorizontal, 
  Sparkles, 
  HelpCircle,
  BrainCircuit,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaseStudyImage } from '@/components/marketmind/case-study-image'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function CaseStudiesPage() {
  const { t } = useLanguage()
  const { experienceLevel } = useAuth()
  const [studies, setStudies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedTag, setSelectedTag] = useState('All')

  // Prof. Algo adaptive chat panel
  const [algoOpen, setAlgoOpen] = useState(false)
  const [algoDraft, setAlgoDraft] = useState('')
  const [algoMessages, setAlgoMessages] = useState<{ role: 'algo' | 'user'; text: string }[]>([])
  const [algoLoading, setAlgoLoading] = useState(false)
  const algoScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsLoading(true)
    api.caseStudies()
      .then(setStudies)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Auto-set difficulty filter from user's experience level on first load
  useEffect(() => {
    if (experienceLevel && selectedDifficulty === 'All') {
      const diffMap: Record<string, string> = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
      }
      if (diffMap[experienceLevel]) {
        setSelectedDifficulty(diffMap[experienceLevel])
      }
    }
  }, [experienceLevel])

  // Send message to Prof. Algo
  const sendAlgoMessage = async () => {
    const text = algoDraft.trim()
    if (!text || algoLoading) return
    setAlgoDraft('')
    setAlgoMessages(prev => [...prev, { role: 'user', text }])
    setAlgoLoading(true)
    try {
      const data = await api.mentor(
        `The user is on the Case Studies page and wants advice or a custom case study topic. Their experience level is: ${experienceLevel || 'unknown'}. User message: "${text}"`,
        [],
        []
      )
      const reply = data.reply || data.summary || 'I recommend starting with a Beginner-level case study on inflation!'
      setAlgoMessages(prev => [...prev, { role: 'algo', text: reply }])
    } catch {
      setAlgoMessages(prev => [...prev, { role: 'algo', text: 'My neural link had a hiccup! Try searching for a topic in the filter above.' }])
    } finally {
      setAlgoLoading(false)
    }
  }

  // Open Prof. Algo panel with a greeting
  const openAlgoPanel = () => {
    setAlgoOpen(true)
    if (algoMessages.length === 0) {
      const greetings: Record<string, string> = {
        beginner: "Hello! 👋 I'm Prof. Algo. Since you're a Market Seedling, I suggest starting with the **2008 Financial Crisis** case study — it's beginner-friendly and very eye-opening! What topic interests you?",
        intermediate: "Hey, Market Analyst! 📊 You're ready for deeper dives. Try the **Dot-Com Bubble** or **COVID-19 Market Impact** case studies. Got a specific topic you'd like me to curate for you?",
        advanced: "Welcome back, Quant! 🧠 Your level demands precision. Explore **Black Monday 1987** or the **LTCM Collapse**. Want me to suggest a custom advanced deep-dive?",
      }
      const greeting = greetings[experienceLevel || 'beginner'] || greetings['beginner']
      setAlgoMessages([{ role: 'algo', text: greeting }])
    }
  }

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    studies.forEach(cs => {
      if (cs.tags) cs.tags.forEach((tag: string) => tags.add(tag))
    })
    return ['All', ...Array.from(tags)]
  }, [studies])

  const filteredStudies = useMemo(() => {
    return studies.filter(cs => {
      const matchesSearch = 
        cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cs.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesDifficulty = selectedDifficulty === 'All' || cs.difficulty === selectedDifficulty
      const matchesTag = selectedTag === 'All' || (cs.tags || []).includes(selectedTag)

      return matchesSearch && matchesDifficulty && matchesTag
    })
  }, [studies, searchQuery, selectedDifficulty, selectedTag])

  const featuredStudy = useMemo(() => {
    if (filteredStudies.length === 0) return null
    const aiBoom = filteredStudies.find(cs => cs.id === 'ai-boom')
    return aiBoom || filteredStudies[0]
  }, [filteredStudies])

  const gridStudies = useMemo(() => {
    if (!featuredStudy) return []
    return filteredStudies.filter(cs => cs.id !== featuredStudy.id)
  }, [filteredStudies, featuredStudy])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDifficulty('All')
    setSelectedTag('All')
  }

  const statCounts = useMemo(() => {
    return {
      total: studies.length,
      beginner: studies.filter(s => s.difficulty === 'Beginner').length,
      intermediate: studies.filter(s => s.difficulty === 'Intermediate').length,
      advanced: studies.filter(s => s.difficulty === 'Advanced').length,
    }
  }, [studies])

  const diffLabels: Record<string, string> = {
    All: t('All', 'सभी'),
    Beginner: t('Beginner', 'शुरुआती'),
    Intermediate: t('Intermediate', 'मध्यम'),
    Advanced: t('Advanced', 'उन्नत'),
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Prof. Algo Floating Panel ────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {algoOpen && (
          <div className="w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#ecfeff]/90">
              <AIBuddyPortrait size={38} speaking={algoLoading} floating={false} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-[#0891b2] uppercase tracking-wider">Prof. Algo</div>
                <div className="text-[11px] text-slate-500 font-semibold">Your Adaptive Study Guide</div>
              </div>
              <button onClick={() => setAlgoOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none font-bold">×</button>
            </div>
            {/* Messages */}
            <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto bg-white/50">
              {algoMessages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'algo' && (
                    <div className="shrink-0 mt-0.5">
                      <div className="size-6 rounded-full bg-[#00B4D8]/10 flex items-center justify-center border border-[#00B4D8]/20">
                        <BrainCircuit className="size-3.5 text-[#00B4D8]" />
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed font-medium',
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white rounded-br-sm shadow-[0_2px_4px_rgba(0,180,216,0.15)]'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-sm'
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {algoLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="shrink-0 mt-0.5">
                    <div className="size-6 rounded-full bg-[#00B4D8]/10 flex items-center justify-center border border-[#00B4D8]/20">
                      <Loader2 className="size-3 text-[#00B4D8] animate-spin" />
                    </div>
                  </div>
                  <div className="bg-slate-100 border border-slate-200/80 rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1 items-center">
                      <span className="size-1.5 rounded-full bg-[#00B4D8] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 rounded-full bg-[#00B4D8] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-1.5 rounded-full bg-[#00B4D8] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={el => { if (el) algoScrollRef.current = el }} />
            </div>
            {/* Quick suggestions */}
            <div className="px-3 pb-2.5 pt-1.5 flex flex-wrap gap-1.5 bg-white/50">
              {['Suggest a topic for me', 'What should I study first?', 'Explain market bubbles'].map(q => (
                <button
                  key={q}
                  onClick={() => { setAlgoDraft(q) }}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-[#00B4D8]/15 hover:text-[#00B4D8] hover:border-[#00B4D8]/30 transition-all font-bold cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
            {/* Input */}
            <div className="flex gap-2 px-3 pb-3 bg-white/50">
              <input
                value={algoDraft}
                onChange={e => setAlgoDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAlgoMessage()}
                placeholder="Ask Prof. Algo anything…"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#00B4D8] focus:bg-white transition-all font-medium"
              />
              <button
                onClick={sendAlgoMessage}
                disabled={algoLoading || !algoDraft.trim()}
                className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating trigger button */}
        <button
          onClick={algoOpen ? () => setAlgoOpen(false) : openAlgoPanel}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-4 py-2.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <AIBuddyPortrait size={32} speaking={false} floating={false} />
          <div className="text-left">
            <div className="text-xs font-bold text-white">Prof. Algo</div>
            <div className="text-[10px] text-cyan-100">{algoOpen ? 'Close panel' : 'Ask me anything!'}</div>
          </div>
          {algoOpen ? <ChevronDown className="size-3.5 text-white" /> : <ChevronUp className="size-3.5 text-white" />}
        </button>
      </div>

      {/* ── Experience Level Banner ───────────────────────────────── */}
      {experienceLevel && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#00B4D8]/20 bg-[#00B4D8]/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="size-4 text-[#00B4D8]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Prof. Algo has set your difficulty to&nbsp;
              <span className={cn('font-bold', {
                'text-green-600 dark:text-green-400': experienceLevel === 'beginner',
                'text-yellow-600 dark:text-yellow-400': experienceLevel === 'intermediate',
                'text-red-600 dark:text-red-400': experienceLevel === 'advanced',
              })}>
                {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
              </span>
              &nbsp;based on your onboarding assessment.
            </span>
          </div>
          <button
            onClick={() => setSelectedDifficulty('All')}
            className="ml-auto text-xs font-medium text-[#00B4D8] hover:underline"
          >
            Show all levels
          </button>
        </div>
      )}

      {/* Header section with Stats Card */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card/20 p-6 sm:p-8 backdrop-blur-sm shadow-xl mb-10">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl opacity-50" />
        
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center relative z-10">
          <div className="max-w-2xl">
            <Badge variant="default" className="mb-4 gap-1.5 px-3 py-1 font-semibold text-xs border border-primary/20">
              <Sparkles className="size-3 mr-1" /> {t('Historical Market Simulator', 'ऐतिहासिक बाज़ार सिमुलेटर')}
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('Case Studies Hub', 'केस स्टडीज़ हब')}</h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
              {t(
                'Explore key market-moving events, speculative bubbles, and central banking histories. Analyze live charts, timelines, and test your knowledge with interactive assessments.',
                'बाज़ार को प्रभावित करने वाली प्रमुख घटनाओं, सट्टा बुलबुलों और ऐतिहासिक मामलों का अन्वेषण करें।'
              )}
            </p>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="flex gap-4 shrink-0 bg-muted/40 p-4 rounded-2xl border border-border/60">
            <div className="text-center px-3 border-r border-border/80">
              <div className="text-2xl font-extrabold text-foreground">{statCounts.total}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{t('Total Lessons', 'कुल पाठ')}</div>
            </div>
            <div className="text-center px-3 border-r border-border/80">
              <div className="text-2xl font-extrabold text-green-400">{statCounts.beginner}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{t('Beginner', 'शुरुआती')}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-extrabold text-red-400">{statCounts.advanced}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{t('Advanced', 'उन्नत')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-card/40 border border-border/85 rounded-2xl p-5 mb-8 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("Search by title, topic, tags...", "शीर्षक, विषय, टैग द्वारा खोजें...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary transition-all text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold select-none">
            <SlidersHorizontal className="size-4 text-primary/70" /> {t('Filter Directory', 'फ़िल्टर निर्देशिका')}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-border/40">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">{t('Difficulty:', 'कठिनाई:')}</span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={cn(
                  "px-3 py-1 text-xs rounded-lg font-medium border transition cursor-pointer",
                  selectedDifficulty === diff 
                    ? "bg-primary border-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted"
                )}
              >
                {diffLabels[diff] || diff}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">{t('Topic:', 'विषय:')}</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-xs bg-muted/40 border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary text-muted-foreground hover:text-foreground font-medium"
            >
              {allTags.map(tag => (
                <option key={tag} value={tag} className="bg-card text-foreground">
                  {tag === 'All' ? t('All Topics', 'सभी विषय') : tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-10 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 w-40 rounded bg-muted/60" />
            <Card className="overflow-hidden border border-border bg-card/35 rounded-3xl grid grid-cols-1 lg:grid-cols-12 h-60 lg:h-96">
              <div className="lg:col-span-7 bg-muted/30 w-full h-full animate-pulse" />
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="h-4 w-16 rounded bg-muted/60 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
                  </div>
                  <div className="h-8 w-64 rounded bg-muted/60 animate-pulse" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : filteredStudies.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/80 bg-card/10 rounded-3xl max-w-xl mx-auto mt-10">
          <HelpCircle className="size-12 mx-auto text-muted-foreground/60 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-bold">{t('No Case Studies Found', 'कोई केस स्टडी नहीं मिली')}</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto leading-relaxed">
            {t("We couldn't find any lessons matching your filters. Try clearing your search query.", 'आपकी खोज के अनुसार कोई पाठ नहीं मिला। फ़िल्टर साफ़ करके देखें।')}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl transition cursor-pointer"
          >
            {t('Clear Filters', 'फ़िल्टर साफ़ करें')}
          </button>
        </Card>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-500">
          {featuredStudy && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary uppercase tracking-widest pl-1">★ {t('Featured Insight', 'विशेष पाठ')}</h2>
              <Link href={`/case-studies/${featuredStudy.id}`} className="block group">
                <Card className="overflow-hidden border border-border bg-card/35 backdrop-blur-sm shadow-xl rounded-3xl transition-all duration-300 hover:border-primary/45 hover:shadow-2xl grid grid-cols-1 lg:grid-cols-12 cursor-pointer">
                  <div className="lg:col-span-7 relative h-60 lg:h-96 w-full overflow-hidden">
                    <CaseStudyImage
                      src={featuredStudy.image}
                      alt={featuredStudy.title}
                      seed={featuredStudy.id}
                      className="absolute inset-0 w-full h-full rounded-none border-none"
                    />
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold border', DIFF_COLOR[featuredStudy.difficulty])}>
                          {diffLabels[featuredStudy.difficulty] || featuredStudy.difficulty}
                        </span>
                        {featuredStudy.completed && (
                          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/15 gap-1 text-[10px] py-0.5 px-2.5 font-bold">
                            {t('Completed', 'पूर्ण')} ({featuredStudy.completion_score?.score}/{featuredStudy.completion_score?.total_questions})
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" /> {featuredStudy.read_time}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors">
                        {featuredStudy.title}
                      </h2>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                        {featuredStudy.long_description || featuredStudy.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border/50 flex flex-wrap gap-1.5 items-center justify-between mt-4">
                      <div className="flex flex-wrap gap-1">
                        {(featuredStudy.tags || []).slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="muted" className="text-[10px] bg-muted/60">{tag}</Badge>
                        ))}
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1.5 transition-transform">
                        {t('Explore Lesson', 'पाठ देखें')} <ArrowRight className="size-4 ml-1" />
                      </span>
                    </div>

                  </div>
                </Card>
              </Link>
            </div>
          )}

          {gridStudies.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-border/60 pb-2 text-foreground/90 pl-1">
                {t('More Lessons', 'और पाठ')}
              </h3>
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {gridStudies.map((cs) => (
                  <Link key={cs.id} href={`/case-studies/${cs.id}`} className="group block">
                    <Card className="h-full overflow-hidden border border-border/70 bg-card/30 rounded-2xl transition-all duration-300 hover:border-primary/45 hover:shadow-xl hover:translate-y-[-4px] cursor-pointer flex flex-col justify-between">
                      <div>
                        <CaseStudyImage
                          src={cs.image}
                          alt={cs.title}
                          seed={cs.id}
                          className="aspect-[16/9] w-full border-none rounded-none rounded-t-2xl"
                        />
                        
                        <div className="p-5 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold border', DIFF_COLOR[cs.difficulty])}>
                              {diffLabels[cs.difficulty] || cs.difficulty}
                            </span>
                            {cs.completed && (
                              <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/15 gap-1 text-[9px] py-0.5 px-2 font-bold">
                                {t('Completed', 'पूर्ण')} ({cs.completion_score?.score}/{cs.completion_score?.total_questions})
                              </Badge>
                            )}
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="size-3" /> {cs.read_time}
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-[16px] tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                            {cs.title}
                          </h4>
                          
                          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                            {cs.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-3 border-t border-border/40 flex flex-wrap gap-1 items-center justify-between bg-muted/10 rounded-b-2xl">
                        <div className="flex flex-wrap gap-1">
                          {(cs.tags || []).slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="muted" className="text-[9px] bg-muted/80">{tag}</Badge>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                          {t('Read', 'पढ़ें')} <ArrowRight className="size-3.5 ml-0.5" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
