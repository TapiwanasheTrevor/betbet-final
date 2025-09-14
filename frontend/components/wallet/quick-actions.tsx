"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Minus, ArrowRightLeft, Send, CreditCard, Smartphone, Bitcoin, Banknote } from "lucide-react"

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, fee: "2.9%" },
  { id: "mobile", name: "Mobile Money", icon: Smartphone, fee: "1.5%" },
  { id: "crypto", name: "Cryptocurrency", icon: Bitcoin, fee: "0.5%" },
  { id: "bank", name: "Bank Transfer", icon: Banknote, fee: "Free" },
]

export function QuickActions() {
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Quick Actions</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Deposit */}
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Deposit</h3>
                <p className="text-sm text-muted-foreground">Add funds to your wallet</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <Input id="deposit-amount" placeholder="Enter amount" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <Button key={method.id} variant="outline" className="justify-start h-auto p-4 bg-transparent">
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">Fee: {method.fee}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
              <Button className="w-full">Continue Deposit</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw */}
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Minus className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Withdraw</h3>
                <p className="text-sm text-muted-foreground">Transfer funds out</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input id="withdraw-amount" placeholder="Enter amount" type="number" />
                <p className="text-sm text-muted-foreground">Available: $2,647.50</p>
              </div>
              <div className="space-y-2">
                <Label>Withdrawal Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer (Free)</SelectItem>
                    <SelectItem value="mobile">Mobile Money (1.5%)</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency (0.5%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Processing Time</p>
                <p className="text-muted-foreground">Bank transfers: 1-3 business days</p>
              </div>
              <Button className="w-full">Request Withdrawal</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Convert */}
        <Card className="cursor-pointer group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Convert</h3>
            <p className="text-sm text-muted-foreground">Exchange currencies</p>
          </CardContent>
        </Card>

        {/* Transfer */}
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Transfer</h3>
                <p className="text-sm text-muted-foreground">Send to other users</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer to User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-user">Recipient</Label>
                <Input id="transfer-user" placeholder="Username or email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input id="transfer-amount" placeholder="Enter amount" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-memo">Memo (Optional)</Label>
                <Input id="transfer-memo" placeholder="Add a note" />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Transfer Fee: Free</p>
                <p className="text-muted-foreground">Instant transfer between BetBet users</p>
              </div>
              <Button className="w-full">Send Transfer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
