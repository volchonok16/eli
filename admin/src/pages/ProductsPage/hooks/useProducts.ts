import { useCallback, useEffect, useState } from "react";
import {
  getProducts,
  deleteProduct,
  importProducts,
} from "@/api/endpoints/products";
import type { Product } from "@/api/types";

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getProducts());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteProduct(id);
    setData((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, remove };
}

export function useProductImport(refresh: () => void) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);

  const doImport = useCallback(
    async (file: File) => {
      setImporting(true);
      setImportResult(null);
      try {
        const result = await importProducts(file);
        setImportResult(result);
        refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Ошибка импорта");
      } finally {
        setImporting(false);
      }
    },
    [refresh]
  );

  return { importing, importResult, doImport };
}
