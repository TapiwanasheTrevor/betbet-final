import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, Trophy, Film, Bitcoin, Microscope, Cloud, TrendingUp } from "lucide-react"

const categories = [
  {
    id: "politics",
    name: "Politics & Elections",
    icon: Vote,
    count: 45,
    volume: "$234K",
    color: "bg-blue-500",
    description: "Presidential races, policy outcomes, and political events",
  },
  {
    id: "sports",
    name: "Sports & Competition",
    icon: Trophy,
    count: 78,
    volume: "$456K",
    color: "bg-green-500",
    description: "Game outcomes, championship winners, and player performance",
  },
  {
    id: "entertainment",
    name: "Entertainment & Media",
    icon: Film,
    count: 32,
    volume: "$123K",
    color: "bg-purple-500",
    description: "Movie box office, award shows, and celebrity events",
  },
  {
    id: "crypto",
    name: "Crypto & Finance",
    icon: Bitcoin,
    count: 56,
    volume: "$789K",
    color: "bg-orange-500",
    description: "Price predictions, market movements, and financial events",
  },
  {
    id: "science",
    name: "Science & Technology",
    icon: Microscope,
    count: 23,
    volume: "$89K",
    color: "bg-cyan-500",
    description: "Tech releases, scientific discoveries, and innovation",
  },
  {
    id: "weather",
    name: "Weather & Natural Events",
    icon: Cloud,
    count: 18,
    volume: "$67K",
    color: "bg-gray-500",
    description: "Weather patterns, natural disasters, and climate events",
  },
]

export function MarketCategories() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Market Categories</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <TrendingUp className="w-3 h-3 mr-1" />6 Active Categories
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card
              key={category.id}
              className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{category.count}</div>
                    <div className="text-xs text-muted-foreground">markets</div>
                  </div>
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-green-600">{category.volume}</div>
                    <div className="text-xs text-muted-foreground">Total Volume</div>
                  </div>
                  <Badge variant="outline" className="group-hover:bg-accent group-hover:text-accent-foreground">
                    Browse Markets
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
