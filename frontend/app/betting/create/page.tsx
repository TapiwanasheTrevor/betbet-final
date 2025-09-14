"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Info, DollarSign, Calendar, Users } from "lucide-react"
import Link from "next/link"

const steps = [
  { id: 1, name: "Basic Info", description: "Market title and description" },
  { id: 2, name: "Structure", description: "Market type and outcomes" },
  { id: 3, name: "Resolution", description: "How the market will be resolved" },
  { id: 4, name: "Parameters", description: "Timing and fees" },
  { id: 5, name: "Review", description: "Final review and publish" },
]

const categories = [
  "Politics & Elections",
  "Sports & Competition",
  "Entertainment & Media",
  "Crypto & Finance",
  "Science & Technology",
  "Weather & Natural Events",
]

export default function CreateMarketPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    marketType: "binary",
    outcomes: ["Yes", "No"],
    resolutionSource: "",
    resolutionCriteria: "",
    openingDate: "",
    closingDate: "",
    creatorFee: "2.5",
    minBet: "1",
    maxBet: "1000",
  })

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link href="/betting" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <h1 className="text-3xl font-bold">Create New Market</h1>
        <p className="text-muted-foreground">Set up your prediction market in 5 easy steps</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              <div className="text-xs text-center mt-1 max-w-20">
                <div className="font-medium">{step.name}</div>
                <div className="text-muted-foreground hidden sm:block">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Market Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">Make it clear and specific. Character limit: 100</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide context, definitions, and any important details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
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
                <Label>Tags (Optional)</Label>
                <Input placeholder="Add tags separated by commas" />
                <p className="text-sm text-muted-foreground">Help users discover your market with relevant tags</p>
              </div>
            </div>
          )}

          {/* Step 2: Market Structure */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Market Type *</Label>
                <RadioGroup
                  value={formData.marketType}
                  onValueChange={(value) => setFormData({ ...formData, marketType: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="binary" id="binary" />
                    <Label htmlFor="binary">Binary (Yes/No)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple Choice (up to 10 options)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scalar" id="scalar" />
                    <Label htmlFor="scalar">Scalar (range betting)</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.marketType === "multiple" && (
                <div className="space-y-2">
                  <Label>Outcomes</Label>
                  <div className="space-y-2">
                    <Input placeholder="Option 1" />
                    <Input placeholder="Option 2" />
                    <Button variant="outline" size="sm">
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {formData.marketType === "scalar" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Value</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Value</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Resolution */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resolution-source">Resolution Source *</Label>
                <Input
                  id="resolution-source"
                  placeholder="e.g., CoinMarketCap, Official Election Results, Box Office Mojo"
                  value={formData.resolutionSource}
                  onChange={(e) => setFormData({ ...formData, resolutionSource: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution-criteria">Resolution Criteria *</Label>
                <Textarea
                  id="resolution-criteria"
                  placeholder="Clearly explain how the market will be resolved, including edge cases..."
                  value={formData.resolutionCriteria}
                  onChange={(e) => setFormData({ ...formData, resolutionCriteria: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <Label>Oracle Type</Label>
                <RadioGroup defaultValue="manual">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual">Manual Resolution (You resolve)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="automated" id="automated" />
                    <Label htmlFor="automated">Automated (API-based)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 4: Parameters */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening-date">Opening Date *</Label>
                  <Input
                    id="opening-date"
                    type="datetime-local"
                    value={formData.openingDate}
                    onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing-date">Closing Date *</Label>
                  <Input
                    id="closing-date"
                    type="datetime-local"
                    value={formData.closingDate}
                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-bet">Minimum Bet ($)</Label>
                  <Input
                    id="min-bet"
                    type="number"
                    value={formData.minBet}
                    onChange={(e) => setFormData({ ...formData, minBet: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-bet">Maximum Bet ($)</Label>
                  <Input
                    id="max-bet"
                    type="number"
                    value={formData.maxBet}
                    onChange={(e) => setFormData({ ...formData, maxBet: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creator-fee">Creator Fee (0.5% - 5%)</Label>
                <Input
                  id="creator-fee"
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={formData.creatorFee}
                  onChange={(e) => setFormData({ ...formData, creatorFee: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  You'll earn this percentage from every trade on your market
                </p>
              </div>

              <div className="space-y-4">
                <Label>Additional Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" />
                    <Label htmlFor="featured">Submit for featured placement (+$10)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="social" />
                    <Label htmlFor="social">Auto-generate social media posts</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold">{formData.title}</h3>
                <p className="text-muted-foreground">{formData.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formData.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>{formData.creatorFee}% fee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Closes {formData.closingDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>
                      ${formData.minBet}-${formData.maxBet}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium">Before you publish:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Make sure your resolution criteria are clear and unambiguous</li>
                      <li>• Double-check your dates and fee settings</li>
                      <li>• Your market will be live immediately after publishing</li>
                      <li>• You can edit some details for the first 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button size="lg" className="px-8">
                Publish Market
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
