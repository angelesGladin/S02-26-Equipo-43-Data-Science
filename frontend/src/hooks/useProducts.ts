import { useEffect, useState } from "react";
import type { Product } from "../types/api";
import type { ApiError } from "../api/http";
import { getProducts } from "../api/products.api";

/**
 * Hook para cargar productos y manejar:
 * - loading
 * - error
 * - refresh
 */
export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const list = await getProducts();
      setData(list);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial
  useEffect(() => {
    refresh();
  }, []);

  return { data, loading, error, refresh };
}