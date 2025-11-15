// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { withAuth } from "../../../../src/middleware/auth";
import { Prisma } from "@prisma/client";
import {
  badRequest,
  errorResponse,
  notFound,
  successResponse,
  unauthorized,
} from "../../../../src/lib/response";

/**
 * GET /users/{userId}
 * Retrieves the public-facing profile of another user.
 */
export async function getHandler(
  request: NextRequest,
  payload: any,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params;

    if (!userId) {
      return badRequest("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, is_deleted: false },
    });

    if (!user) {
      return notFound("User not found");
    }

    const publicProfile = {
      id: user.id,
      name: user.name,
      avatar_url: user.avatar,
    };

    return successResponse(
      "Public facing profiles fetched successfully",
      publicProfile
    );
  } catch (error: any) {
    if (error.message.includes("token") || error.message.includes("header")) {
      return unauthorized();
    }
    return errorResponse("Internal server error");
  }
}

export const GET = withAuth(getHandler);
