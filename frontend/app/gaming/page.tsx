import { GameDiscovery } from "@/components/gaming/game-discovery"
import { QuickPlaySection } from "@/components/gaming/quick-play-section"
import { TournamentSection } from "@/components/gaming/tournament-section"
import { FeaturedMatches } from "@/components/gaming/featured-matches"

export default function GamingPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gaming Hub</h1>
        <p className="text-muted-foreground text-lg">Play games, host tournaments, and earn from your skills</p>
      </div>

      <FeaturedMatches />
      <QuickPlaySection />
      <GameDiscovery />
      <TournamentSection />
    </div>
  )
}
