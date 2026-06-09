import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { RolUsuario } from "@/types";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; rol?: string }>;
}) {
  const params = await searchParams;
  const isPremium = params.plan === "premium";
  const defaultRol: RolUsuario | undefined =
    params.rol === "empresa" || isPremium ? "empresa" : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-800">
          <span className="text-cyan-600">Neva</span>jobs
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <RegisterForm
          defaultRol={defaultRol}
          redirectAfter={isPremium ? "/billing/upgrade" : "/"}
        />
      </main>
    </div>
  );
}
