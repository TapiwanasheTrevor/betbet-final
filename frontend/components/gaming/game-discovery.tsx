"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Clock, DollarSign } from "lucide-react"

const gameCategories = [
  { id: "all", name: "All Games", count: 156 },
  { id: "poker", name: "Poker", count: 45 },
  { id: "chess", name: "Chess", count: 32 },
  { id: "blackjack", name: "Blackjack", count: 28 },
  { id: "arcade", name: "Arcade", count: 24 },
  { id: "strategy", name: "Strategy", count: 18 },
  { id: "custom", name: "Custom", count: 9 },
]

const availableGames = [
  {
    id: 1,
    name: "No Limit Hold'em",
    category: "poker",
    players: "3/6",
    stakes: "$10-$100",
    timeControl: "No Limit",
    waiting: 2,
    image: "/poker-chips.jpg",
  },
  {
    id: 2,
    name: "Rapid Chess",
    category: "chess",
    players: "1/2",
    stakes: "$5-$50",
    timeControl: "10+5",
    waiting: 1,
    image: "/chess-piece.jpg",
  },
  {
    id: 3,
    name: "Multi-Hand Blackjack",
    category: "blackjack",
    players: "2/4",
    stakes: "$2-$25",
    timeControl: "Standard",
    waiting: 3,
    image: "/blackjack-cards.jpg",
  },
  {
    id: 4,
    name: "Speed Checkers",
    category: "strategy",
    players: "0/2",
    stakes: "$1-$20",
    timeControl: "5+3",
    waiting: 0,
    image: "/checkers-board.jpg",
  },
  {
    id: 5,
    name: "Skill Roulette",
    category: "arcade",
    players: "4/8",
    stakes: "$3-$30",
    timeControl: "Real-time",
    waiting: 5,
    image: "/roulette-wheel.png",
  },
  {
    id: 6,
    name: "Word Duel",
    category: "custom",
    players: "1/2",
    stakes: "$2-$15",
    timeControl: "3 min",
    waiting: 1,
    image: "/placeholder-ff1ja.png",
  },
]

export function GameDiscovery() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [stakeFilter, setStakeFilter] = useState("all")

  const filteredGames = availableGames.filter((game) => {
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Game Browser</h2>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {gameCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={stakeFilter} onValueChange={setStakeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Stake Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stakes</SelectItem>
              <SelectItem value="micro">Micro ($1-$5)</SelectItem>
              <SelectItem value="low">Low ($5-$25)</SelectItem>
              <SelectItem value="medium">Medium ($25-$100)</SelectItem>
              <SelectItem value="high">High ($100+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => (
              <Card key={game.id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={game.image || "/placeholder.svg"}
                      alt={game.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {gameCategories.find((cat) => cat.id === game.category)?.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>{game.stakes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>{game.timeControl}</span>
                    </div>
                    <div className="text-muted-foreground">{game.waiting} waiting</div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      Join Game
                    </Button>
                    <Button variant="outline" size="sm">
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
