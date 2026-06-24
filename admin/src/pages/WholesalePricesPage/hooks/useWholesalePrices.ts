import { useCallback, useEffect, useState } from "react";
import { getWholesalePrices, createWholesalePrice, updateWholesalePrice, deleteWholesalePrice } from "@/api/endpoints/wholesale";
import { getProducts } from "@/api/endpoints/products";
import type { WholesalePrice, Product } from "@/api/types";

export function useWholesalePrices() {
  const [data, setData] = useState<WholesalePrice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [prices, prods] = await Promise.all([getWholesalePrices(), getProducts()]);
      setData(prices); setProducts(prods); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const add = useCallback(async (d: { productId: string; minQuantity: number; price: number }) => {
    const created = await createWholesalePrice(d);
    setData((prev) => [...prev, created]);
  }, []);

  const update = useCallback(async (id: string, d: { minQuantity: number; price: number }) => {
    const updated = await updateWholesalePrice(id, d);
    setData((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteWholesalePrice(id);
    setData((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, products, loading, error, refetch: fetch, add, update, remove };
}
