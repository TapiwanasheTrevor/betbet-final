"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Bitcoin, Zap, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

const getCurrencyIcon = (currency: string) => {
  switch (currency) {
    case 'USD': return DollarSign
    case 'BTC': return Bitcoin
    case 'ETH': return Zap
    default: return DollarSign
  }
}

const getCurrencyColor = (currency: string) => {
  switch (currency) {
    case 'USD': return "text-green-600"
    case 'BTC': return "text-orange-500"
    case 'ETH': return "text-blue-500"
    default: return "text-gray-600"
  }
}

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'USD': return "$"
    case 'BTC': return "₿"
    case 'ETH': return "Ξ"
    default: return currency
  }
}

const getCurrencyName = (currency: string) => {
  switch (currency) {
    case 'USD': return "US Dollar"
    case 'BTC': return "Bitcoin"
    case 'ETH': return "Ethereum"
    case 'ZWL': return "Zimbabwe Dollar"
    case 'ZAR': return "South African Rand"
    default: return currency
  }
}

export function WalletOverview() {
  const [showBalances, setShowBalances] = useState(true)
  const { wallets, loading, error, refreshWallets } = useWallet()

  useEffect(() => {
    refreshWallets()
  }, [refreshWallets])

  // Calculate total portfolio value in USD (simplified - in real app would use exchange rates)
  const totalValue = wallets.reduce((sum, wallet) => {
    if (wallet.currency === 'USD') {
      return sum + wallet.balance
    }
    // For demo purposes, assume 1:1 for other currencies
    return sum + wallet.balance
  }, 0)

  if (loading && wallets.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading wallet data...</span>
      </div>
    )
  }

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
              <div className="text-4xl font-bold mb-2">
                {showBalances ? `$${totalValue.toFixed(2)}` : "••••••"}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    +$0.00 (+0.0%)
                  </span>
                  <span className="text-muted-foreground">today</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <span>
                    +$0.00 (+0.0%)
                  </span>
                  <span className="text-muted-foreground">this week</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowBalances(!showBalances)}
                className="h-10 w-10"
              >
                {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">{wallets.length} wallets active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading wallet data: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWallets}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Currency Balances */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.length === 0 && !loading ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No wallets found</p>
              <Button variant="outline" onClick={refreshWallets}>
                Create Sample Wallets
              </Button>
            </CardContent>
          </Card>
        ) : (
          wallets.map((wallet) => {
          const Icon = getCurrencyIcon(wallet.currency)
          const color = getCurrencyColor(wallet.currency)
          const symbol = getCurrencySymbol(wallet.currency)
          const name = getCurrencyName(wallet.currency)

          return (
            <Card key={wallet.id} className="group hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{wallet.currency}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+0.0%</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available:</span>
                    <span className="font-semibold">
                      {showBalances
                        ? `${symbol}${wallet.available_balance.toFixed(wallet.currency === "USD" ? 2 : 4)}`
                        : "••••"}
                    </span>
                  </div>
                  {wallet.locked_balance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Locked:</span>
                      <span className="font-semibold text-orange-600">
                        {showBalances
                          ? `${symbol}${wallet.locked_balance.toFixed(wallet.currency === "USD" ? 2 : 4)}`
                          : "••••"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="font-bold">
                      {showBalances
                        ? `${symbol}${wallet.balance.toFixed(wallet.currency === "USD" ? 2 : 4)}`
                        : "••••"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }))}
      </div>
    </section>
  )
}
