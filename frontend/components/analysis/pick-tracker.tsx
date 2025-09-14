"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, TrendingDown, Target, Calendar, DollarSign, Share, QrCode } from "lucide-react"

const recentPicks = [
  {
    id: 1,
    title: "Chiefs vs Bills Over 47.5",
    sport: "NFL",
    confidence: 4,
    stake: "$50",
    odds: "+110",
    status: "pending",
    date: "Dec 15, 2024",
    analysis: "Both teams averaging 28+ points per game in last 5 matches",
  },
  {
    id: 2,
    title: "Lakers ML vs Warriors",
    sport: "NBA",
    confidence: 3,
    stake: "$25",
    odds: "-120",
    status: "won",
    date: "Dec 14, 2024",
    analysis: "Lakers 7-1 at home vs Western Conference teams",
  },
  {
    id: 3,
    title: "Bitcoin to reach $50K by Jan 1",
    sport: "Crypto",
    confidence: 5,
    stake: "$100",
    odds: "+200",
    status: "lost",
    date: "Dec 13, 2024",
    analysis: "Technical indicators showing strong bullish momentum",
  },
]

const performance = {
  totalPicks: 47,
  winRate: 68.1,
  roi: 23.4,
  profit: "+$1,247",
  streak: 4,
  streakType: "win",
}

const bookingCodes = [
  {
    id: 1,
    platform: "betting.co.zw",
    code: "BET789XYZ",
    picks: 3,
    totalOdds: "+450",
    stake: "$20",
  },
  {
    id: 2,
    platform: "africabet.mobi",
    code: "AFR456ABC",
    picks: 2,
    totalOdds: "+280",
    stake: "$30",
  },
]

export function PickTracker() {
  const [activeTab, setActiveTab] = useState("picks")

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pick Builder & Tracker</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Pick
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{performance.totalPicks}</div>
            <div className="text-sm text-muted-foreground">Total Picks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{performance.winRate}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{performance.roi}%</div>
            <div className="text-sm text-muted-foreground">ROI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{performance.profit}</div>
            <div className="text-sm text-muted-foreground">Profit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              {performance.streakType === "win" ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
              {performance.streak}
            </div>
            <div className="text-sm text-muted-foreground">
              {performance.streakType === "win" ? "Win" : "Loss"} Streak
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="picks">My Picks</TabsTrigger>
          <TabsTrigger value="booking">Booking Codes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="picks" className="space-y-4">
          <div className="space-y-4">
            {recentPicks.map((pick) => (
              <Card key={pick.id} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{pick.title}</h3>
                        <Badge variant="outline">{pick.sport}</Badge>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${i < pick.confidence ? "bg-accent" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{pick.analysis}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>{pick.stake}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span>{pick.odds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>{pick.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          pick.status === "won" ? "default" : pick.status === "lost" ? "destructive" : "secondary"
                        }
                        className="capitalize"
                      >
                        {pick.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <div className="space-y-4">
            {bookingCodes.map((booking) => (
              <Card key={booking.id} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{booking.platform}</h3>
                        <Badge variant="outline">{booking.picks} picks</Badge>
                      </div>
                      <div className="text-2xl font-mono font-bold text-accent">{booking.code}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Total Odds: {booking.totalOdds}</span>
                        <span>Stake: {booking.stake}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                      <Button size="sm">Share</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>December 2024</span>
                    <span className="font-medium">72% (18/25)</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>November 2024</span>
                    <span className="font-medium">65% (13/20)</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>October 2024</span>
                    <span className="font-medium">58% (7/12)</span>
                  </div>
                  <Progress value={58} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sport Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">NFL</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">75% (15/20)</span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-green-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">NBA</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">62% (8/13)</span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crypto</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">60% (6/10)</span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-orange-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
