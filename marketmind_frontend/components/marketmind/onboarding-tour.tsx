'use client'

import { useState, useEffect, useRef } from 'react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { ChevronRight, ChevronLeft, Sparkles, Trophy } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

type TourStep = {
  targetId: string | null // null means center popup
  titleEn: string
  titleHi: string
  descEn: string
  descHi: string
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: null,
    titleEn: 'Case Study Mastered! Welcome to Trading Headquarters 🚀',
    titleHi: 'केस स्टडी पूरी! ट्रेडिंग मुख्यालय में आपका स्वागत है 🚀',
    descEn: "Bzzzt! Outstanding job completing your case study! You've unlocked the Trading Dashboard! Let me give you a quick tour on how to buy stocks and manage your portfolio!",
    descHi: 'शानदार काम! आपने केस स्टडी पूरी कर ली है और ट्रेडिंग डैशबोर्ड अनलॉक कर लिया है! आइए मैं आपको शेयर खरीदने और अपने पोर्टफोलियो को मैनेज करने का एक क्विक टूर देता हूँ!',
  },
  {
    targetId: 'tour-stats',
    titleEn: 'Your Capital & Portfolio Balance 💰',
    titleHi: 'आपकी पूंजी और पोर्टफोलियो संतुलन 💰',
    descEn: "Here is your Financial Board. You start with $10,000 in virtual cash (Cash Available)! You can use this money to buy and sell stocks in real-time, completely risk-free. Your Portfolio Value tracks your total net worth.",
    descHi: 'यहां आपका फाइनेंशियल बोर्ड है। आप $10,000 की वर्चुअल नकदी के साथ शुरुआत करते हैं! आप इस पैसे का उपयोग वास्तविक समय में शेयर खरीदने और बेचने के लिए कर सकते हैं, पूरी तरह से जोखिम-मुक्त। आपके पोर्टफोलियो का मूल्य आपकी कुल संपत्ति को ट्रैक करता है।',
  },
  {
    targetId: 'tour-stock-target',
    titleEn: 'First Stock Choice & Buying 📈',
    titleHi: 'पहला शेयर चुनाव और खरीदारी 📈',
    descEn: "I've analyzed the market and selected the perfect starter stock for you: Apple Inc. (AAPL)!\n\nWhy is it perfect? Apple has a $60B+ cash reserve, steady earnings growth, global brand equity, and lower volatility than speculative stocks. Click the 'Buy' button right here on AAPL to make your very first trade!",
    descHi: "मैंने बाज़ार का विश्लेषण किया है और आपके लिए पहला सबसे अच्छा शेयर चुना है: Apple Inc. (AAPL)!\n\nयह क्यों बेहतर है? Apple के पास $60B+ नकद भंडार, निरंतर आय वृद्धि और कम अस्थिरता है। अपना पहला व्यापार करने के लिए AAPL पर 'Buy' बटन पर क्लिक करें!",
  },
  {
    targetId: 'tour-chart-holdings',
    titleEn: 'Understanding Graph Patterns & Returns 📉📈',
    titleHi: 'ग्राफ पैटर्न और रिटर्न को समझना 📉📈',
    descEn: "Look at the Portfolio & Stock Chart! The moving line shows price trend patterns over time. An upward green slope indicates Bullish Gains, while dips highlight strategic Buying Opportunities. As stock prices fluctuate, your Return % and total portfolio value update live right here!",
    descHi: "पोर्टफोलियो और शेयर चार्ट को देखें! चलती रेखा समय के साथ मूल्य रुझान पैटर्न को दर्शाती है। एक ऊपर उठती हरी रेखा बुलिश लाभ का संकेत देती है, जबकि गिरावट रणनीतिक खरीद के अवसरों को उजागर करती है। जैसे-जैसे शेयर की कीमतें बदलती हैं, आपका रिटर्न % और कुल पोर्टफोलियो मूल्य लाइव अपडेट होता है!",
  },
  {
    targetId: 'tour-buddy',
    titleEn: 'Ask Market Buddy for Advice 💬',
    titleHi: 'मार्केट बडी से सलाह लें 💬',
    descEn: "This is the Market Buddy panel. You can ask me questions about any stock! Type 'Should I buy Apple today?' or 'What is the news?' and I will analyze live prices, headlines, and metrics to give you educational guidance!",
    descHi: "यह मार्केट बडी पैनल है। आप मुझसे किसी भी शेयर के बारे में प्रश्न पूछ सकते हैं! टाइप करें 'क्या मुझे आज Apple खरीदना चाहिए?' या 'खबरें क्या हैं?' और मैं आपको शैक्षणिक मार्गदर्शन देने के लिए लाइव कीमतों, सुर्खियों और मेट्रिक्स का विश्लेषण करूंगा!",
  },
  {
    targetId: null,
    titleEn: "Let's Build Your Portfolio! 🚀",
    titleHi: 'आइए अपना पोर्टफोलियो बनाएं! 🚀',
    descEn: "Now it's your turn! Buy your first 5-6 stocks to build a strong, diversified portfolio. Once you own 3+ stock positions, you unlock the Predictor Game! Happy trading! 🧠💼",
    descHi: 'अब आपकी बारी है! एक मजबूत, विविध पोर्टफोलियो बनाने के लिए अपने पहले 5-6 शेयर खरीदें। एक बार जब आपके पास 3+ शेयर पोजीशन हो जाएंगे, तो आप प्रिडिक्टर गेम अनलॉक कर लेंगे!',
  },
]

