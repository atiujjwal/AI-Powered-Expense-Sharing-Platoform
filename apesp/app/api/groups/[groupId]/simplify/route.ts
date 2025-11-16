import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";
import { checkGroupMembership } from "@/src/services/groupService";
import { errorResponse, successResponse } from "@/src/lib/response";
import { simplifyGroupDebts } from "@/src/services/balanceService";

/**
 * GET /groups/{groupId}/simplify
 * Calculates the minimum number of transactions to settle all debts.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { groupId: string } }
) => {
  try {
    const { userId } = payload;
    const { groupId } = context.params;

    // 401/404: Ensure user is part of this group
    await checkGroupMembership(userId, groupId);

    // Fetch all balance records for this group
    const groupBalances = await prisma.balance.findMany({
      where: {
        group_id: groupId,
      },
      include: {
        user_a: true,
        user_b: true,
      },
    });

    // Run the debt minimization algorithm
    const optimized_payments = simplifyGroupDebts(groupBalances);

    return successResponse(
      "Simplified group debt settlement calculated successfully",
      { optimized_payments }
    );
  } catch (error: any) {
    console.log("Error simplifying group debts:", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Group not found or unauthorized");
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
