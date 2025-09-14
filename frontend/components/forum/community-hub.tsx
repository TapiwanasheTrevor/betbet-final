"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, Users, Pin, Clock, ThumbsUp, MessageCircle, Award } from "lucide-react"

const categories = [
  {
    id: "general",
    name: "General Discussion",
    description: "Open discussions about betting, gaming, and platform features",
    posts: 1247,
    members: 5634,
    lastActivity: "2 minutes ago",
    color: "bg-blue-500",
  },
  {
    id: "strategy",
    name: "Strategy & Tips",
    description: "Share and discuss betting strategies and winning tips",
    posts: 892,
    members: 3421,
    lastActivity: "5 minutes ago",
    color: "bg-green-500",
  },
  {
    id: "analysis",
    name: "Market Analysis",
    description: "Deep dives into market trends and data analysis",
    posts: 567,
    members: 2156,
    lastActivity: "12 minutes ago",
    color: "bg-purple-500",
  },
  {
    id: "tournaments",
    name: "Tournament Organization",
    description: "Organize and discuss tournaments and competitions",
    posts: 234,
    members: 1789,
    lastActivity: "1 hour ago",
    color: "bg-orange-500",
  },
]

const recentPosts = [
  {
    id: 1,
    title: "Best strategies for NFL betting this season?",
    author: {
      name: "BettingNewbie",
      avatar: "/placeholder.svg?key=newbie",
      verified: false,
    },
    category: "Strategy & Tips",
    replies: 23,
    likes: 45,
    timeAgo: "15 minutes ago",
    isPinned: false,
    lastReply: {
      author: "SportsMaster Pro",
      timeAgo: "2 minutes ago",
    },
  },
  {
    id: 2,
    title: "Weekly Market Roundup - December 15th",
    author: {
      name: "MarketAnalyst",
      avatar: "/placeholder.svg?key=analyst",
      verified: true,
    },
    category: "Market Analysis",
    replies: 67,
    likes: 134,
    timeAgo: "1 hour ago",
    isPinned: true,
    lastReply: {
      author: "CryptoTrader",
      timeAgo: "5 minutes ago",
    },
  },
  {
    id: 3,
    title: "Chess Tournament - $500 Prize Pool - Sign Up Now!",
    author: {
      name: "ChessMaster",
      avatar: "/placeholder.svg?key=chess",
      verified: false,
    },
    category: "Tournament Organization",
    replies: 12,
    likes: 28,
    timeAgo: "3 hours ago",
    isPinned: false,
    lastReply: {
      author: "StrategyKing",
      timeAgo: "30 minutes ago",
    },
  },
]

export function CommunityHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="group hover:shadow-md transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">{category.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{category.posts.toLocaleString()} posts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{category.members.toLocaleString()} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Active {category.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Browse
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-md transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {post.isPinned && <Pin className="w-4 h-4 text-accent" />}
                            <h3 className="font-semibold group-hover:text-accent transition-colors">{post.title}</h3>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span className="font-medium">{post.author.name}</span>
                          {post.author.verified && <Award className="w-3 h-3 text-blue-500" />}
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.replies} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{post.likes} likes</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last reply by {post.lastReply.author} {post.lastReply.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
