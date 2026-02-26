 /* 
* Tipos compartidos para consumir la API.
 * Aquí definimos estructuras que vienen del backend.
 */

export type UUID = string;

/** Producto (tabla Product en DB) */
export type Product = {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;   
  category: string;
  cost: number;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Payload para crear un producto */
export type CreateProductDTO = {
  storeId: UUID;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
};

/** Payload para actualizar un producto (parcial) */
export type UpdateProductDTO = Partial<Omit<CreateProductDTO, "storeId">>;

/** Item dentro de una venta (request) - backend espera "quantity" */
export type SaleItemDTO = {
  productId: UUID;
  quantity: number;
};

/** Payload para crear una venta */
export type CreateSaleDTO = {
  storeId: UUID;
  items: SaleItemDTO[];
};

/** Item devuelto por backend dentro de una venta */
export type SaleItem = {
  productId: UUID;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

/** Venta devuelta por backend */
export type Sale = {
  saleId: UUID;
  storeId: UUID;
  total: number;
  items: SaleItem[];
  createdAt: string;
};

/**
 * KPIs del dashboard (según respuesta real de GET /dashboard/summary)
 */
export type DashboardKpis = {
  totalSalesAmount: number;
  totalSalesCount: number;

  todaySalesAmount: number;
  todaySalesCount: number;

  avgTicketToday: number;

  activeProducts: number;
  lowStockProducts: number;

  topProductsToday: Array<{
    productId: UUID;
    name: string;
    category?: string | null;
    qtySold: number;
  }>;

  grossProfitToday: number;
  grossProfitTotal: number;
};