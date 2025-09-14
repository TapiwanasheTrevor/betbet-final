import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Users, Clock, DollarSign } from "lucide-react"

const featuredMatches = [
  {
    id: 1,
    title: "High Stakes Poker Championship",
    game: "Texas Hold'em",
    pot: "$2,500",
    players: "6/8",
    spectators: 234,
    timeLeft: "2h 15m",
    status: "live",
    image: "/poker-table-cards.png",
  },
  {
    id: 2,
    title: "Chess Grandmaster Showdown",
    game: "Chess",
    pot: "$1,200",
    players: "2/2",
    spectators: 156,
    timeLeft: "45m",
    status: "live",
    image: "/chess-board-with-pieces.png",
  },
  {
    id: 3,
    title: "Blackjack Tournament Finals",
    game: "Blackjack",
    pot: "$3,000",
    players: "4/6",
    spectators: 89,
    timeLeft: "Starting soon",
    status: "starting",
    image: "/blackjack-table.png",
  },
]

export function FeaturedMatches() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Matches</h2>
        <Button variant="outline">View All</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredMatches.map((match) => (
          <Card key={match.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <img src={match.image || "/placeholder.svg"} alt={match.title} className="w-full h-48 object-cover" />
              <div className="absolute top-4 left-4">
                <Badge variant={match.status === "live" ? "destructive" : "secondary"} className="font-semibold">
                  {match.status === "live" ? "🔴 LIVE" : "⏰ Starting Soon"}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                <Eye className="inline w-3 h-3 mr-1" />
                {match.spectators}
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{match.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{match.game}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">{match.pot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{match.players}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>{match.timeLeft}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  {match.status === "live" ? "Watch" : "Join"}
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
