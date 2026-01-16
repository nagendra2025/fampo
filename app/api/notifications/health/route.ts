import { NextResponse } from "next/server";
import { format } from "date-fns";

/**
 * Health check endpoint for cron jobs
 * Simple endpoint to verify cron execution is working
 */
export async function GET(request: Request) {
  const now = new Date();
  const timestamp = format(now, "yyyy-MM-dd HH:mm:ss");
  
  console.log(`[HEALTH] ===== HEALTH CHECK CALLED ===== ${timestamp} UTC`);
  console.log(`[HEALTH] Request URL: ${request.url}`);
  console.log(`[HEALTH] Request method: ${request.method}`);
  console.log(`[HEALTH] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  return NextResponse.json({
    success: true,
    message: "Health check endpoint is working",
    timestamp: `${timestamp} UTC`,
    endpoint: "/api/notifications/health",
    environment: process.env.NODE_ENV || "unknown",
  });
}

