// Protected routes

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Attach user to request
    request.user = payload;

    return handler(request, ...args);
  };
}
