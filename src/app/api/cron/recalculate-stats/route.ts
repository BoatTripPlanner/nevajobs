import { refreshLiveStats } from "@/lib/data/live-stats-server";

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (secret && !isVercelCron && authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await refreshLiveStats();
    return Response.json({ ok: true, stats });
  } catch (error) {
    console.error("[recalculate-stats]", error);
    return Response.json({ error: "Failed to recalculate" }, { status: 500 });
  }
}
