import { fetchStripeRevenueData } from "@/lib/admin/stripe-revenue-server";
import { verifyAdminToken } from "@/lib/auth/verify-admin";

export async function GET(request: Request) {
  const admin = await verifyAdminToken(request.headers.get("authorization"));
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await fetchStripeRevenueData();
    return Response.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe revenue unavailable";
    return Response.json({ error: message }, { status: 500 });
  }
}
