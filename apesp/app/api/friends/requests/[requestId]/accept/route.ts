// app/api/friends/requests/[requestId]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { FriendshipStatus } from "@prisma/client";
import { prisma } from "../../../../../../src/lib/db";
import { formatFriendshipResponse } from "../../../../../../src/lib/formatter";
import { withAuth } from "../../../../../../src/middleware/auth";
import {
  errorResponse,
  notFound,
  successResponse,
  unauthorized,
} from "../../../../../../src/lib/response";

/**
 * POST /friends/requests/{requestId}/accept
 * Accepts a pending friend request.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { requestId: string } }
) => {
  try {
    const { userId } = payload;
    const { requestId } = context.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    // 404: Request not found
    if (!friendship) {
      return notFound("Request not found");
    }

    // 401: Unauthorized (User is not the addressee of this request)
    if (friendship.addressee_id !== userId) {
      return unauthorized();
    }

    // Check if already accepted to maintain idempotency
    if (friendship.status === FriendshipStatus.ACCEPTED) {
      const existing = await prisma.friendship.findUnique({
        where: { id: requestId },
        include: { requester: true, addressee: true },
      });
      return successResponse(
        "Friendship accepted successfully",
        formatFriendshipResponse(existing)
      );
    }

    // Action: Update the Friendship record's status to ACCEPTED
    const updatedFriendship = await prisma.friendship.update({
      where: {
        id: requestId,
        status: FriendshipStatus.PENDING,
      },
      data: { status: FriendshipStatus.ACCEPTED },
      include: {
        requester: true,
        addressee: true,
      },
    });

    return successResponse(
      "Friendship accepted successfully",
      formatFriendshipResponse(updatedFriendship)
    );
  } catch (error: any) {
    console.log("Error in POST accepting friend request: ", error);
    if (error.message.includes("token")) {
      return errorResponse("unauthorized");
    }
    // Handle case where request was not found or not pending (e.g., race condition)
    if (error.code === "P2025" || error.code === "P2016") {
      return notFound("Request not found or already handled");
    }
    return errorResponse("Internal server error");
  }
};

export const POST = withAuth(postHandler);
