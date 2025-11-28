-- CreateTable
CREATE TABLE "UserOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "otp" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserOtp_email_idx" ON "UserOtp"("email");

-- CreateIndex
CREATE INDEX "UserOtp_phone_idx" ON "UserOtp"("phone");