const POST_CASE_STUDY_STEPS: TourStep[] = [
  {
    targetId: null,
    titleEn: 'Case Study Mastered! Back to Markets 🚀',
    titleHi: 'केस स्टडी पूरी हुई! बाज़ार में वापस 🚀',
    descEn: "Bzzzt! Outstanding work completing your case study! You've earned XP and deepened your market wisdom. Now, let's put your learning into action by adding a powerful new stock to your portfolio!",
    descHi: 'शानदार काम! आपने अपनी केस स्टडी पूरी कर ली है! आपने XP अर्जित किया है और अपनी बाज़ार की समझ को गहरा किया है। अब, अपने पोर्टफोलियो में एक नया शेयर जोड़कर अपनी सीख को लागू करें!',
  },
  {
    targetId: 'tour-stock-target',
    titleEn: 'Post-Lesson Stock Recommendation 💻',
    titleHi: 'पाठ के बाद शेयर सिफारिश 💻',
    descEn: "Based on your case study completion, I recommend expanding your portfolio! Pick any top market stock from the grid below and click 'Buy' to expand your holdings!",
    descHi: "आपकी केस स्टडी पूरी होने के आधार पर, मैं अपने पोर्टफोलियो का विस्तार करने की सलाह देता हूं! नीचे दिए गए ग्रिड से कोई भी शेयर चुनें और अपनी होल्डिंग्स में जोड़ने के लिए 'Buy' पर क्लिक करें!",
  },
  {
    targetId: 'tour-chart-holdings',
    titleEn: 'Track Your Expanded Portfolio 📈',
    titleHi: 'अपने विस्तारित पोर्टफोलियो को ट्रैक करें 📈',
    descEn: "Watch your new stock position appear under Your Holdings and track your total portfolio growth on the live chart!",
    descHi: "अपनी नई शेयर स्थिति को अपनी होल्डिंग्स के तहत दिखाई देते हुए देखें और लाइव चार्ट पर अपने कुल पोर्टफोलियो लाभ को ट्रैक करें!",
  },
]

