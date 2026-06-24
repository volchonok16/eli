import { useCallback, useEffect, useState } from "react";
import { getSalePoints, deleteSalePoint } from "@/api/endpoints/sale-points";
import type { SalePoint } from "@/api/types";

export function useSalePoints() {
  const [data, setData] = useState<SalePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getSalePoints()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteSalePoint(id);
    setData((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch, remove };
}
