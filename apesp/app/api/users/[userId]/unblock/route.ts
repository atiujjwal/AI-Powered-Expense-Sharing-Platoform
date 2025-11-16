import { NextRequest } from "next/server";
import { FriendshipStatus } from "@prisma/client";
import { withAuth } from "@/src/middleware/auth";
import { prisma } from "@/src/lib/db";
import {
  errorResponse,
  forbidden,
  noContent,
  unauthorized,
} from "@/src/lib/response";

/**
 * DELETE /users/{userId}/unblock
 * Unblocks a previously blocked user.
 */
const deleteHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { userId: string } }
) => {
  try {
    const { userId: myId } = payload;
    const { userId: userToUnblockId } = context.params;

    // Action: Find and delete the Friendship record where status == BLOCKED.
    // IMPORTANT: I must be the one who *initiated* the block (the requester).
    // cannot unblock someone who blocked you.
    const deleteResult = await prisma.friendship.deleteMany({
      where: {
        requester_id: myId,
        addressee_id: userToUnblockId,
        status: FriendshipStatus.BLOCKED,
      },
    });

    // 404: User is not blocked (or not blocked by you)
    // Idempotency: If deleteResult.count is 0, it means it was already gone
    // or never existed, which is a successful "unblocked" state.
    if (deleteResult.count === 0) {
      const existingBlock = await prisma.friendship.findFirst({
        where: {
          requester_id: userToUnblockId, // Check if *they* blocked *me*
          addressee_id: myId,
          status: FriendshipStatus.BLOCKED,
        },
      });

      if (existingBlock)
        return forbidden("Cannot unblock a user who has blocked you");
    }
    return noContent();
  } catch (error: any) {
    console.log("Error unblocking the user: ", error);
    if (error.message.includes("token")) return unauthorized();

    return errorResponse("Internal server error");
  }
};

export const DELETE = withAuth(deleteHandler);
