import { NextRequest } from "next/server";
import { z } from "zod";
import { FriendshipStatus } from "@prisma/client";
import { prisma } from "@/src/lib/db";
import { formatFriendshipResponse } from "@/src/lib/formatter";
import { withAuth } from "@/src/middleware/auth";
import {
  badRequest,
  conflict,
  created,
  errorResponse,
  notFound,
  successResponse,
  unauthorized,
} from "@/src/lib/response";

const postSchema = z.object({
  addressee_id: z.string().cuid({ message: "Invalid user ID" }),
});

/**
 * POST /friends/requests
 * Sends a friend request to another user.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId: requesterId } = payload;
    const body = await request.json();

    const { addressee_id } = postSchema.parse(body);
    
    if (requesterId === addressee_id) return badRequest("Cannot add yourself");

    const addressee = await prisma.user.findUnique({
      where: { id: addressee_id, is_deleted: false },
    });
    // 400: Cannot add yourself
    if (!addressee) return notFound("User not found");

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requester_id: requesterId, addressee_id: addressee_id },
          { requester_id: addressee_id, addressee_id: requesterId },
        ],
      },
    });

    // 409: A friendship (or pending request) already exists.
    if (existingFriendship)
      return conflict("A friendship or request already exists");

    // Action: Create new Friendship record
    const newFriendship = await prisma.friendship.create({
      data: {
        requester_id: requesterId,
        addressee_id: addressee_id,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: true,
        addressee: true,
      },
    });

    return created(
      "Friend request sent successfully",
      formatFriendshipResponse(newFriendship)
    );
  } catch (error: any) {
    console.error("Error sending friend request:", error);
    if (error instanceof z.ZodError)
      return badRequest("Invalid input", error.issues);

    if (error.message.includes("token")) return unauthorized();

    return errorResponse("Internal Server Error");
  }
};

/**
 * GET /friends/requests
 * Lists all pending friend requests for the authenticated user.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "incoming";

    let whereClause: any;

    if (type === "outgoing") {
      // Requests *I* sent that are pending
      whereClause = {
        requester_id: userId,
        status: FriendshipStatus.PENDING,
      };
    } else {
      // Requests sent *to me* that are pending (default)
      whereClause = {
        addressee_id: userId,
        status: FriendshipStatus.PENDING,
      };
    }

    const requests = await prisma.friendship.findMany({
      where: whereClause,
      include: {
        requester: true,
        addressee: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedRequests = requests.map(formatFriendshipResponse);

    return successResponse("Requests fetched successfully", {
      requests: formattedRequests,
    });
  } catch (error: any) {
    console.error("Error getting pending friend requests:", error);
    if (error.message.includes("token")) return errorResponse("unauthorized");

    return errorResponse("Internal server error");
  }
};

export const POST = withAuth(postHandler);
export const GET = withAuth(getHandler);
