// src/lib/debt-simplifier.ts
import { Balance, User } from "@prisma/client";
import { Decimal } from "decimal.js";
import { formatPublicUser } from "../lib/formatter";

Decimal.set({ precision: 12 });

type BalanceWithUsers = Balance & { user_a: User; user_b: User };
type UserNetBalance = { user: User; net: Decimal };
export type SimplifiedPayment = {
  from: ReturnType<typeof formatPublicUser>;
  to: ReturnType<typeof formatPublicUser>;
  amount: string;
};

/**
 * Implements a debt minimization algorithm (using heaps/greedy approach).
 * Takes a list of group balances and calculates the minimum set of payments.
 */
export function simplifyGroupDebts(
  balances: BalanceWithUsers[]
): SimplifiedPayment[] {
  const netBalance = new Map<string, UserNetBalance>();

  // 1. Calculate the net balance for each user in the group
  for (const b of balances) {
    const amount = b.amount; // Convention: Positive = B owes A

    // Get or initialize user objects
    if (!netBalance.has(b.user_A_id)) {
      netBalance.set(b.user_A_id, { user: b.user_a, net: new Decimal(0) });
    }
    if (!netBalance.has(b.user_B_id)) {
      netBalance.set(b.user_B_id, { user: b.user_b, net: new Decimal(0) });
    }

    // Apply the balance
    // Positive amount: B owes A. A's net increases, B's net decreases.
    // Negative amount: A owes B. A's net decreases, B's net increases.
    netBalance.get(b.user_A_id)!.net = netBalance
      .get(b.user_A_id)!
      .net.add(amount);
    netBalance.get(b.user_B_id)!.net = netBalance
      .get(b.user_B_id)!
      .net.sub(amount);
  }

  // 2. Separate users into two lists: debtors and creditors
  const debtors: UserNetBalance[] = [];
  const creditors: UserNetBalance[] = [];

  for (const entry of netBalance.values()) {
    if (entry.net.isNegative()) {
      debtors.push(entry);
    } else if (entry.net.isPositive()) {
      creditors.push(entry);
    }
  }

  // Sort by largest debt/credit first (heaps are more efficient, but sort is fine)
  debtors.sort((a, b) => a.net.comparedTo(b.net)); // Most negative first
  creditors.sort((a, b) => b.net.comparedTo(a.net)); // Most positive first

  const payments: SimplifiedPayment[] = [];

  // 3. Settle debts greedily
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    // Amount to transfer is the minimum of what is owed or what is due
    const paymentAmount = Decimal.min(debtor.net.abs(), creditor.net);

    // Record the payment
    payments.push({
      from: formatPublicUser(debtor.user),
      to: formatPublicUser(creditor.user),
      amount: paymentAmount.toFixed(2),
    });

    // Update balances
    debtor.net = debtor.net.add(paymentAmount);
    creditor.net = creditor.net.sub(paymentAmount);

    // 4. Remove settled users
    if (debtor.net.abs().lessThan(0.01)) {
      // Use a small epsilon for float comparison
      debtors.shift();
    }
    if (creditor.net.lessThan(0.01)) {
      creditors.shift();
    }
  }

  return payments;
}
