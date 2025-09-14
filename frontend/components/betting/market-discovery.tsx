"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, DollarSign, Users, Clock, Eye } from "lucide-react"

const allMarkets = [
  {
    id: 1,
    title: "Will Tesla stock reach $300 by Q1 2025?",
    category: "crypto",
    volume: "$12,450",
    participants: 89,
    yesPrice: 0.34,
    noPrice: 0.66,
    timeLeft: "45 days",
    creator: "StockGuru",
    status: "active",
  },
  {
    id: 2,
    title: "Next Marvel movie to gross over $1B worldwide?",
    category: "entertainment",
    volume: "$8,230",
    participants: 156,
    yesPrice: 0.67,
    noPrice: 0.33,
    timeLeft: "3 months",
    creator: "MovieBuff",
    status: "active",
  },
  {
    id: 3,
    title: "Will there be a major earthquake (7.0+) in California in 2024?",
    category: "weather",
    volume: "$5,670",
    participants: 67,
    yesPrice: 0.23,
    noPrice: 0.77,
    timeLeft: "2 months",
    creator: "EarthWatch",
    status: "active",
  },
  {
    id: 4,
    title: "Champions League Final: Manchester City vs Real Madrid?",
    category: "sports",
    volume: "$34,890",
    participants: 234,
    yesPrice: 0.45,
    noPrice: 0.55,
    timeLeft: "6 months",
    creator: "FootballFan",
    status: "active",
  },
  {
    id: 5,
    title: "Will SpaceX successfully land humans on Mars by 2030?",
    category: "science",
    volume: "$15,670",
    participants: 123,
    yesPrice: 0.28,
    noPrice: 0.72,
    timeLeft: "5 years",
    creator: "SpaceExplorer",
    status: "active",
  },
  {
    id: 6,
    title: "2024 US Presidential Debate Viewership over 100M?",
    category: "politics",
    volume: "$67,890",
    participants: 445,
    yesPrice: 0.72,
    noPrice: 0.28,
    timeLeft: "8 months",
    creator: "PoliticalAnalyst",
    status: "active",
  },
]

const filterOptions = [
  { value: "all", label: "All Markets" },
  { value: "politics", label: "Politics" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
  { value: "crypto", label: "Crypto & Finance" },
  { value: "science", label: "Science & Tech" },
  { value: "weather", label: "Weather & Natural" },
]

export function MarketDiscovery() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("volume")

  const filteredMarkets = allMarkets.filter((market) => {
    const matchesCategory = selectedCategory === "all" || market.category === selectedCategory
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Markets</h2>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="volume">Highest Volume</SelectItem>
            <SelectItem value="participants">Most Participants</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredMarkets.map((market) => (
          <Card key={market.id} className="group hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="mb-2">
                  {filterOptions.find((opt) => opt.value === market.category)?.label}
                </Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg line-clamp-2 leading-tight">{market.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Created by @{market.creator}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">{market.volume}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{market.participants}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs">{market.timeLeft}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current Odds</span>
                  <span className="text-muted-foreground">Price per share</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">YES</span>
                    <span className="font-semibold text-green-600">{(market.yesPrice * 100).toFixed(0)}¢</span>
                  </div>
                  <Progress value={market.yesPrice * 100} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">NO</span>
                    <span className="font-semibold text-red-600">{(market.noPrice * 100).toFixed(0)}¢</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  Buy YES
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                  Buy NO
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Markets
        </Button>
      </div>
    </section>
  )
}
