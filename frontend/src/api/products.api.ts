import { http, toApiError, unwrap } from "./http";
import type { Product, CreateProductDTO, UpdateProductDTO, UUID } from "../types/api";

function normalizeProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? null,
    barcode: p.barcode ?? null,
    cost: Number(p.cost ?? 0),      
    price: Number(p.price ?? 0),
    stock: Number(p.stock ?? 0),
    category: p.category ?? null,
    isActive: p.isActive ?? true,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await http.get("/products");
    const data = unwrap<any>(res.data);
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr.map(normalizeProduct);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function getProductById(id: UUID): Promise<Product> {
  try {
    const res = await http.get(`/products/${id}`);
    const data = unwrap<any>(res.data);
    return normalizeProduct(data?.data ?? data);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function createProduct(dto: CreateProductDTO): Promise<Product> {
  try {
    const res = await http.post("/products", dto);
    const data = unwrap<any>(res.data);
    return normalizeProduct(data?.data ?? data);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function updateProduct(
  id: UUID,
  dto: UpdateProductDTO
): Promise<Product> {
  try {
    const res = await http.put(`/products/${id}`, dto); 
    const data = unwrap<any>(res.data);
    return normalizeProduct(data?.data ?? data);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function deleteProduct(id: UUID): Promise<void> {
  try {
    await http.delete(`/products/${id}`);
  } catch (e) {
    throw toApiError(e);
  }
}