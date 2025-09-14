"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CreditCard, Smartphone, Bitcoin, Banknote, Shield, Clock, CheckCircle } from "lucide-react"

const savedMethods = [
  {
    id: 1,
    type: "card",
    name: "Visa ****1234",
    icon: CreditCard,
    verified: true,
    default: true,
    fee: "2.9%",
    processingTime: "Instant",
  },
  {
    id: 2,
    type: "mobile",
    name: "EcoCash +263771234567",
    icon: Smartphone,
    verified: true,
    default: false,
    fee: "1.5%",
    processingTime: "5 minutes",
  },
  {
    id: 3,
    type: "crypto",
    name: "Bitcoin Wallet",
    icon: Bitcoin,
    verified: true,
    default: false,
    fee: "0.5%",
    processingTime: "10-30 minutes",
  },
]

const availableMethods = [
  {
    type: "bank",
    name: "Bank Transfer",
    icon: Banknote,
    fee: "Free",
    processingTime: "1-3 business days",
    description: "Direct bank transfer with no fees",
  },
  {
    type: "mobile",
    name: "OneMoney",
    icon: Smartphone,
    fee: "1.5%",
    processingTime: "5 minutes",
    description: "Mobile money transfer",
  },
  {
    type: "crypto",
    name: "Ethereum",
    icon: Bitcoin,
    fee: "0.5%",
    processingTime: "5-15 minutes",
    description: "Ethereum and ERC-20 tokens",
  },
]

export function PaymentMethods() {
  const [addMethodOpen, setAddMethodOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Methods</CardTitle>
          <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Method Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <SelectItem key={method.type} value={method.type}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{method.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method-details">Details</Label>
                  <Input id="method-details" placeholder="Enter card number, phone, or wallet address" />
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Secure & Encrypted</span>
                  </div>
                  <p className="text-muted-foreground">Your payment information is encrypted and secure.</p>
                </div>
                <Button className="w-full">Add Payment Method</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Saved Methods</h4>
          {savedMethods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{method.name}</span>
                      {method.verified && <CheckCircle className="w-3 h-3 text-green-600" />}
                      {method.default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Fee: {method.fee}</span>
                      <span>•</span>
                      <span>{method.processingTime}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            )
          })}
        </div>

        {/* Available Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Available Methods</h4>
          {availableMethods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.type}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{method.name}</span>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>Fee: {method.fee}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{method.processingTime}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Add
                </Button>
              </div>
            )
          })}
        </div>

        {/* Security Notice */}
        <div className="bg-accent/10 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Security & Compliance</h4>
              <p className="text-xs text-muted-foreground">
                All payment methods are secured with bank-level encryption. We comply with PCI DSS standards and never
                store sensitive payment information.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
