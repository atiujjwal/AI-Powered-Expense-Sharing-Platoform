import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { FriendshipStatus } from "@prisma/client";
import { formatPublicUser } from "../../../src/lib/formatter";
import { withAuth } from "../../../src/middleware/auth";
import { errorResponse, successResponse } from "../../../src/lib/response";

/**
 * GET /friends
 * Lists all accepted friends of the authenticated user.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Action: Query Friendship table where status == ACCEPTED
    // and user is either the requester or addressee.
    const friendships = await prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requester_id: userId }, { addressee_id: userId }],
      },
      include: {
        requester: true,
        addressee: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        updated_at: "desc",
      },
    });

    // We need to return an array of User objects, not Friendship objects.
    // Map over the friendships and pull out the *other* user.
    const friends = friendships.map((friendship) => {
      const friendUser =
        friendship.requester_id === userId
          ? friendship.addressee
          : friendship.requester;
      return formatPublicUser(friendUser);
    });

    return successResponse("Friends fetched successfully", {
      friends: friends,
    });
  } catch (error: any) {
    console.error("Error in GET getting all friend requests:", error);
    if (error.message.includes("token")) {
      return errorResponse("Unauthorized");
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
