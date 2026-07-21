'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Brain, Gauge, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/marketmind/stat-card'
import { ProgressRing } from '@/components/marketmind/progress-ring'
import { RiskMeter } from '@/components/marketmind/risk-meter'
import { PerformanceCompareChart, SectorPreferenceChart } from '@/components/marketmind/analytics-charts'
import { useLanguage } from '@/lib/language-context'
import { api } from '@/lib/api'

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.analytics().then(setData).catch(() => {})
  }, [])

  const stats = data || {
    simulations_completed: 0,
    learning_score: 0,
    risk_score: 50,
    best_decision: { label: '—', value: '0%' },
    worst_decision: { label: '—', value: '0%' },
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{t('Your learning analytics', 'आपके सीखने के विश्लेषण')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('Insights into how your decisions stack up against the market.', 'बाज़ार के मुक़ाबले आपके निर्णयों का विस्तृत विश्लेषण।')}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('Simulations completed', 'पूर्ण सिमुलेशन')} value={String(stats.simulations_completed)} icon={Trophy} />
        <StatCard label={t('Learning score', 'सीखने का स्कोर')} value={stats.learning_score.toLocaleString()} icon={Brain} />
        <StatCard label={t('Best decision', 'सर्वश्रेष्ठ निर्णय')} value={stats.best_decision.value} hint={stats.best_decision.label} accent="success" icon={TrendingUp} />
        <StatCard label={t('Worst decision', 'सबसे खराब निर्णय')} value={stats.worst_decision.value} hint={stats.worst_decision.label} accent="danger" icon={TrendingDown} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t('Performance vs. market', 'प्रदर्शन बनाम बाज़ार')}</CardTitle></CardHeader>
          <CardContent><PerformanceCompareChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('Risk profile', 'जोखिम प्रोफ़ाइल')}</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-4">
            <ProgressRing value={stats.risk_score} sublabel={t('Risk score', 'जोखिम स्कोर')} />
            <RiskMeter value={stats.risk_score} />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="size-4" />
              {t('Balanced risk appetite with measured aggression.', 'मापे गए आक्रामकता के साथ संतुलित जोखिम क्षमता।')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('Sector preference', 'क्षेत्र प्राथमिकता')}</CardTitle></CardHeader>
          <CardContent><SectorPreferenceChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('What this means', 'इसका क्या अर्थ है')}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{t('You tend to allocate heavily toward technology, which boosts returns in growth regimes but increases drawdowns during rate shocks.', 'आप तकनीक की ओर अधिक आवंटन करते हैं, जो विकास काल में रिटर्न बढ़ाता है पर दर झटकों के दौरान गिरावट बढ़ाता है।')}</p>
            <p>{t('Your strongest edge is reacting early to geopolitical events, where you outperformed the simulated market by a wide margin.', 'आपकी सबसे बड़ी ताकत भू-राजनीतिक घटनाओं पर जल्दी प्रतिक्रिया देना है, जहाँ आपने सिमुलेटेड बाज़ार से बेहतर प्रदर्शन किया।')}</p>
            <p>{t('Consider diversifying into defensive sectors to smooth volatility and lift your risk-adjusted score.', 'अस्थिरता को कम करने और अपने जोखिम-समायोजित स्कोर को बढ़ाने के लिए रक्षात्मक क्षेत्रों में विविधता लाने पर विचार करें।')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
