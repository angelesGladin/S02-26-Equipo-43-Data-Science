import { http, toApiError, unwrap } from "./http";
import type { CreateSaleDTO, Sale } from "../types/api";

/**
 * Crea una venta con items:
 * POST /sales
 * - valida stock
 * - descuenta inventario
 * - todo dentro de una transacción en backend
 */
export async function createSale(dto: CreateSaleDTO): Promise<Sale> {
  try {
    const res = await http.post("/sales", dto);
    return unwrap<Sale>(res.data);
  } catch (e) {
    throw toApiError(e);
  }
}
