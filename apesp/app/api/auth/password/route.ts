import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { hashPassword, comparePassword } from "../../../../src/lib/auth";
import { z } from "zod";
import { withAuth } from "../../../../src/middleware/auth";
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
  payload: { userId: string | number }
) {
  const body = await req.json();
  const { oldPassword, newPassword } = changeSchema.parse(body);

  // Find user
  const userId =
    typeof payload.userId === "string"
      ? parseInt(payload.userId, 10)
      : payload.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Validate old password
  const correct = await comparePassword(oldPassword, user.password);
  if (!correct)
    return NextResponse.json(
      { error: "Incorrect old password" },
      { status: 403 }
    );

  // Hash and update to new password
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({
    success: true,
    message: "Password changed successfully",
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // // 1. Forgot password flow (unauthenticated)
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
    //   if (!verifiedOtp)
    //     return NextResponse.json(
    //       { error: "OTP not verified for this user in the last 10 min" },
    //       { status: 403 }
    //     );

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

    //   return NextResponse.json({
    //     success: true,
    //     message: "Password reset successful",
    //   });
    // }

    // // 2. Change password flow (authenticated, uses withAuth)
    // if (body.type === "change") {
    //   return await withAuth(changePasswordHandler)(req);
    // }

    // Invalid type
    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
