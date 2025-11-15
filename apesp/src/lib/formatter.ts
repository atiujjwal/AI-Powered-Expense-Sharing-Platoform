import { User } from "@prisma/client";

/**
 * Formats a User object into the public-facing friend profile.
 * Maps 'avatar' (schema) to 'avatar_url' (API spec).
 */
export const formatPublicUser = (user: User) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar, // Maps schema 'avatar' to API 'avatar_url'
  };
};

/**
 * Formats a Friendship object into the standard API response,
 * including nested, formatted user objects.
 */
export const formatFriendshipResponse = (friendship: any) => {
  return {
    id: friendship.id,
    status: friendship.status,
    created_at: friendship.created_at,
    updated_at: friendship.updated_at,
    requester: formatPublicUser(friendship.requester),
    addressee: formatPublicUser(friendship.addressee),
  };
};
