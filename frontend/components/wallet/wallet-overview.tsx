"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Bitcoin, Zap } from "lucide-react"

const balances = [
  {
    currency: "USD",
    symbol: "$",
    balance: 2847.5,
    available: 2647.5,
    locked: 200.0,
    change: "+5.2%",
    trending: "up",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    currency: "BTC",
    symbol: "₿",
    balance: 0.0234,
    available: 0.0234,
    locked: 0,
    change: "-2.1%",
    trending: "down",
    icon: Bitcoin,
    color: "text-orange-500",
  },
  {
    currency: "ETH",
    symbol: "Ξ",
    balance: 1.456,
    available: 1.456,
    locked: 0,
    change: "+8.7%",
    trending: "up",
    icon: Zap,
    color: "text-blue-500",
  },
]

const portfolioStats = {
  totalValue: "$3,247.82",
  dayChange: "+$127.45",
  dayChangePercent: "+4.1%",
  weekChange: "+$234.67",
  weekChangePercent: "+7.8%",
}

export function WalletOverview() {
  const [showBalances, setShowBalances] = useState(true)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Portfolio Overview</h2>
        <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)}>
          {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
              <div className="text-4xl font-bold mb-2">{showBalances ? portfolioStats.totalValue : "••••••"}</div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {portfolioStats.dayChange} ({portfolioStats.dayChangePercent})
                  </span>
                  <span className="text-muted-foreground">today</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <span>
                    {portfolioStats.weekChange} ({portfolioStats.weekChangePercent})
                  </span>
                  <span className="text-muted-foreground">this week</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                Multi-Currency
              </Badge>
              <p className="text-sm text-muted-foreground">{balances.length} currencies active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Balances */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map((balance) => {
          const Icon = balance.icon
          return (
            <Card key={balance.currency} className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${balance.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{balance.currency}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {balance.currency === "USD" ? "US Dollar" : balance.currency === "BTC" ? "Bitcoin" : "Ethereum"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      balance.trending === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {balance.trending === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{balance.change}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available:</span>
                    <span className="font-semibold">
                      {showBalances
                        ? `${balance.symbol}${balance.available.toFixed(balance.currency === "USD" ? 2 : 4)}`
                        : "••••"}
                    </span>
                  </div>
                  {balance.locked > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Locked:</span>
                      <span className="font-semibold text-orange-600">
                        {showBalances
                          ? `${balance.symbol}${balance.locked.toFixed(balance.currency === "USD" ? 2 : 4)}`
                          : "••••"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="font-bold">
                      {showBalances
                        ? `${balance.symbol}${balance.balance.toFixed(balance.currency === "USD" ? 2 : 4)}`
                        : "••••"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
