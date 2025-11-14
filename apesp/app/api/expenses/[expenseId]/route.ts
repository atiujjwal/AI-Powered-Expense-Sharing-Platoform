// GET, PATCH, DELETE

import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { withAuth } from "../../../../src/middleware/auth";

// app/api/expenses/[expenseId]/route.ts
export const GET = withAuth(async (request, { params }) => {
  const { expenseId } = params;
  const expense = await prisma.groupExpense.findUnique({
    where: { id: expenseId },
    include: { splits: true },
  });
  if (!expense)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: expense });
});

export const DELETE = withAuth(async (request, { params }) => {
  const { expenseId } = params;
  // TODO: Permissions
  await prisma.groupExpense.delete({ where: { id: expenseId } });
  return NextResponse.json({ success: true });
});
