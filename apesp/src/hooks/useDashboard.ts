import { useEffect } from "react";
import { useStore } from "../store";

export default function useDashboard() {
  const summary = useStore((s) => s.summary);
  const fetchSummary = useStore((s) => s.fetchSummary);

  useEffect(() => {
    if (!summary) fetchSummary();
  }, [summary, fetchSummary]);
  return { summary, loading: !summary };
}
