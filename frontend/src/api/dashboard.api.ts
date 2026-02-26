import { http, unwrap } from "./http";

export type TopProductToday = {
  productId: string;
  name: string;
  category: string | null;
  qtySold: number;
};

export type DashboardKpis = {
  totalSalesAmount: number;
  totalSalesCount: number;
  todaySalesAmount: number;
  todaySalesCount: number;
  avgTicketToday: number;
  activeProducts: number;
  lowStockProducts: number;
  topProductsToday: TopProductToday[];
  grossProfitToday: number;
  grossProfitTotal: number;
};

export async function getDashboardSummary(): Promise<DashboardKpis> {
  const res = await http.get("/dashboard/summary");
  return unwrap<DashboardKpis>(res.data);
}