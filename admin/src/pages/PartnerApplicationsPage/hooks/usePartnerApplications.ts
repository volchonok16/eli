import { useCallback, useEffect, useState } from "react";
import { getPartnerApplications, updatePartnerStatus, deletePartnerApplication, uploadPartnerDocument, deletePartnerDocument } from "@/api/endpoints/partners";
import type { PartnerApplication, PartnerStatus } from "@/api/types";

const STATUS_LABELS: Record<PartnerStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
};

export function usePartnerApplications() {
  const [data, setData] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getPartnerApplications()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const changeStatus = useCallback(async (id: string, status: PartnerStatus) => {
    const updated = await updatePartnerStatus(id, status);
    setData((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deletePartnerApplication(id);
    setData((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const uploadDoc = useCallback(async (appId: string, file: File, type: string) => {
    await uploadPartnerDocument(appId, file, type);
    await fetch();
  }, [fetch]);

  const deleteDoc = useCallback(async (appId: string, docId: string) => {
    await deletePartnerDocument(appId, docId);
    await fetch();
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch, changeStatus, remove, uploadDoc, deleteDoc, STATUS_LABELS };
}
