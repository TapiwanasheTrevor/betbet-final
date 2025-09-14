import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spade, Crown, Dice1, Target, Zap, Users } from "lucide-react"

const quickPlayGames = [
  {
    id: 1,
    name: "Texas Hold'em",
    icon: Spade,
    minStake: "$5",
    maxStake: "$500",
    avgPot: "$125",
    playersWaiting: 12,
    category: "Poker",
    difficulty: "Medium",
    color: "bg-red-500",
  },
  {
    id: 2,
    name: "Chess Blitz",
    icon: Crown,
    minStake: "$2",
    maxStake: "$100",
    avgPot: "$25",
    playersWaiting: 8,
    category: "Board Game",
    difficulty: "Hard",
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Dice Duel",
    icon: Dice1,
    minStake: "$1",
    maxStake: "$50",
    avgPot: "$15",
    playersWaiting: 24,
    category: "Casual",
    difficulty: "Easy",
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "Skill Shot",
    icon: Target,
    minStake: "$3",
    maxStake: "$200",
    avgPot: "$45",
    playersWaiting: 6,
    category: "Arcade",
    difficulty: "Medium",
    color: "bg-blue-500",
  },
]

export function QuickPlaySection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quick Play</h2>
          <p className="text-muted-foreground">Jump into a game instantly</p>
        </div>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Create Match
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickPlayGames.map((game) => {
          const Icon = game.icon
          return (
            <Card key={game.id} className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${game.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {game.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{game.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stakes:</span>
                    <span className="font-medium">
                      {game.minStake} - {game.maxStake}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Pot:</span>
                    <span className="font-medium text-green-600">{game.avgPot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge
                      variant={
                        game.difficulty === "Easy"
                          ? "secondary"
                          : game.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {game.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{game.playersWaiting} waiting</span>
                </div>

                <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground">Quick Join</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
