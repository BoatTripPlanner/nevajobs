"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { isCreatorEmail } from "@/lib/admin/creator";
import { useAuth } from "@/components/auth/AuthProvider";
import { isProfileComplete } from "@/lib/profile/profile-service";

export function AuthGate({
  children,
  requireProfile = false,
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const isCreator = isCreatorEmail(user.email);
    if (requireProfile && !isCreator && profile && !isProfileComplete(profile)) {
      router.replace("/profile/setup");
    }
  }, [user, profile, loading, requireProfile, router]);

  const isCreator = isCreatorEmail(user?.email);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (requireProfile && !isCreator && profile && !isProfileComplete(profile)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return children;
}
