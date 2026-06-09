import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { PlanCheckout } from "@/components/billing/PlanCheckout";
import { Loader2 } from "lucide-react";

export default function BillingUpgradePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-800">
          <span className="text-cyan-600">Neva</span>jobs
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Suspense
          fallback={<Loader2 className="h-8 w-8 animate-spin text-cyan-600" />}
        >
          <PlanCheckout />
        </Suspense>
      </main>
    </div>
  );
}
