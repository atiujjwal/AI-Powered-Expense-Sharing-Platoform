import { GroupRole } from "@prisma/client";
import { prisma } from "../lib/db";

/**
 * Checks if a user is a member of a group.
 * Throws an error if the group or membership doesn't exist.
 */
export async function checkGroupMembership(userId: string, groupId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: {
      group_id_user_id: {
        group_id: groupId,
        user_id: userId,
      },
    },
  });

  if (!membership) {
    throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
  }
  return membership;
}

/**
 * Checks if a user is an ADMIN of a group.
 * Throws an error if they are not an admin.
 */
export async function checkGroupAdmin(userId: string, groupId: string) {
  const membership = await checkGroupMembership(userId, groupId);

  if (membership.role !== GroupRole.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return membership;
}
