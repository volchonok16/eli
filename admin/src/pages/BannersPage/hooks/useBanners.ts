import { useCallback, useEffect, useState } from "react";
import { getBanners, deleteBanner } from "@/api/endpoints/banners";
import type { PromoBanner } from "@/api/types";

export function useBanners() {
  const [data, setData] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getBanners()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteBanner(id);
    setData((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch, remove };
}
