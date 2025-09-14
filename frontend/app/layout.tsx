import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { TopNavbar } from "@/components/layout/top-navbar"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "BetBet - Peer-to-Peer Betting & Gaming Platform",
  description:
    "The ultimate peer-to-peer betting and gaming platform. Play games, create markets, analyze data, and connect with the community.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <SidebarNav />
          <TopNavbar />
        </Suspense>
        <main className="md:ml-64 pt-16">
          <ContentWrapper>{children}</ContentWrapper>
        </main>
        <Analytics />
      </body>
    </html>
  )
}
