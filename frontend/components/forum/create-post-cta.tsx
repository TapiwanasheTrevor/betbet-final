"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { PenTool, BarChart3, DollarSign, Users, Lightbulb } from "lucide-react"

const categories = [
  "General Discussion",
  "Strategy & Tips",
  "Market Analysis",
  "Tournament Organization",
  "Regional Groups",
  "VIP/Premium Sections",
]

export function CreatePostCTA() {
  const [createPostOpen, setCreatePostOpen] = useState(false)

  return (
    <>
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Share Your Insights</h3>
                  <p className="text-muted-foreground">Start a discussion and connect with the community</p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl">
                Share your betting strategies, market analysis, or tournament experiences. Build your reputation and
                monetize your expertise through premium content.
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Build your following</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Monetize content</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Share analysis</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-8">
                    <PenTool className="w-5 h-5 mr-2" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="post-title">Title *</Label>
                      <Input id="post-title" placeholder="What's your post about?" className="text-lg" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="post-category">Category *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="post-content">Content *</Label>
                      <Textarea
                        id="post-content"
                        placeholder="Share your thoughts, analysis, or strategy..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Post Options</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="premium" />
                          <Label htmlFor="premium">Premium Content (Subscribers only)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="tips" />
                          <Label htmlFor="tips">Enable Tips</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="betting-slip" />
                          <Label htmlFor="betting-slip">Attach Betting Slip</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">Publish Post</Button>
                      <Button variant="outline">Save Draft</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Browse Posts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
