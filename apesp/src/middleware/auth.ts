import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "../lib/auth";

type AppRouteHandler = (
  req: NextRequest,
  payload: any,
  context: { params: any }
) => Promise<Response>;

export function withAuth(handler: AppRouteHandler) {
  return async (req: NextRequest, context: { params: any }) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(token, "accessToken");
      if (!payload) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 }
        );
      }
      const resolvedParams = await context.params;
      return handler(req, payload, { params: resolvedParams });
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Token error" },
        { status: 401 }
      );
    }
  };
}