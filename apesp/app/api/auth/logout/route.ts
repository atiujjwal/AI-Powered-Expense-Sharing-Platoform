import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { withAuth } from "../../../../src/middleware/auth";
import { Prisma } from "@prisma/client";

async function handler(
  req: NextRequest,
  payload: { userId: string; sessionId: string }
) {
  const { userId, sessionId } = payload;
  let body;

  try {
    body = await req.json();
  } catch (error) {
    body = {};
  }

  const logoutAll = body.logout_all === true;

  // Use a transaction to ensure both delete operations succeed or fail together
  try {
    if (logoutAll) {
      // Logout from ALL devices
      await prisma.$transaction([
        prisma.userToken.deleteMany({
          where: { user_id: userId },
        }),
        prisma.session.deleteMany({
          where: { user_id: userId },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Logged out from all devices.",
      });
    }

    // Default: logout only from this device
    await prisma.$transaction([
      prisma.userToken.deleteMany({
        where: { user_id: userId, session_id: sessionId },
      }),
      prisma.session.delete({
        where: { id: sessionId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Logged out from this device.",
    });
  } catch (error) {
    console.error("Logout failed:", error);

    // Handle Prisma-specific errors, like "Record to delete not found"
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // This means the session was already deleted. We can consider this a "success".
        return NextResponse.json({
          success: true,
          message: "Session already logged out.",
        });
      }
    }

    // Generic server error
    return NextResponse.json(
      { success: false, message: "An error occurred during logout." },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
