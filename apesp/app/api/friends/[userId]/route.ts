// app/api/friends/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { FriendshipStatus } from "@prisma/client";
import { withAuth } from "../../../../src/middleware/auth";
import {
  errorResponse,
  noContent,
  unauthorized,
} from "../../../../src/lib/response";

/**
 * DELETE /friends/{userId}
 * Removes a friend ("unfriends" a user) by their user ID.
 */
const deleteHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { userId: string } }
) => {
  try {
    const { userId: myId } = payload;
    const { userId: friendId } = context.params;

    // Action: Find the Friendship record where status == ACCEPTED
    // and the two users are 'me' and '{userId}'.
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { requester_id: myId, addressee_id: friendId },
          { requester_id: friendId, addressee_id: myId },
        ],
      },
    });

    // 404: Friendship not found. Idempotent: If not found, it's a success.
    if (!friendship) {
      return noContent();
    }

    // Now, delete this friendship record.
    // We also delete any non-group balance between them.
    const [user_A_id, user_B_id] = [myId, friendId].sort();

    await prisma.$transaction([
      // Delete the friendship
      prisma.friendship.delete({
        where: { id: friendship.id },
      }),
      // Delete the non-group balance
      prisma.balance.deleteMany({
        where: {
          group_id: null,
          user_A_id: user_A_id,
          user_B_id: user_B_id,
        },
      }),
    ]);

    return noContent();
  } catch (error: any) {
    console.log("Error in DELETE friend: ", error);
    if (error.message.includes("token")) {
      return errorResponse("unauthorized");
    }
    // Handle case where record is already deleted
    if (error.code === "P2025") {
      return noContent();
    }
    return errorResponse("Internal server error");
  }
};

export const DELETE = withAuth(deleteHandler);
