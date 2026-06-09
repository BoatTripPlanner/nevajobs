import { verifyAdminToken } from "@/lib/auth/verify-admin";
import { planToEsPremium } from "@/lib/billing/plans";
import { setUserPlan, addCredits } from "@/lib/stripe-premium";
import type { PlanEmpresa } from "@/types";

export async function POST(request: Request) {
  const admin = await verifyAdminToken(request.headers.get("authorization"));
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    uid?: string;
    plan?: PlanEmpresa;
    add_credits?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.uid) {
    return Response.json({ error: "Missing uid" }, { status: 400 });
  }

  const validPlans: PlanEmpresa[] = ["gratis", "starter", "pro", "enterprise"];
  if (body.plan && validPlans.includes(body.plan as PlanEmpresa)) {
    await setUserPlan(body.uid, body.plan as PlanEmpresa, { resetMonthlyUsage: true });
  }

  if (body.add_credits && body.add_credits > 0) {
    await addCredits(body.uid, Math.min(body.add_credits, 100));
  }

  return Response.json({
    ok: true,
    plan: body.plan,
    es_premium: body.plan ? planToEsPremium(body.plan as PlanEmpresa) : undefined,
  });
}
