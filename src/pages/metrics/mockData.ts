export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export const MOCK_USERS_METRICS = {
  summary: { total_registered_all_time: 1250, new_users_in_period: 45 },
  timeseries: [
    { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], count: 5 },
    { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], count: 8 },
    { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], count: 6 },
    { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], count: 12 },
    { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], count: 4 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], count: 7 },
    { date: new Date(Date.now()).toISOString().split('T')[0], count: 3 }
  ]
};
