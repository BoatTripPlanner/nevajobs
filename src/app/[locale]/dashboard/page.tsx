import { AuthGate } from "@/components/auth/AuthGate";
import { DashboardShell } from "@/components/profile/DashboardShell";

export default function DashboardPage() {
  return (
    <AuthGate requireProfile>
      <DashboardShell />
    </AuthGate>
  );
}
