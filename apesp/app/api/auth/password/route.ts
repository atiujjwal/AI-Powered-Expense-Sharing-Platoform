import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/db";
import { hashPassword, comparePassword } from "@/src/lib/auth";
import { z } from "zod";
import { withAuth } from "@/src/middleware/auth";
import {
  badRequest,
  errorResponse,
  forbidden,
  notFound,
} from "@/src/lib/response";
// import { withAuth } from "@/middleware/withAuth";

// For forgot password flow
const forgotSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  type: z.literal("forgot"),
});

// For change password flow
const changeSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
  type: z.literal("change"),
});

// Internal handler for authenticated password change
async function changePasswordHandler(
  req: NextRequest,
  payload: { userId: string }
) {
  const { userId } = payload;
  const body = await req.json();
  const { oldPassword, newPassword } = changeSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return notFound("User not found");

  // Validate old password
  const correct = await comparePassword(oldPassword, user.password);
  if (!correct) return forbidden("Incorrect old password");

  // Hash and update to new password
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return errorResponse("Password changed successfully");
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // // // Forgot password flow (unauthenticated)
    // if (body.type === "forgot") {
    //   const { email, password } = forgotSchema.parse(body);

    //   // Look for a recently verified OTP for this email (used, not expired)
    //   const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    //   const verifiedOtp = await prisma.otp.findFirst({
    //     where: {
    //       email,
    //       type: "reset_password",
    //       used: true,
    //       expires_at: { gt: tenMinsAgo },
    //     },
    //   });
    //   if (!verifiedOtp) return forbidden();

    //   // Update password
    //   const hashed = await hashPassword(password);
    //   await prisma.user.update({
    //     where: { email },
    //     data: { password: hashed },
    //   });

    //   // Expire all reset_password OTPs for this email
    //   await prisma.otp.updateMany({
    //     where: { email, type: "reset_password" },
    //     data: { used: true },
    //   });

    //   return successResponse("Password reset successful");
    // }

    // // Change password flow (authenticated, uses withAuth)
    // if (body.type === "change") {
    //   // return await withAuth(changePasswordHandler)(req);
    // }

    // Invalid type
    return badRequest("Invalid request type");
  } catch (error) {
    console.log("Error updating password: ", error);
    if (error instanceof z.ZodError)
      return badRequest("Invalid request", error.issues);
    return badRequest("Internal server error");
  }
}
