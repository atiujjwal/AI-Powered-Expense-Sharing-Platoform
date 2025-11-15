// app/api/balances/friends/[userId]/route.ts
import { NextRequest } from "next/server";
import { Decimal } from "decimal.js";

import { prisma } from "../../../../../src/lib/db";
import { withAuth } from "../../../../../src/middleware/auth";

import {
  errorResponse,
  successResponse,
  notFound,
  badRequest,
  forbidden,
} from "../../../../../src/lib/response";

/**
 * GET /balances/friends/{userId}
 * Returns the net balance between the user and a specific friend.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { userId: string } }
) => {
  try {
    const { userId: myId } = payload;
    const { userId: friendId } = context.params;

    if (myId === friendId) {
      return forbidden("Invalid request");
    }

    // 404: User not found
    const friend = await prisma.user.findUnique({
      where: { id: friendId, is_deleted: false },
    });

    if (!friend) {
      return notFound("User not found");
    }

    // Sort IDs to match Balance table convention
    const [user_A_id, user_B_id] = [myId, friendId].sort();

    // Fetch all balance records between these two users
    const balances = await prisma.balance.findMany({
      where: {
        user_A_id,
        user_B_id,
      },
    });

    let net_balance = new Decimal(0);

    // Aggregate balances
    for (const b of balances) {
      if (myId === b.user_A_id) {
        net_balance = net_balance.add(b.amount);
      } else {
        net_balance = net_balance.sub(b.amount);
      }
    }

    // Get currency
    const currency =
      (
        await prisma.user.findUnique({
          where: { id: myId },
          select: { currency: true },
        })
      )?.currency || "INR";

    // Positive = user is owed. Negative = user owes.
    return successResponse("Balance fetched successfully", {
      amount: net_balance.toFixed(2),
      currency,
    });
  } catch (error: any) {
    console.log("Error fetching friend balance:", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
