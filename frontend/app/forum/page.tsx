import { CommunityHub } from "@/components/forum/community-hub"
import { TrendingDiscussions } from "@/components/forum/trending-discussions"
import { ActiveGroups } from "@/components/forum/active-groups"
import { CreatePostCTA } from "@/components/forum/create-post-cta"

export default function ForumPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Social Forum</h1>
        <p className="text-muted-foreground text-lg">
          Connect with the community, share strategies, and learn together
        </p>
      </div>

      <CreatePostCTA />
      <TrendingDiscussions />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CommunityHub />
        </div>
        <div>
          <ActiveGroups />
        </div>
      </div>
    </div>
  )
}
