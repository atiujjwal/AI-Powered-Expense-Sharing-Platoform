// app/api/groups/[groupId]/leave/route.ts
import { NextRequest } from "next/server";
import { GroupRole } from "@prisma/client";
import { prisma } from "@/src/lib/db";
import {
  errorResponse,
  forbidden,
  noContent,
  notFound,
  unauthorized,
} from "@/src/lib/response";

/**
 * POST /groups/{groupId}/leave
 * A convenience endpoint for the authenticated user to leave a group.
 */
export async function postHandler(
  request: NextRequest,
  payload: { userId: string },
  context: { params: { groupId: string } }
) {
  try {
    const { userId: authUserId } = payload;
    const { groupId } = context.params;

    // Find the group to check owner
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { owner_id: true },
    });

    if (!group) return notFound("Group not found");

    // Business Logic: Prevent owner from leaving
    if (group.owner_id === authUserId) {
      return forbidden(
        "Owner cannot leave the group. Delete the group or transfer ownership first."
      );
    }

    // Business Logic: Prevent last admin from leaving
    const membership = await prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: authUserId,
        },
      },
    });

    if (!membership) return notFound("Group membership not found");

    if (membership.role === GroupRole.ADMIN) {
      const adminCount = await prisma.groupMember.count({
        where: { group_id: groupId, role: GroupRole.ADMIN },
      });
      if (adminCount <= 1) {
        return forbidden(
          "Cannot leave as the last admin. Promote another user first."
        );
      }
    }

    // Delete the membership
    await prisma.groupMember.delete({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: authUserId,
        },
      },
    });

    return noContent();
  } catch (error: any) {
    console.log("Error leaving group: ", error);
    if (error.message.includes("token")) return unauthorized();
    if (error.code === "P2025") return notFound("Group or user membership");
    return errorResponse("Internal server error");
  }
}

export const POST = postHandler;
