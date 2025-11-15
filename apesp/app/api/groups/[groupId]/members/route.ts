import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../src/lib/db";
import { withAuth } from "../../../../../src/middleware/auth";

import {
  checkGroupMembership,
  checkGroupAdmin,
} from "../../../../../src/services/groupService";

import {
  errorResponse,
  successResponse,
  notFound,
  created,
} from "../../../../../src/lib/response";

import { formatGroupMember } from "../../../../../src/lib/formatter";

import { GroupRole } from "@prisma/client";

const addMemberSchema = z.object({
  user_id: z.string().cuid(),
  role: z.enum([GroupRole.ADMIN, GroupRole.MEMBER]).default(GroupRole.MEMBER),
});

/**
 * GET /groups/{groupId}/members
 * Lists all members of a specific group.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { groupId: string } }
) => {
  try {
    const { userId } = payload;
    const { groupId } = context.params;

    // 401: Unauthorized (User not a member)
    await checkGroupMembership(userId, groupId);

    const members = await prisma.groupMember.findMany({
      where: { group_id: groupId },
      include: {
        user: true, // Include the public user data
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return successResponse(
      "Group members fetched successfully",
      members.map(formatGroupMember)
    );
  } catch (error: any) {
    console.log("Error fetching group members:", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Group not found or unauthorized");
    }
    return errorResponse("Internal server error");
  }
};

/**
 * POST /groups/{groupId}/members
 * Adds a user to a group. Requires ADMIN role.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string },
  context: { params: { groupId: string } }
) => {
  try {
    const { userId } = payload;
    const { groupId } = context.params;
    const body = await request.json();

    // 403: Forbidden (User is not an ADMIN).
    await checkGroupAdmin(userId, groupId);

    const parseResult = addMemberSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        "Invalid input",
        400,
        "BAD_REQUEST",
        parseResult.error.issues
      );
    }

    const { user_id: userToAddId, role } = parseResult.data;

    // 404: User not found
    const userToAdd = await prisma.user.findUnique({
      where: { id: userToAddId, is_deleted: false },
    });

    if (!userToAdd) {
      return notFound("User");
    }

    // 409: User is already a member
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: userToAddId,
        },
      },
    });

    if (existingMembership) {
      return errorResponse("User is already a member", 409);
    }

    // Create membership
    const newMember = await prisma.groupMember.create({
      data: {
        group_id: groupId,
        user_id: userToAddId,
        role,
      },
      include: {
        user: true,
      },
    });

    return created("Member added successfully", formatGroupMember(newMember));
  } catch (error: any) {
    console.log("Error adding member:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid input", 400, "BAD_REQUEST", error.issues);
    }
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    if (error.message === "FORBIDDEN") return errorResponse("Forbidden");
    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return notFound("Group"); // 404
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
