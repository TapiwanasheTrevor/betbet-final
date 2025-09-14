import { MarketDiscovery } from "@/components/betting/market-discovery"
import { TrendingMarkets } from "@/components/betting/trending-markets"
import { MarketCategories } from "@/components/betting/market-categories"
import { CreateMarketCTA } from "@/components/betting/create-market-cta"

export default function BettingPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Betting Marketplace</h1>
        <p className="text-muted-foreground text-lg">Create and trade on custom prediction markets</p>
      </div>

      <CreateMarketCTA />
      <TrendingMarkets />
      <MarketCategories />
      <MarketDiscovery />
    </div>
  )
}
