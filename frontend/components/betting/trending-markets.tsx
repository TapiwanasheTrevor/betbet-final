import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, BarChart3 } from "lucide-react"

const trendingMarkets = [
  {
    id: 1,
    title: "Will Bitcoin reach $100,000 by end of 2024?",
    category: "Crypto & Finance",
    volume: "$45,230",
    participants: 234,
    yesPrice: 0.72,
    noPrice: 0.28,
    change: "+5.2%",
    trending: "up",
    timeLeft: "23 days",
    creator: "CryptoAnalyst",
    image: "/placeholder.svg?key=btc100k",
  },
  {
    id: 2,
    title: "Next US Presidential Election Winner",
    category: "Politics & Elections",
    volume: "$128,450",
    participants: 567,
    yesPrice: 0.58,
    noPrice: 0.42,
    change: "-2.1%",
    trending: "down",
    timeLeft: "11 months",
    creator: "PoliticalPundit",
    image: "/placeholder.svg?key=election",
  },
  {
    id: 3,
    title: "Will OpenAI release GPT-5 in 2024?",
    category: "Science & Technology",
    volume: "$23,890",
    participants: 189,
    yesPrice: 0.45,
    noPrice: 0.55,
    change: "+8.7%",
    trending: "up",
    timeLeft: "2 months",
    creator: "TechOracle",
    image: "/placeholder.svg?key=gpt5",
  },
]

export function TrendingMarkets() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Markets</h2>
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trendingMarkets.map((market) => (
          <Card key={market.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="mb-2">
                  {market.category}
                </Badge>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    market.trending === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {market.trending === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">{market.change}</span>
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2 leading-tight">{market.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">{market.volume}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{market.participants}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>{market.timeLeft} remaining</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Odds</span>
                  <span className="text-xs text-muted-foreground">by @{market.creator}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>YES</span>
                    <span className="font-semibold text-green-600">{(market.yesPrice * 100).toFixed(0)}¢</span>
                  </div>
                  <Progress value={market.yesPrice * 100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>NO</span>
                    <span className="font-semibold text-red-600">{(market.noPrice * 100).toFixed(0)}¢</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  Trade
                </Button>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
