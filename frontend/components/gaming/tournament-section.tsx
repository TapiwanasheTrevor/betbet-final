import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Calendar, DollarSign, Clock } from "lucide-react"

const tournaments = [
  {
    id: 1,
    name: "Weekly Poker Championship",
    game: "Texas Hold'em",
    prizePool: "$5,000",
    entryFee: "$50",
    registered: 45,
    maxPlayers: 100,
    startDate: "Dec 15, 2024",
    startTime: "8:00 PM EST",
    status: "registering",
    format: "Single Elimination",
    image: "/poker-tournament.png",
  },
  {
    id: 2,
    name: "Chess Masters Series",
    game: "Chess",
    prizePool: "$2,500",
    entryFee: "$25",
    registered: 28,
    maxPlayers: 64,
    startDate: "Dec 18, 2024",
    startTime: "6:00 PM EST",
    status: "registering",
    format: "Swiss System",
    image: "/chess-tournament.png",
  },
  {
    id: 3,
    name: "Blackjack Blitz",
    game: "Blackjack",
    prizePool: "$1,200",
    entryFee: "$15",
    registered: 32,
    maxPlayers: 50,
    startDate: "Dec 20, 2024",
    startTime: "7:30 PM EST",
    status: "starting-soon",
    format: "Multi-Table",
    image: "/blackjack-tournament.png",
  },
]

export function TournamentSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tournaments</h2>
          <p className="text-muted-foreground">Compete for big prizes in structured events</p>
        </div>
        <Button>
          <Trophy className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <img
                src={tournament.image || "/placeholder.svg"}
                alt={tournament.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge
                  variant={tournament.status === "starting-soon" ? "destructive" : "secondary"}
                  className="font-semibold"
                >
                  {tournament.status === "starting-soon" ? "Starting Soon" : "Open Registration"}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{tournament.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {tournament.game} • {tournament.format}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold">{tournament.prizePool}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>{tournament.entryFee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">{tournament.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs">{tournament.startTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Registration</span>
                  <span className="font-medium">
                    {tournament.registered}/{tournament.maxPlayers}
                  </span>
                </div>
                <Progress value={(tournament.registered / tournament.maxPlayers) * 100} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  Register
                </Button>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          View All Tournaments
        </Button>
      </div>
    </section>
  )
}
