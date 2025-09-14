import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, TrendingUp, Users, DollarSign, Award, Crown } from "lucide-react"

const topExperts = [
  {
    id: 1,
    name: "SportsMaster Pro",
    avatar: "/placeholder.svg?key=expert1",
    specialty: "NFL & NBA",
    winRate: 74.2,
    followers: 2847,
    monthlyRevenue: "$3,240",
    tier: "premium",
    rating: 4.8,
    picks: 156,
    verified: true,
  },
  {
    id: 2,
    name: "CryptoOracle",
    avatar: "/placeholder.svg?key=expert2",
    specialty: "Cryptocurrency",
    winRate: 68.9,
    followers: 1923,
    monthlyRevenue: "$2,180",
    tier: "pro",
    rating: 4.6,
    picks: 89,
    verified: true,
  },
  {
    id: 3,
    name: "PoliticalPundit",
    avatar: "/placeholder.svg?key=expert3",
    specialty: "Politics & Elections",
    winRate: 71.5,
    followers: 1456,
    monthlyRevenue: "$1,890",
    tier: "standard",
    rating: 4.7,
    picks: 67,
    verified: false,
  },
]

const subscriptionTiers = [
  {
    name: "Free",
    price: "$0",
    features: ["Basic picks", "Community access", "Performance tracking"],
    color: "bg-gray-500",
  },
  {
    name: "Pro",
    price: "$29",
    features: ["Premium picks", "AI analysis", "Priority support", "Advanced analytics"],
    color: "bg-blue-500",
  },
  {
    name: "Expert",
    price: "$99",
    features: ["All Pro features", "1-on-1 consultation", "Custom strategies", "White-label tools"],
    color: "bg-purple-500",
  },
]

export function ExpertProfiles() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Expert Profiles & Monetization</h2>
        <Button>
          <Crown className="w-4 h-4 mr-2" />
          Become Expert
        </Button>
      </div>

      {/* Top Experts */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Top Performing Experts</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topExperts.map((expert) => (
            <Card key={expert.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
                    <AvatarFallback>{expert.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{expert.name}</CardTitle>
                      {expert.verified && <Award className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      expert.tier === "premium"
                        ? "border-purple-500 text-purple-700"
                        : expert.tier === "pro"
                          ? "border-blue-500 text-blue-700"
                          : "border-gray-500 text-gray-700"
                    }`}
                  >
                    {expert.tier}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">{expert.winRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{expert.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>{expert.monthlyRevenue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>
                      {expert.rating} ({expert.picks})
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    Subscribe
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Monetization Tiers</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {subscriptionTiers.map((tier, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className={`h-2 ${tier.color}`} />
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {tier.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                  {index === 0 ? "Get Started" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
