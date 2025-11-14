import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import {
  verifyToken,
  generateToken,
  getTokenFromRequest,
} from "../../../../src/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getTokenFromRequest(request);
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const payload = verifyToken(refreshToken, "refreshToken");
    if (!payload)
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );

    // Lookup session
    const { userId, sessionId } = payload;

    const tokenRecord = await prisma.userToken.findFirst({
      where: {
        token: refreshToken,
        session_id: sessionId,
        user_id: userId,
      },
    });

    if (!tokenRecord || tokenRecord.expires_at < new Date())
      return NextResponse.json(
        { error: "Invalid/expired refresh token" },
        { status: 401 }
      );

    // Rotate tokens for this session
    const newAccessToken = generateToken(
      String(userId),
      String(sessionId),
      "accessToken"
    );
    const newRefreshToken = generateToken(
      String(userId),
      String(sessionId),
      "refreshToken"
    );

    await prisma.userToken.create({
      data: {
        user_id: userId,
        session_id: sessionId,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    //delete existing token
    await prisma.userToken.delete({ where: { token: refreshToken } });

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid refresh flow" },
      { status: 401 }
    );
  }
}
