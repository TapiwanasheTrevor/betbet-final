import { WalletOverview } from "@/components/wallet/wallet-overview"
import { QuickActions } from "@/components/wallet/quick-actions"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { PaymentMethods } from "@/components/wallet/payment-methods"

export default function WalletPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground text-lg">
          Manage your funds with multi-currency support and instant transfers
        </p>
      </div>

      <WalletOverview />
      <QuickActions />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
        <div>
          <PaymentMethods />
        </div>
      </div>
    </div>
  )
}
