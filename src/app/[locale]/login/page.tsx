import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-800">
          <span className="text-cyan-600">Neva</span>jobs
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <LoginForm />
      </main>
    </div>
  );
}
