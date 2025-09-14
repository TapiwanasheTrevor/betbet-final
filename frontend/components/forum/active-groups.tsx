"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Users, Lock, Globe, Crown, MessageCircle, Calendar } from "lucide-react"

const activeGroups = [
  {
    id: 1,
    name: "NFL Betting Pros",
    description: "Advanced NFL betting strategies and analysis",
    members: 234,
    type: "public",
    activity: "Very Active",
    avatar: "/placeholder.svg?key=nfl-group",
    lastActivity: "5 minutes ago",
    isPremium: false,
  },
  {
    id: 2,
    name: "Crypto Traders Elite",
    description: "Exclusive crypto trading insights and signals",
    members: 89,
    type: "private",
    activity: "Active",
    avatar: "/placeholder.svg?key=crypto-group",
    lastActivity: "1 hour ago",
    isPremium: true,
  },
  {
    id: 3,
    name: "Chess Tournament Organizers",
    description: "Organize and participate in chess tournaments",
    members: 156,
    type: "public",
    activity: "Moderate",
    avatar: "/placeholder.svg?key=chess-group",
    lastActivity: "3 hours ago",
    isPremium: false,
  },
  {
    id: 4,
    name: "Regional: Zimbabwe",
    description: "Local betting community and meetups",
    members: 67,
    type: "public",
    activity: "Active",
    avatar: "/placeholder.svg?key=zw-group",
    lastActivity: "2 hours ago",
    isPremium: false,
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Weekly Strategy Meetup",
    group: "NFL Betting Pros",
    date: "Dec 16, 2024",
    time: "7:00 PM EST",
    type: "Voice Chat",
  },
  {
    id: 2,
    title: "Crypto Market Analysis",
    group: "Crypto Traders Elite",
    date: "Dec 17, 2024",
    time: "6:00 PM EST",
    type: "Premium Stream",
  },
]

export function ActiveGroups() {
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Groups</CardTitle>
            <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name *</Label>
                    <Input id="group-name" placeholder="Enter group name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Description *</Label>
                    <Textarea id="group-description" placeholder="Describe your group" rows={3} />
                  </div>
                  <div className="space-y-3">
                    <Label>Group Type</Label>
                    <RadioGroup defaultValue="public">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public">Public - Anyone can join</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private">Private - Approval required</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paid" id="paid" />
                        <Label htmlFor="paid">Paid - Subscription required</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button className="w-full">Create Group</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                <AvatarFallback>{group.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate">{group.name}</h3>
                  {group.type === "private" ? (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Globe className="w-3 h-3 text-muted-foreground" />
                  )}
                  {group.isPremium && <Crown className="w-3 h-3 text-purple-500" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{group.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{group.members}</span>
                  </div>
                  <Badge
                    variant={
                      group.activity === "Very Active"
                        ? "default"
                        : group.activity === "Active"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {group.activity}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            Browse All Groups
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <h3 className="font-medium text-sm mb-1">{event.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{event.group}</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {event.date} at {event.time}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            View All Events
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">SM</AvatarFallback>
              </Avatar>
              <span className="font-medium">SportsMaster</span>
              <span className="text-muted-foreground text-xs">2m ago</span>
            </div>
            <p className="text-sm text-muted-foreground pl-8">Anyone watching the Chiefs game tonight?</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">CT</AvatarFallback>
              </Avatar>
              <span className="font-medium">CryptoTrader</span>
              <span className="text-muted-foreground text-xs">5m ago</span>
            </div>
            <p className="text-sm text-muted-foreground pl-8">BTC looking bullish today 🚀</p>
          </div>
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Join Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
