import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";

import { checkGroupMembership } from "@/src/services/groupService";
import { errorResponse, successResponse } from "@/src/lib/response";
import { ExpenseStatus } from "@prisma/client";

/**
 * GET /groups/{groupId}/expenses
 * Lists all active expenses for a specific group.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { groupId: string } }
) => {
  try {
    const { userId } = payload;
    const { groupId } = context.params;
    const { searchParams } = new URL(request.url);

    // 401/404 handled internally (same as 1st file)
    await checkGroupMembership(userId, groupId);

    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const expenses = await prisma.expense.findMany({
      where: {
        group_id: groupId,
        status: ExpenseStatus.ACTIVE,
      },
      // Select only the fields specified in the success response
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        category: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        date: "desc",
      },
    });
    return successResponse("Expenses fetched successfully", { expenses });
  } catch (error: any) {
    console.log("Error fetching expenses: ", error);

    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Group not found or unauthorized");
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
