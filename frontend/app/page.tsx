import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  TrendingUp,
  Gamepad2,
  BarChart3,
  MessageSquare,
  Clock,
  Trophy,
  DollarSign,
  Users,
  ArrowUpRight,
  Calendar,
  Star,
} from "lucide-react"
import Link from "next/link"

const recentActivity = [
  {
    type: "bet",
    title: "Won bet on Lakers vs Warriors",
    amount: "+$125.50",
    time: "2 hours ago",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    type: "game",
    title: "Poker tournament - 3rd place",
    amount: "+$89.00",
    time: "5 hours ago",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    type: "market",
    title: "Created market: 2024 Election",
    amount: "",
    time: "1 day ago",
    icon: BarChart3,
    color: "text-blue-500",
  },
  {
    type: "social",
    title: "Joined 'NBA Experts' group",
    amount: "",
    time: "2 days ago",
    icon: Users,
    color: "text-purple-500",
  },
]

const platformNews = [
  {
    title: "New Crypto Payment Options Added",
    description: "We now support 15+ cryptocurrencies for deposits and withdrawals",
    time: "3 hours ago",
    category: "Platform Update",
  },
  {
    title: "Weekly Tournament Series Announced",
    description: "$50K prize pool across poker, chess, and custom games",
    time: "1 day ago",
    category: "Tournament",
  },
  {
    title: "AI Analysis Tools Enhanced",
    description: "New machine learning models for better prediction accuracy",
    time: "2 days ago",
    category: "Feature",
  },
]

const communityHighlights = [
  {
    user: "ProTrader_Mike",
    avatar: "/placeholder.svg?height=40&width=40",
    achievement: "Hit 85% win rate this month",
    followers: "2.3K followers",
    badge: "Expert",
  },
  {
    user: "ChessQueen_Sarah",
    avatar: "/placeholder.svg?height=40&width=40",
    achievement: "Won $5K chess tournament",
    followers: "1.8K followers",
    badge: "Champion",
  },
  {
    user: "DataWiz_Alex",
    avatar: "/placeholder.svg?height=40&width=40",
    achievement: "Created top prediction model",
    followers: "3.1K followers",
    badge: "Analyst",
  },
]

const quickStats = [
  { label: "Portfolio Value", value: "$2,847.50", change: "+12.5%", icon: DollarSign },
  { label: "Active Bets", value: "7", change: "+2", icon: TrendingUp },
  { label: "Win Rate", value: "73%", change: "+5%", icon: Trophy },
  { label: "Followers", value: "1.2K", change: "+48", icon: Users },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Here's what's happening on your platform today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest bets, games, and platform interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-background ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      {activity.amount}
                    </Badge>
                  )}
                </div>
              )
            })}
            <Button variant="outline" className="w-full bg-transparent">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Platform News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Platform News
            </CardTitle>
            <CardDescription>Latest updates and announcements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformNews.map((news, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {news.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                </div>
                <h4 className="font-medium text-sm">{news.title}</h4>
                <p className="text-xs text-muted-foreground">{news.description}</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              View All News
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Community Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Community Highlights
            </CardTitle>
            <CardDescription>Top performers and community achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {communityHighlights.map((highlight, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={highlight.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{highlight.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{highlight.user}</p>
                      <Badge variant="secondary" className="text-xs">
                        {highlight.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{highlight.achievement}</p>
                    <p className="text-xs text-muted-foreground">{highlight.followers}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Follow
                </Button>
              </div>
            ))}
            <Link href="/forum">
              <Button variant="outline" className="w-full bg-transparent">
                Explore Community
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your favorite activities</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/betting/create">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Create New Market
              </Button>
            </Link>
            <Link href="/gaming">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Join Game
              </Button>
            </Link>
            <Link href="/wallet">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Manage Wallet
              </Button>
            </Link>
            <Link href="/analysis">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
