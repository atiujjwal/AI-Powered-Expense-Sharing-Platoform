import { create } from "zustand";
import { AnalyticsSummary, Expense, Group, User } from "../lib/types";
import { sleep } from "../lib/utils";


type AuthSlice = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

type GroupsSlice = {
  groups: Group[];
  fetchGroups: () => Promise<void>;
  addGroup: (g: Omit<Group, "id">) => Promise<string>;
};

type ExpensesSlice = {
  expenses: Expense[];
  fetchExpenses: (groupId?: string) => Promise<void>;
  addExpense: (e: Omit<Expense, "id">) => Promise<string>;
  deleteExpense: (id: string) => Promise<void>;
};

type DashboardSlice = {
  summary: AnalyticsSummary | null;
  fetchSummary: () => Promise<void>;
};

export const useStore = create<
  AuthSlice & GroupsSlice & ExpensesSlice & DashboardSlice
>((set, get) => ({
  // Auth (mock)
  user: null,
  login: async (email, _password) => {
    await sleep(500);
    // TODO: Call backend /api/auth/login
    set({ user: { id: "u1", name: "Alex", email, currency: "INR" } });
  },
  register: async (email, _password, name) => {
    await sleep(700);
    // TODO: Call backend /api/auth/register
    set({ user: { id: "u1", name, email, currency: "INR" } });
  },
  logout: () => set({ user: null }),

  // Groups (mock)
  groups: [],
  fetchGroups: async () => {
    await sleep(400);
    // TODO: GET /api/groups
    set({
      groups: [
        {
          id: "g1",
          name: "Goa Trip",
          currency: "INR",
          members: [{ id: "u1", name: "Alex" }],
          description: "New Year trip",
        },
        {
          id: "g2",
          name: "Flat 305",
          currency: "INR",
          members: [{ id: "u1", name: "Alex" }],
          description: "Roommates",
        },
      ],
    });
  },
  addGroup: async (g) => {
    await sleep(600);
    // TODO: POST /api/groups
    const id = crypto.randomUUID();
    set({ groups: [...get().groups, { ...g, id }] as Group[] });
    return id;
  },

  // Expenses (mock)
  expenses: [],
  fetchExpenses: async (_groupId) => {
    await sleep(500);
    // TODO: GET /api/expenses?groupId=...
    set({
      expenses: [
        {
          id: "e1",
          groupId: "g1",
          date: new Date().toISOString(),
          merchant: "Cafe 77",
          category: "DINING",
          amount: 850,
          paidBy: "u1",
          split: "equal",
          currency: "INR",
        },
      ],
    });
  },
  addExpense: async (e) => {
    await sleep(700);
    // TODO: POST /api/expenses
    const id = crypto.randomUUID();
    set({ expenses: [{ ...e, id }, ...get().expenses] as Expense[] });
    return id;
  },
  deleteExpense: async (id) => {
    await sleep(300);
    // TODO: DELETE /api/expenses/:id
    set({ expenses: get().expenses.filter((x) => x.id !== id) });
  },

  // Dashboard (mock)
  summary: null,
  fetchSummary: async () => {
    await sleep(500);
    // TODO: GET /api/analytics/summary
    set({
      summary: {
        totalSpent: 27500,
        totalBudget: 40000,
        remaining: 12500,
        percentageUsed: 69,
        categories: [
          {
            category: "DINING",
            amount: 8200,
            percentage: "30%",
            color: "#F59E0B",
          },
          {
            category: "GROCERIES",
            amount: 6000,
            percentage: "22%",
            color: "#10B981",
          },
          {
            category: "TRAVEL",
            amount: 9000,
            percentage: "33%",
            color: "#6366F1",
          },
          {
            category: "UTILITIES",
            amount: 2300,
            percentage: "8%",
            color: "#EF4444",
          },
          {
            category: "OTHER",
            amount: 1000,
            percentage: "4%",
            color: "#A3A3A3",
          },
        ],
        recentExpenses: [
          {
            id: "e1",
            date: new Date().toISOString(),
            merchant: "Uber",
            category: "TRAVEL",
            amount: 350,
          },
          {
            id: "e2",
            date: new Date().toISOString(),
            merchant: "Zomato",
            category: "DINING",
            amount: 550,
          },
        ],
      },
    });
  },
}));
