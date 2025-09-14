"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Gamepad2,
  TrendingUp,
  BarChart3,
  Wallet,
  MessageSquare,
  Menu,
  Home,
  Settings,
  User,
  Bell,
  Shield,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Platform overview",
  },
  {
    name: "Gaming Hub",
    href: "/gaming",
    icon: Gamepad2,
    description: "Play games and tournaments",
  },
  {
    name: "Betting Market",
    href: "/betting",
    icon: TrendingUp,
    description: "Custom prediction markets",
  },
  {
    name: "Expert Analysis",
    href: "/analysis",
    icon: BarChart3,
    description: "Data insights and picks",
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
    description: "Manage your funds",
  },
  {
    name: "Social Forum",
    href: "/forum",
    icon: MessageSquare,
    description: "Community discussions",
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2" onClick={onNavigate}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-xl">BetBet</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-foreground/60",
              )}
            >
              <Icon className="h-5 w-5" />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User actions */}
      <div className="border-t p-4 space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-3 mb-2">Account</p>
          <Link
            href="/settings/profile"
            onClick={onNavigate}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
          >
            <User className="h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
          <Link
            href="/settings/notifications"
            onClick={onNavigate}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>
          <Link
            href="/settings/privacy"
            onClick={onNavigate}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
          >
            <Shield className="h-4 w-4" />
            <span>Privacy & Security</span>
          </Link>
          <Link
            href="/settings/preferences"
            onClick={onNavigate}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
          >
            <Settings className="h-4 w-4" />
            <span>Preferences</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function SidebarNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-50 md:bg-background md:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
