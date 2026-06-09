import { fetchAdminDashboardData } from "@/lib/admin/admin-stats-server";
import { verifyAdminToken } from "@/lib/auth/verify-admin";

export async function GET(request: Request) {
  const admin = await verifyAdminToken(request.headers.get("authorization"));
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await fetchAdminDashboardData();
  return Response.json(data);
}
