"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Gamepad2, TrendingUp } from "lucide-react"

const transactions = [
  {
    id: "TXN001",
    type: "deposit",
    amount: 500.0,
    currency: "USD",
    status: "completed",
    date: "2024-12-15T10:30:00Z",
    description: "Credit Card Deposit",
    fee: 14.5,
    method: "Visa ****1234",
  },
  {
    id: "TXN002",
    type: "bet",
    amount: -50.0,
    currency: "USD",
    status: "completed",
    date: "2024-12-15T09:15:00Z",
    description: "NFL Chiefs vs Bills Over 47.5",
    fee: 0,
    method: "Gaming Hub",
  },
  {
    id: "TXN003",
    type: "withdrawal",
    amount: -200.0,
    currency: "USD",
    status: "pending",
    date: "2024-12-14T16:45:00Z",
    description: "Bank Transfer Withdrawal",
    fee: 0,
    method: "Bank ****5678",
  },
  {
    id: "TXN004",
    type: "transfer_in",
    amount: 75.0,
    currency: "USD",
    status: "completed",
    date: "2024-12-14T14:20:00Z",
    description: "Transfer from @SportsBettor",
    fee: 0,
    method: "P2P Transfer",
  },
  {
    id: "TXN005",
    type: "market_trade",
    amount: -25.0,
    currency: "USD",
    status: "completed",
    date: "2024-12-14T11:30:00Z",
    description: "Bitcoin $100K by 2024 - YES",
    fee: 0.5,
    method: "Betting Market",
  },
  {
    id: "TXN006",
    type: "convert",
    amount: 0,
    currency: "USD",
    status: "completed",
    date: "2024-12-13T18:00:00Z",
    description: "Converted 0.001 BTC to $45.23 USD",
    fee: 1.13,
    method: "Currency Exchange",
  },
]

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deposit":
    case "transfer_in":
      return <ArrowDownLeft className="w-4 h-4 text-green-600" />
    case "withdrawal":
    case "transfer_out":
      return <ArrowUpRight className="w-4 h-4 text-red-600" />
    case "convert":
      return <ArrowRightLeft className="w-4 h-4 text-blue-600" />
    case "bet":
      return <Gamepad2 className="w-4 h-4 text-purple-600" />
    case "market_trade":
      return <TrendingUp className="w-4 h-4 text-orange-600" />
    default:
      return <ArrowRightLeft className="w-4 h-4 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}

export function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || tx.type === filterType
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="bet">Bets</SelectItem>
              <SelectItem value="market_trade">Market Trades</SelectItem>
              <SelectItem value="transfer_in">Transfers In</SelectItem>
              <SelectItem value="transfer_out">Transfers Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{transaction.id}</span>
                    <span>•</span>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{transaction.method}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-foreground"}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <Badge variant={getStatusColor(transaction.status)} className="capitalize">
                    {transaction.status}
                  </Badge>
                </div>
                {transaction.fee > 0 && (
                  <p className="text-sm text-muted-foreground">Fee: ${transaction.fee.toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found matching your criteria.</p>
          </div>
        )}

        <div className="text-center">
          <Button variant="outline">Load More Transactions</Button>
        </div>
      </CardContent>
    </Card>
  )
}
