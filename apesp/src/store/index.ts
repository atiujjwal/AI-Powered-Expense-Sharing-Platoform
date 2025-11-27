import { create } from "zustand";
import { AnalyticsSummary, Expense, Group, User } from "../lib/types";
import { STORAGE_KEYS } from "../lib/constants";
import { sleep } from "../lib/utils";
import {
  loginApi,
  registerApi,
  logoutApi,
  getGroupsApi,
  createGroupApi,
  getExpensesApi,
  createExpenseApi,
  deleteExpenseApi,
  getDashboardSummaryApi,
} from "../services/apiClient";

const getInitialUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};


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
  // Auth (backed by API)
  user: getInitialUser(),
  login: async (email, password) => {
    try {
      const data = await loginApi(email, password);
      const user: User = data?.user ?? data;
      set({ user });
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  },
  register: async (email, password, name) => {
    try {
      const data = await registerApi(email, password, name);
      const user: User = data?.user ?? data;
      set({ user });
    } catch (err) {
      console.error("Register failed:", err);
      throw err;
    }
  },
  logout: () => {
    logoutApi().catch((e) => console.warn("logout failed", e));
    set({ user: null });
  },

  // Groups (mock)
  groups: [],
  fetchGroups: async () => {
    try {
      const groups = await getGroupsApi();
      set({ groups });
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  },
  addGroup: async (g) => {
    try {
      const created = await createGroupApi(g);
      set((state) => ({ groups: [...state.groups, created] }));
      return created.id;
    } catch (err) {
      console.error("Failed to create group:", err);
      throw err;
    }
  },

  // Expenses (mock)
  expenses: [],
  fetchExpenses: async (groupId) => {
    try {
      const expenses = await getExpensesApi(groupId);
      set({ expenses });
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  },
  addExpense: async (e) => {
    try {
      const created = await createExpenseApi(e);
      set((state) => ({ expenses: [created, ...state.expenses] }));
      return created.id;
    } catch (err) {
      console.error("Failed to add expense:", err);
      throw err;
    }
  },
  deleteExpense: async (id) => {
    try {
      const prev = get().expenses;
      set({ expenses: prev.filter((x) => x.id !== id) });
      await deleteExpenseApi(id);
    } catch (err) {
      console.error("Failed to delete expense:", err);
      await get().fetchExpenses();
      throw err;
    }
  },

  // Dashboard (mock)
  summary: null,
  fetchSummary: async () => {
    try {
      const summary = await getDashboardSummaryApi();
      set({ summary });
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
    }
  },
}));
