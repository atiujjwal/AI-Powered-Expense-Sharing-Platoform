import { NextRequest } from "next/server";
import { prisma } from "../../../../../../src/lib/db";
import { withAuth } from "../../../../../../src/middleware/auth";
import { FriendshipStatus } from "@prisma/client";
import {
  successResponse,
  errorResponse,
  notFound,
  forbidden,
  badRequest,
  noContent,
  conflict,
  unauthorized,
} from "../../../../../../src/lib/response";

/**
 * DELETE /friends/requests/{requestId}/reject
 * Rejects an incoming friend request or revokes an outgoing one.
 */
const deleteHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { requestId: string } }
) => {
  try {
    const { userId } = payload;
    const { requestId } = context.params;

    // Validate requestId format
    if (!requestId || requestId.trim() === "") {
      return badRequest("Invalid request ID provided");
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    // 404: Request not found
    if (!friendship) {
      return notFound("Friend request not found");
    }

    // 401: Unauthorized (User is not the requester OR addressee)
    if (
      friendship.requester_id !== userId &&
      friendship.addressee_id !== userId
    ) {
      return forbidden("You don't have permission to reject this request");
    }

    // Check friendship status and provide appropriate message
    if (friendship.status === FriendshipStatus.PENDING) {
      if (friendship.addressee_id === userId) {
        // Current user is the recipient, rejecting the request
        await prisma.friendship.delete({
          where: { id: requestId },
        });

        return successResponse("Friend request rejected successfully", {
          requestId,
          status: "rejected",
        });
      } else if (friendship.requester_id === userId) {
        // Current user is the sender, canceling the request
        await prisma.friendship.delete({
          where: { id: requestId },
        });

        return successResponse("Friend request cancelled successfully", {
          requestId,
          status: "cancelled",
        });
      }
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      return badRequest("Cannot reject an accepted friend request.");
    }

    if (friendship.status === FriendshipStatus.BLOCKED) {
      return badRequest("This user has been blocked");
    }

    // Fallback: Delete the friendship record
    await prisma.friendship.delete({
      where: { id: requestId },
    });

    return successResponse("Request deleted successfully", {
      requestId,
    });
  } catch (error: any) {
    console.error("Error in DELETE rejecting friend request:", error);
    // Handle Prisma errors
    if (error.code === "P2025") {
      return notFound("Friend request not found");
    }

    if (error.message.includes("token")) {
      return errorResponse("unauthorized");
    }

    if (error.message.includes("Unique constraint failed")) {
      return conflict("This friendship request already exists");
    }
    return errorResponse("Failed to process request.");
  }
};

export const DELETE = withAuth(deleteHandler);
