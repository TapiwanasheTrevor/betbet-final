import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, MessageCircle, ThumbsUp, Eye, Clock, Crown, Award } from "lucide-react"

const trendingPosts = [
  {
    id: 1,
    title: "NFL Week 15 Predictions: Why the Underdogs Will Cover",
    author: {
      name: "SportsMaster Pro",
      avatar: "/placeholder.svg?key=user1",
      verified: true,
      tier: "premium",
    },
    category: "Strategy & Tips",
    excerpt:
      "After analyzing 5 years of data, I've found a pattern that suggests this week's underdogs have exceptional value...",
    stats: {
      views: 2847,
      comments: 156,
      likes: 234,
      timeAgo: "2 hours ago",
    },
    isPremium: true,
    trending: true,
  },
  {
    id: 2,
    title: "Bitcoin Market Analysis: $100K Still Possible?",
    author: {
      name: "CryptoOracle",
      avatar: "/placeholder.svg?key=user2",
      verified: true,
      tier: "pro",
    },
    category: "Market Analysis",
    excerpt:
      "Technical indicators are showing mixed signals, but here's why I think we could still see $100K by year-end...",
    stats: {
      views: 1923,
      comments: 89,
      likes: 167,
      timeAgo: "4 hours ago",
    },
    isPremium: false,
    trending: true,
  },
  {
    id: 3,
    title: "Tournament Strategy: How I Won $5K in Last Week's Poker Championship",
    author: {
      name: "PokerPro",
      avatar: "/placeholder.svg?key=user3",
      verified: false,
      tier: "standard",
    },
    category: "Tournament Organization",
    excerpt: "Breaking down my winning strategy from position play to final table negotiations...",
    stats: {
      views: 1456,
      comments: 67,
      likes: 123,
      timeAgo: "6 hours ago",
    },
    isPremium: false,
    trending: false,
  },
]

export function TrendingDiscussions() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Discussions</h2>
        <Button variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          View All Trending
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trendingPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="mb-2">
                  {post.category}
                </Badge>
                <div className="flex items-center gap-1">
                  {post.trending && <TrendingUp className="w-4 h-4 text-orange-500" />}
                  {post.isPremium && <Crown className="w-4 h-4 text-purple-500" />}
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{post.author.name}</span>
                    {post.author.verified && <Award className="w-3 h-3 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{post.stats.timeAgo}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.stats.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.stats.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.stats.likes}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    post.author.tier === "premium" ? "default" : post.author.tier === "pro" ? "secondary" : "outline"
                  }
                  className="text-xs"
                >
                  {post.author.tier}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
