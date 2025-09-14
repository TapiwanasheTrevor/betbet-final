import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Lightbulb, DollarSign, Users } from "lucide-react"

export function CreateMarketCTA() {
  return (
    <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/20">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Create Your Own Market</h3>
                <p className="text-muted-foreground">Turn your predictions into profit</p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl">
              Have a prediction about future events? Create a custom market and earn fees from every trade. From sports
              outcomes to tech releases, monetize your insights.
            </p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span>Earn 1-5% creator fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Build your following</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Easy setup wizard</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="text-lg px-8">
              <Plus className="w-5 h-5 mr-2" />
              Create Market
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Learn How
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
