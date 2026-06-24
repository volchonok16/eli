import { useCallback, useEffect, useState } from "react";
import { getDeliveryZones, deleteDeliveryZone } from "@/api/endpoints/delivery-zones";
import type { DeliveryZone } from "@/api/types";

export function useDeliveryZones() {
  const [data, setData] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getDeliveryZones()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDeliveryZone(id);
    setData((prev) => prev.filter((z) => z.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch, remove };
}
