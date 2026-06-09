import { fetchAdminDashboardData } from "@/lib/admin/admin-stats-server";
import { verifyAdminToken } from "@/lib/auth/verify-admin";

export async function GET(request: Request) {
  const admin = await verifyAdminToken(request.headers.get("authorization"));
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await fetchAdminDashboardData();
    return Response.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Admin stats unavailable";
    console.error("[admin/stats]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
