-- CreateTable
CREATE TABLE "ExpenseSummary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT,
    "period" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "total_spent" DECIMAL(12,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseTrend" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "granularity" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseTrend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpenseSummary_user_id_idx" ON "ExpenseSummary"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSummary_user_id_group_id_period_category_key" ON "ExpenseSummary"("user_id", "group_id", "period", "category");

-- CreateIndex
CREATE INDEX "ExpenseTrend_user_id_date_idx" ON "ExpenseTrend"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseTrend_user_id_date_granularity_key" ON "ExpenseTrend"("user_id", "date", "granularity");

-- AddForeignKey
ALTER TABLE "ExpenseSummary" ADD CONSTRAINT "ExpenseSummary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseTrend" ADD CONSTRAINT "ExpenseTrend_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
