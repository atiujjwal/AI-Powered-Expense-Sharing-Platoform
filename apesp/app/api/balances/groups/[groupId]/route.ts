import { NextRequest } from "next/server";
import { Decimal } from "decimal.js";

import { prisma } from "@/src/lib/db";
import { User } from "@prisma/client";

import { withAuth } from "@/src/middleware/auth";
import { errorResponse, successResponse } from "@/src/lib/response";
import { checkGroupMembership } from "@/src/services/groupService";
import { formatPublicUser } from "@/src/lib/formatter";

Decimal.set({ precision: 12 });

/**
 * GET /balances/groups/{groupId}
 * Returns the user's balance inside a specific group.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { groupId: string } }
) => {
  try {
    const { userId } = payload;
    const { groupId } = context.params;

    // 401/404: User must be in the group
    await checkGroupMembership(userId, groupId);

    // Fetch balances for this group involving the user
    const balances = await prisma.balance.findMany({
      where: {
        group_id: groupId,
        OR: [{ user_A_id: userId }, { user_B_id: userId }],
      },
      include: {
        user_a: true,
        user_b: true,
      },
    });

    // Aggregate net per user
    const netBalancePerUser = new Map<string, Decimal>();
    const userDetails = new Map<string, User>();

    for (const b of balances) {
      let myNetChange: Decimal;
      let otherUserId: string;
      let otherUser: User;

      if (b.user_A_id === userId) {
        myNetChange = b.amount;
        otherUserId = b.user_B_id;
        otherUser = b.user_b;
      } else {
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

    // Format final result
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
      if (net.isZero()) continue;

      totalNet = totalNet.add(net);

      const user = formatPublicUser(userDetails.get(otherUserId)!);
      const entry = { ...user, amount: net.abs().toFixed(2) };

      if (net.isPositive()) you_are_owed.push(entry);
      else you_owe.push(entry);
    }

    return successResponse("Group balances fetched successfully", {
      net_balance: totalNet.toFixed(2),
      currency,
      you_are_owed,
      you_owe,
    });
  } catch (error: any) {
    console.log("Error fetching group balances:", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Group not found or unauthorized", 401);
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