export function OnboardingTour({
  onClose,
  mode = 'onboarding',
}: {
  onClose: () => void
  mode?: 'onboarding' | 'post-case-study'
}) {
  const { language } = useLanguage()
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const textIndex = useRef(0)

  const activeSteps = mode === 'post-case-study' ? POST_CASE_STUDY_STEPS : TOUR_STEPS
  const currentStep = activeSteps[step] || activeSteps[0]
  const targetId = currentStep.targetId

  const title = language === 'hi' ? currentStep.titleHi : currentStep.titleEn
  const fullText = language === 'hi' ? currentStep.descHi : currentStep.descEn

  const resolveTargetElement = (id: string | null): HTMLElement | null => {
    if (!id) return null
    if (id === 'tour-stock-target' || id === 'tour-stock-MSFT') {
      return (
        document.querySelector('[id^="tour-stock-"]') as HTMLElement | null
      )
    }
    return document.getElementById(id)
  }

  // Scroll target element into view if needed
  useEffect(() => {
    if (targetId) {
      const el = resolveTargetElement(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [targetId, step])

  // Track target element coordinates dynamically
  useEffect(() => {
    if (!targetId) {
      setTargetRect(null)
      return
    }

    const updateCoordinates = () => {
      const el = resolveTargetElement(targetId)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      }
    }

    updateCoordinates()

    window.addEventListener('resize', updateCoordinates)
    window.addEventListener('scroll', updateCoordinates, { capture: true })

    const intervalId = setInterval(updateCoordinates, 200)

    return () => {
      window.removeEventListener('resize', updateCoordinates)
      window.removeEventListener('scroll', updateCoordinates, { capture: true })
      clearInterval(intervalId)
    }
  }, [targetId])

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('')
    setTypingDone(false)
    textIndex.current = 0

    if (typeTimer.current) clearInterval(typeTimer.current)

    typeTimer.current = setInterval(() => {
      textIndex.current += 1
      setDisplayedText(fullText.slice(0, textIndex.current))

      if (textIndex.current >= fullText.length) {
        if (typeTimer.current) clearInterval(typeTimer.current)
        setTypingDone(true)
      }
    }, 15)

    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current)
    }
  }, [fullText])

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  // Calculate polygon clip path coordinates
  const clipPathStyle = targetRect
    ? {
        clipPath: `polygon(
          0% 0%,
          0% 100%,
          ${targetRect.left - 6}px 100%,
          ${targetRect.left - 6}px ${targetRect.top - 6}px,
          ${targetRect.right + 6}px ${targetRect.top - 6}px,
          ${targetRect.right + 6}px ${targetRect.bottom + 6}px,
          ${targetRect.left - 6}px ${targetRect.bottom + 6}px,
          ${targetRect.left - 6}px 100%,
          100% 100%,
          100% 0%
        )`,
      }
    : undefined

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden select-none">
      <style>{`
        .tour-bubble {
          border: 4px solid #0F172A;
          box-shadow: 8px 8px 0px 0px rgba(15,23,42,0.15);
        }
        .tour-btn {
          border: 2px solid #0F172A;
          box-shadow: 2px 2px 0px 0px #0F172A;
          transition: all 0.1s ease;
        }
        .tour-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px 0px #0F172A;
        }
        .tour-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px 0px #0F172A;
        }
        @keyframes spotlight-pulse {
          0%, 100% { border-color: #00B4D8; box-shadow: 0 0 12px rgba(0, 180, 216, 0.7); }
          50% { border-color: #00e5ff; box-shadow: 0 0 24px rgba(0, 229, 255, 1); }
        }
        .spotlight-glowing {
          animation: spotlight-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* Dim Overlay with Spotlight Clip Path */}
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-all duration-300",
          targetRect ? "pointer-events-none" : "pointer-events-auto"
        )}
        style={clipPathStyle}
        onClick={handleSkip}
      />

      {/* Spotlight glowing border box over the target */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[95] rounded-2xl border-4 spotlight-glowing transition-all duration-200"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          {targetId === 'tour-stock-target' && (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[#00E5FF] text-slate-900 px-3.5 py-1 rounded-full text-xs font-black border-2 border-[#0F172A] shadow-lg animate-bounce flex items-center gap-1.5 shrink-0 whitespace-nowrap z-[96]">
              <span>👇 Click 'Buy' on Any Stock Here!</span>
            </div>
          )}
        </div>
      )}

      {/* Mentor Dialogue Panel at the bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl bg-white rounded-3xl p-5 md:p-6 z-[100] tour-bubble flex flex-col md:flex-row items-center gap-5 md:gap-7 animate-in slide-in-from-bottom duration-300">
        
        {/* Prof. Algo portrait avatar */}
        <div className="shrink-0 flex flex-col items-center justify-center relative">
          <div className="absolute bottom-1 w-24 h-4 bg-[#00B4D8]/20 border border-dashed border-[#00B4D8] rounded-full blur-[1px] animate-pulse" />
          <AIBuddyPortrait
            size={90}
            speaking={!typingDone}
            floating={true}
            className="drop-shadow-[0_4px_10px_rgba(0,180,216,0.35)]"
          />
          <div className="mt-1 bg-[#00B4D8] text-white border border-[#0F172A] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-[1px_1px_0px_0px_#0F172A]">
            Prof. Algo
          </div>
        </div>

        {/* Content & Navigation controls */}
        <div className="flex-1 w-full flex flex-col justify-between h-full">
          <div>
            {/* Header / Title */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 mb-2">
              <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="size-4 text-[#00B4D8] fill-cyan-100 animate-spin" style={{ animationDuration: '6s' }} />
                {title}
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                {step + 1} / {TOUR_STEPS.length}
              </span>
            </div>

            {/* Typewritten description */}
            <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed min-h-[4.5rem] whitespace-pre-line">
              {displayedText}
              {!typingDone && (
                <span className="inline-block w-1.5 h-4 bg-[#00B4D8] ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs font-extrabold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider px-2 py-1"
            >
              {language === 'hi' ? 'à¤›à¥‹à¤¡à¤¼à¥‡à¤‚' : 'Skip Tour'}
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs px-3.5 py-2 rounded-xl tour-btn cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                  {language === 'hi' ? 'à¤ªà¥€à¤›à¥‡' : 'Back'}
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1 bg-[#00E5FF] hover:bg-[#00B4D8] text-slate-900 font-black text-xs px-4 py-2 rounded-xl tour-btn cursor-pointer"
              >
                {step === TOUR_STEPS.length - 1 ? (
                  <>
                    <Trophy className="size-3.5 fill-yellow-100" />
                    {language === 'hi' ? 'à¤¶à¥�à¤°à¥‚ à¤•à¤°à¥‡à¤‚!' : 'Get Started!'}
                  </>
                ) : (
                  <>
                    {language === 'hi' ? 'à¤†à¤—à¥‡' : 'Next'}
                    <ChevronRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
