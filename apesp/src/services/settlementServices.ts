import { z } from "zod";
import { Decimal } from "decimal.js";

Decimal.set({ precision: 12 });

export const createSettlementSchema = z.object({
  receiver_id: z.string().cuid(),
  group_id: z.string().cuid().nullable().optional(),
  amount: z
    .string()
    .refine((val) => !new Decimal(val).isNaN(), "Invalid amount")
    .refine((val) => new Decimal(val).isPositive(), "Amount must be positive"),
  date: z.string().datetime(),
});
