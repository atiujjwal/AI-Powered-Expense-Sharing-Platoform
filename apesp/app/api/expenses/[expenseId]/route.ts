import { NextRequest } from "next/server";
import { Decimal } from "decimal.js";
import { z } from "zod";

import { GroupRole } from "@prisma/client";
import { jobQueue } from "../../../../src/lib/queue";
import { prisma } from "../../../../src/lib/db";
import { withAuth } from "../../../../src/middleware/auth";
import { checkGroupMembership } from "../../../../src/services/groupService";
import {
  errorResponse,
  notFound,
  successResponse,
  noContent,
  forbidden,
} from "../../../../src/lib/response";
import { formatDetailedExpense } from "../../../../src/lib/formatter";
import {
  ExpenseBodySchema,
  validateAndProcessExpense,
} from "../../../../src/services/expenseService";

/**
 * GET /expenses/{expenseId}
 * Retrieves a single expense in full detail.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { expenseId: string } }
) => {
  try {
    const { userId } = payload;
    const { expenseId } = context.params;

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        created_by: true,
        payers: { include: { user: true } },
        splits: { include: { user: true } },
      },
    });

    if (!expense) return notFound("Expense not found");

    //401: Unauthorized (User is not part of the group)
    await checkGroupMembership(userId, expense.group_id);

    return successResponse(
      "Expense fetched successfully",
      formatDetailedExpense(expense)
    );
  } catch (error: any) {
    console.log("Error fetching expense:", error);

    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Expense not found or unauthorized");
    }

    return errorResponse("Internal server error");
  }
};

/**
 * PUT /expenses/{expenseId}
 * Updates an existing expense.
 */
const putHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { expenseId: string } }
) => {
  try {
    const { userId } = payload;
    const { expenseId } = context.params;
    const body = await request.json();

    // Validate payload
    const parsedBody = ExpenseBodySchema.parse(body);

    // Authorize: Check user is in the group
    await checkGroupMembership(userId, parsedBody.group_id);

    // Get all group members for validation
    const members = await prisma.groupMember.findMany({
      where: { group_id: parsedBody.group_id },
      select: { user_id: true },
    });
    const memberIds = new Set(members.map((m) => m.user_id));

    // Process & Validate Logic
    const { payerData, splitData } = validateAndProcessExpense(
      parsedBody,
      memberIds
    );

    // Update records in a single db transaction
    const updatedExpense = await prisma.$transaction(async (tx) => {
      // Check if expense exists
      const existing = await tx.expense.findUnique({
        where: { id: expenseId },
      });
      if (!existing) throw new Error("NOT_FOUND");

      // Check if group_id matches
      if (existing.group_id !== parsedBody.group_id) {
        throw new Error("Group ID cannot be changed");
      }

      // Delete old payers and splits
      await tx.expensePayer.deleteMany({ where: { expense_id: expenseId } });
      await tx.expenseSplit.deleteMany({ where: { expense_id: expenseId } });

      // Update the main Expense record
      const expense = await tx.expense.update({
        where: { id: expenseId },
        data: {
          description: parsedBody.description,
          amount: new Decimal(parsedBody.amount),
          category: parsedBody.category,
          date: parsedBody.date,
          receipt_url: parsedBody.receipt_url,
        },
      });
      // Create new related ExpensePayer records
      await tx.expensePayer.createMany({
        data: payerData.map((p) => ({
          expense_id: expense.id,
          user_id: p.user_id,
          amount: p.amount,
        })),
      });
      // Create new related ExpenseSplit records
      await tx.expenseSplit.createMany({
        data: splitData.map((s) => ({
          expense_id: expense.id,
          user_id: s.user_id,
          amount_owed: s.amount_owed,
          percent_owed: s.percent_owed,
          shares_owed: s.shares_owed,
        })),
      });

      return expense;
    });

    // Enqueue the asynchronous balance update job
    await jobQueue.add("recalculate-balance", { expenseId: updatedExpense.id });

    // Fetch and return the complete record
    const completeExpense = await prisma.expense.findUnique({
      where: { id: updatedExpense.id },
      include: {
        created_by: true,
        payers: { include: { user: true } },
        splits: { include: { user: true } },
      },
    });

    return successResponse(
      "Expense updated successfully",
      formatDetailedExpense(completeExpense)
    );
  } catch (error: any) {
    console.log("Error updating expense:", error);

    if (error instanceof z.ZodError)
      return errorResponse("Invalid input", 400, "BAD_REQUEST", error.issues);

    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND") return notFound("Expense");
    if (error.message === "Group ID cannot be changed") {
      return errorResponse("Group ID cannot be changed", 400);
    }
    if (
      error.message.includes("sum") ||
      error.message.includes("is not in the group")
    ) {
      return errorResponse(error.message, 400);
    }

    return errorResponse("Internal server error");
  }
};

/**
 * DELETE /expenses/{expenseId}
 * Deletes an expense.
 */
const deleteHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { expenseId: string } }
) => {
  try {
    const { userId } = payload;
    const { expenseId } = context.params;

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) return notFound("Expense not found");

    const membership = await checkGroupMembership(userId, expense.group_id);

    // 403: Forbidden (User is not the creator or an ADMIN)
    if (
      expense.created_by_id !== userId &&
      membership.role !== GroupRole.ADMIN
    ) {
      return forbidden();
    }

    // Action: Delete the expense.
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    // Enqueue the "undo" job. Pass all necessary data for recalculation.
    await jobQueue.add("recalculate-balance-delete", {
      deletedExpense: expense,
    });

    return noContent();
  } catch (error: any) {
    console.log("Error deleting expense:", error);

    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Expense not found or unauthorized");
    }

    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
