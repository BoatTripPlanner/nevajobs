import { Link } from "@/i18n/navigation";
import { AuthGate } from "@/components/auth/AuthGate";
import { ProfileSetupForm } from "@/components/profile/ProfileSetupForm";

export default function ProfileSetupPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
        <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold text-slate-800">
            <span className="text-cyan-600">Neva</span>jobs
          </Link>
        </header>
        <main className="flex justify-center px-4 py-12 sm:py-16">
          <ProfileSetupForm />
        </main>
      </div>
    </AuthGate>
  );
}
