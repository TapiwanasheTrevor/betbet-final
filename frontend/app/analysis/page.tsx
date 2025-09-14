import { AnalysisDashboard } from "@/components/analysis/analysis-dashboard"
import { AIAssistant } from "@/components/analysis/ai-assistant"
import { PickTracker } from "@/components/analysis/pick-tracker"
import { ExpertProfiles } from "@/components/analysis/expert-profiles"

export default function AnalysisPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Expert Analysis Suite</h1>
        <p className="text-muted-foreground text-lg">AI-powered data analysis, expert picks, and monetization tools</p>
      </div>

      <AnalysisDashboard />
      <AIAssistant />
      <PickTracker />
      <ExpertProfiles />
    </div>
  )
}
