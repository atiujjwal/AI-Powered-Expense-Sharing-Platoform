import { useEffect, useState } from "react";
import { useStore } from "../store";

export default function useExpenses(groupId?: string) {
  const expenses = useStore((s) => s.expenses);
  const fetchExpenses = useStore((s) => s.fetchExpenses);
  const addExpense = useStore((s) => s.addExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      fetchExpenses(groupId).then(() => setLoaded(true));
    }
  }, [loaded, fetchExpenses, groupId]);

  return { expenses, loading: !loaded, addExpense, deleteExpense };
}
