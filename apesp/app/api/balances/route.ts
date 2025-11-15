import { NextRequest } from "next/server";
import { Decimal } from "decimal.js";
import { User } from "@prisma/client";
import { prisma } from "../../../src/lib/db";
import { withAuth } from "../../../src/middleware/auth";

import { errorResponse, successResponse } from "../../../src/lib/response";
import { formatPublicUser } from "../../../src/lib/formatter";

/**
 * GET /balances
 * Returns the authenticated user's complete, simplified financial state,
 * aggregated across all groups and friends.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;

    // Fetch all balance records involving the user
    const balances = await prisma.balance.findMany({
      where: {
        OR: [{ user_A_id: userId }, { user_B_id: userId }],
      },
      include: {
        user_a: true,
        user_b: true,
      },
    });

    // Aggregate net balance per user
    const netBalancePerUser = new Map<string, Decimal>();
    const userDetails = new Map<string, User>();

    for (const b of balances) {
      let myNetChange: Decimal;
      let otherUserId: string;
      let otherUser: User;

      if (b.user_A_id === userId) {
        // I am user_A
        // Positive amount means B owes A (me) -> my net increases
        // Negative amount means A (me) owes B -> my net decreases
        myNetChange = b.amount;
        otherUserId = b.user_B_id;
        otherUser = b.user_b;
      } else {
        // I am user_B.
        // Positive amount means B (me) owes A -> my net decreases
        // Negative amount means A owes B (me) -> my net increases
        myNetChange = b.amount.negated();
        otherUserId = b.user_A_id;
        otherUser = b.user_a;
      }

      const currentNet = netBalancePerUser.get(otherUserId) || new Decimal(0);
      netBalancePerUser.set(otherUserId, currentNet.add(myNetChange));

      if (!userDetails.has(otherUserId)) {
        userDetails.set(otherUserId, otherUser);
      }
    }

    // Process into final response format
    let totalNet = new Decimal(0);
    const you_owe: any[] = [];
    const you_are_owed: any[] = [];

    const currency =
      (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { currency: true },
        })
      )?.currency || "INR";

    for (const [otherUserId, net] of netBalancePerUser.entries()) {
      if (net.isZero()) continue; // No net balance

      totalNet = totalNet.add(net);
      const user = formatPublicUser(userDetails.get(otherUserId)!);
      const entry = { ...user, amount: net.abs().toFixed(2) };

      if (net.isPositive()) {
        // My net is positive, so they owe me
        you_are_owed.push(entry);
      } else {
        // My net is negative, so I owe them
        you_owe.push(entry);
      }
    }

    return successResponse("Balances fetched successfully", {
      net_balance: totalNet.toFixed(2),
      currency,
      you_are_owed,
      you_owe,
    });
  } catch (error: any) {
    console.log("Error fetching balances:", error);
    if (error.message.includes("token")) {
      return errorResponse("Unauthorized");
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
