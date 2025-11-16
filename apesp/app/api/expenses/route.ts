import { NextRequest } from "next/server";
import { z } from "zod";
import { Decimal } from "decimal.js";

import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";

import { checkGroupMembership } from "@/src/services/groupService";
import { created, errorResponse, successResponse } from "@/src/lib/response";
import { jobQueue } from "@/src/lib/queue";
import {
  ExpenseBodySchema,
  validateAndProcessExpense,
} from "@/src/services/expenseService";

Decimal.set({ precision: 12 });

/**
 * POST /expenses
 * Creates a new expense, calculates splits, and triggers a balance update.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const body = await request.json();

    // Validate payload
    const parsedBody = ExpenseBodySchema.parse(body);

    // Authorization check: user is in the group
    await checkGroupMembership(userId, parsedBody.group_id);

    // Fetch group members
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

    // Create records in a single database transaction
    const newExpense = await prisma.$transaction(async (tx) => {
      // Create the main Expense record
      const expense = await tx.expense.create({
        data: {
          group_id: parsedBody.group_id,
          created_by_id: userId,
          description: parsedBody.description,
          amount: new Decimal(parsedBody.amount),
          currency: "INR",
          category: parsedBody.category,
          date: parsedBody.date,
          receipt_url: parsedBody.receipt_url,
          status: "ACTIVE",
        },
      });
      // Create related ExpensePayer records
      await tx.expensePayer.createMany({
        data: payerData.map((p) => ({
          expense_id: expense.id,
          user_id: p.user_id,
          amount: p.amount,
        })),
      });
      // Create related ExpensePayer records
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
    await jobQueue.add("recalculate-balance", { expenseId: newExpense.id });

    // Fetch and return the complete record
    const completeExpense = await prisma.expense.findUnique({
      where: { id: newExpense.id },
      include: {
        payers: true, // might need formatting here
        splits: true,
      },
    });

    return created("Expense created successfully", completeExpense);
  } catch (error: any) {
    console.log("Error creating expense: ", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid input", 400, "BAD_REQUEST", error.issues);
    }
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Group not found or unauthorized");
    }
    // Custom validation errors from helper
    if (
      error.message.includes("sum") ||
      error.message.includes("is not in the group")
    ) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error");
  }
};

export const POST = withAuth(postHandler);
