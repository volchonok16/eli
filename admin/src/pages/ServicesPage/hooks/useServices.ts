import { useCallback, useEffect, useState } from "react";
import { getServices, deleteService } from "@/api/endpoints/services";
import type { Service } from "@/api/types";

export function useServices() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getServices()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteService(id);
    setData((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch, remove };
}
