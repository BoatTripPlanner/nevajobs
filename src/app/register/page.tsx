import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-white">
          <span className="text-cyan-400">Neva</span>jobs
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <RegisterForm />
      </main>
    </div>
  );
}
