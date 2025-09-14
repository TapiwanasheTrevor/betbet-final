"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Send, Mic, History, Lightbulb, Download, Copy } from "lucide-react"

const queryExamples = [
  "Show all home favorites this week",
  "Compare team performance in rain conditions",
  "Find value bets based on historical odds movements",
  "Identify upset potential in today's matches",
  "Analyze player performance vs specific opponents",
  "What's the correlation between weather and scoring?",
]

const queryHistory = [
  {
    id: 1,
    query: "Show NFL teams with best home record this season",
    timestamp: "2 hours ago",
    confidence: 95,
  },
  {
    id: 2,
    query: "Compare Bitcoin volatility vs traditional markets",
    timestamp: "1 day ago",
    confidence: 88,
  },
  {
    id: 3,
    query: "Find undervalued players in fantasy football",
    timestamp: "2 days ago",
    confidence: 92,
  },
]

const analysisResults = [
  {
    id: 1,
    title: "Home Field Advantage Analysis",
    summary:
      "Teams playing at home have won 67% of games this season, with the strongest advantage in cold weather conditions.",
    confidence: 94,
    dataPoints: 247,
    charts: ["Bar Chart", "Trend Line"],
  },
  {
    id: 2,
    title: "Weather Impact on Scoring",
    summary:
      "Games played in temperatures below 40°F show 23% lower scoring on average, particularly affecting passing games.",
    confidence: 89,
    dataPoints: 156,
    charts: ["Scatter Plot", "Heat Map"],
  },
]

export function AIAssistant() {
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setQuery("")
    }, 2000)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Analysis Assistant</h2>
        <Badge variant="secondary" className="gap-2">
          <Bot className="w-4 h-4" />
          GPT-4 Powered
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent" />
            Natural Language Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Ask me anything about your data... e.g., 'Show teams with best road record'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-12 text-lg"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button type="submit" disabled={isProcessing || !query.trim()}>
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                {queryExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left bg-transparent"
                    onClick={() => setQuery(example)}
                  >
                    <Lightbulb className="w-4 h-4 mr-2 text-accent shrink-0" />
                    <span className="text-sm">{example}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {queryHistory.map((item) => (
                  <Card key={item.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.query}</p>
                        <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.confidence}% confidence</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setQuery(item.query)}>
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="space-y-4">
                {analysisResults.map((result) => (
                  <Card key={result.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{result.title}</h3>
                          <p className="text-muted-foreground mt-1">{result.summary}</p>
                        </div>
                        <Badge variant="outline">{result.confidence}% confidence</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{result.dataPoints} data points</span>
                        <span>{result.charts.join(", ")}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}
