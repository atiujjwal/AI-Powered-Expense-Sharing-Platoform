import { NextRequest } from "next/server";

import { FriendshipStatus } from "@prisma/client";
import {
  badRequest,
  errorResponse,
  notFound,
  successResponse,
  unauthorized,
} from "@/src/lib/response";
import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";

/**
 * POST /users/{userId}/block
 * Blocks a user, preventing all interaction.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { userId: string } }
) => {
  try {
    const { userId: myId } = payload;
    const { userId: userToBlockId } = context.params;

    // 400: Cannot block yourself
    if (myId === userToBlockId) return badRequest("Cannot block yourself");

    // 404: User not found
    const userToBlock = await prisma.user.findUnique({
      where: { id: userToBlockId, is_deleted: false },
    });
    if (!userToBlock) return notFound("User not found");

    // Determine alphabetical order for user_A_id and user_B_id
    const [user_A_id, user_B_id] = [myId, userToBlockId].sort();

    // Action: Creates or updates a Friendship record, setting status: BLOCKED
    const [_, blockedFriendship] = await prisma.$transaction([
      // Delete any and all existing relationships between these two users
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { requester_id: myId, addressee_id: userToBlockId },
            { requester_id: userToBlockId, addressee_id: myId },
          ],
        },
      }),

      // Create the new "BLOCKED" record, with me as the requester
      prisma.friendship.create({
        data: {
          requester_id: myId,
          addressee_id: userToBlockId,
          status: FriendshipStatus.BLOCKED,
        },
      }),

      // Delete any existing Balance records (as per spec)
      prisma.balance.deleteMany({
        where: {
          user_A_id: user_A_id,
          user_B_id: user_B_id,
          // This deletes both non-group and all group balances
        },
      }),
    ]);

    return successResponse("User blocked successfully.", {
      id: blockedFriendship.id,
      status: blockedFriendship.status,
    });
  } catch (error: any) {
    console.log("Error blocking the user: ", error);
    if (error.message.includes("token")) {
      return unauthorized();
    }
    return errorResponse("Internal server error");
  }
};

export const POST = withAuth(postHandler);
