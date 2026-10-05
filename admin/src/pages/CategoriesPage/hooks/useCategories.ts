import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  deleteCategory,
} from "@/api/endpoints/categories";
import type { Category } from "@/api/types";

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      setData(await getCategories());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteCategory(id);
    await fetch({ silent: true });
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, remove };
}
