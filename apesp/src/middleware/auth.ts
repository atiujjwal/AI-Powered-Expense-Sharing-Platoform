import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "../lib/auth";


export function withAuth(
  handler: (req: NextRequest, payload: any) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }
    const payload = verifyToken(token, "accessToken");
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }
    return handler(req, payload);
  };
}
