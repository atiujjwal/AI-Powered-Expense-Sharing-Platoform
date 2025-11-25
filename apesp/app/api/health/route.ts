import { successResponse } from "@/src/lib/response";
import { NextResponse } from "next/server";

export async function GET() {
  return successResponse("Healthy!!", {
    status: "OK",
    timestamp: new Date().toISOString(),
  });
}
