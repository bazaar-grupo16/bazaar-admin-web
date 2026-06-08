import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Download, AlertCircle, Users, ShoppingCart, TrendingUp, Package, Loader2 } from "lucide-react";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

import {
  useUsersMetrics,
  useOrdersSummary,
  useTopSellingProducts,
  useCategorySales,
  exportMetricsCSV,
  type Interval
} from "../../hooks/useMetrics.ts";
import '../../styles/index.css'

type Period = "7d" | "30d" | "90d" | null;

const PERIOD_OPTIONS: { value: Period; label: string; days: number }[] = [
  { value: "7d", label: "7 días", days: 7 },
  { value: "30d", label: "30 días", days: 30 },
  { value: "90d", label: "90 días", days: 90 },
];

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#93c5fd",
  processing: "#c4b5fd",
  shipped: "#7dd3fc",
  delivered: "#86efac",
  cancelled: "#fca5a5",
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const CATEGORY_COLORS = ["#F97316", "#fb923c", "#fdba74", "#fed7aa", "#ea580c", "#c2410c", "#9a3412"];

function toDateTimeParams(params: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if ((key === 'start_date' || key === 'end_date') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        value = key === 'start_date' ? `${value}T00:00:00` : `${value}T23:59:59`;
      }
      return [key, value];
    })
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: "#fff", border: "1px solid #e5e7eb" }}
    >
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: 40, height: 40, background: color + "20" }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

type Tab = "resumen" | "categoria";

function getPeriodConfig(period: Period): { startDate: string; endDate: string; interval: Interval } {
  const endDate = new Date().toISOString().split('T')[0];
  const d = new Date();
  let interval: Interval = 'day';
  if (period === '7d') {
    d.setDate(d.getDate() - 7);
    interval = 'day';
  } else if (period === '30d') {
    d.setDate(d.getDate() - 30);
    interval = 'day';
  } else if (period === '90d') {
    d.setDate(d.getDate() - 90);
    interval = 'week';
  } else {
    return { startDate: '', endDate: '', interval: 'day' };
  }
  const startDate = d.toISOString().split('T')[0];
  return { startDate, endDate, interval };
}

export function MetricsPage() {
  const [period, setPeriod] = useState<Period>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [isExporting, setIsExporting] = useState(false);

  const days = period ? PERIOD_OPTIONS.find((p) => p.value === period)!.days : 30;
  
  const { startDate, endDate, interval } = getPeriodConfig(period);

  const { data: usersData, isLoading: loadingUsers, error: usersError } = useUsersMetrics(startDate, endDate, interval);
  const { data: ordersData, isLoading: loadingOrders, error: ordersError } = useOrdersSummary(startDate, endDate, interval);
  const { data: topProductsData, isLoading: loadingProducts, error: productsError } = useTopSellingProducts(startDate, endDate, 5);
  const { data: categorySalesData, isLoading: loadingCategories, error: categoriesError } = useCategorySales(startDate, endDate);

  const isLoading = loadingUsers || loadingOrders || loadingProducts || loadingCategories;
  const hasError = usersError || ordersError || productsError || categoriesError;

  const errorMessages = [
    usersError ? `Usuarios: ${usersError.message}` : null,
    ordersError ? `Órdenes: ${ordersError.message}` : null,
    productsError ? `Productos: ${productsError.message}` : null,
    categoriesError ? `Categorías: ${categoriesError.message}` : null,
  ].filter(Boolean);

  const newUsers = usersData?.summary?.new_users_in_period ?? 0;
  const totalOrders = ordersData?.summary?.total_orders_in_period ?? 0;
  const totalRevenue = ordersData?.summary?.total_amount_in_period ?? 0;
  const totalUsers = usersData?.summary?.total_registered_all_time ?? 0;

  const timelineData = (ordersData?.timeseries || []).map(t => ({
    label: t.date.slice(5).replace("-", "/"),
    ordenes: t.orders_count,
    ingresos: t.amount / 1000
  }));

  const statusDist = Object.entries(ordersData?.distribution_by_status || {}).map(([status, count]) => ({
    status,
    label: ORDER_STATUS_LABELS[status as OrderStatus] || status,
    count: count as number,
    color: ORDER_STATUS_COLORS[status as OrderStatus] || "#ccc"
  }));

  const topProducts = (topProductsData?.items || []).map(p => ({
    name: p.product_name,
    units: p.total_quantity_sold,
    revenue: p.total_revenue
  }));

  const categoryMetrics = (categorySalesData?.items || []).map(c => ({
    category: c.category,
    orders: c.orders_count,
    revenue: c.total_amount
  }));

  const handleExport = async () => {
    if (!period || !startDate || !endDate) return;
    setIsExporting(true);
    
    try {
      const exportFiles = [
        { endpoint: '/users/admin/metrics/users/export', params: toDateTimeParams({ start_date: startDate, end_date: endDate, interval }), name: 'usuarios' },
        { endpoint: '/orders/admin/metrics/orders/export', params: toDateTimeParams({ metric_type: 'orders', start_date: startDate, end_date: endDate }), name: 'ordenes' },
        { endpoint: '/orders/admin/metrics/orders/export', params: toDateTimeParams({ metric_type: 'products', start_date: startDate, end_date: endDate }), name: 'productos' },
        { endpoint: '/orders/admin/metrics/orders/export', params: toDateTimeParams({ metric_type: 'categories', start_date: startDate, end_date: endDate }), name: 'categorias' },
      ];

      for (const file of exportFiles) {
        const blob = await exportMetricsCSV(file.endpoint, file.params);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bazaar-metricas-${file.name}-${period}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error al exportar las métricas", err);
      alert(`Hubo un error al exportar las métricas. Error: ${err}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto" style={{ background: "#f9fafb" }}>
      <div className="px-8 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="main-title" style={{ marginBottom: 4 }}>Métricas</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Actividad de la plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
              {PERIOD_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    background: period === value ? "#F97316" : "transparent",
                    color: period === value ? "#fff" : "#6b7280",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Export button */}
            <div className="relative group">
              <button
                onClick={handleExport}
                disabled={!period || isLoading || isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  background: (period && !isLoading && !isExporting) ? "#F97316" : "#f3f4f6",
                  color: (period && !isLoading && !isExporting) ? "#fff" : "#9ca3af",
                  cursor: (period && !isLoading && !isExporting) ? "pointer" : "not-allowed",
                }}
              >
                {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Exportar CSV
              </button>
              {!period && (
                <div
                  className="absolute top-full mt-2 right-0 px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: "#111827", color: "#fff", fontSize: 12 }}
                >
                  <AlertCircle size={12} className="inline mr-1" />
                  Seleccioná un período antes de exportar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {hasError && (
          <div className="flex flex-col gap-2.5 px-4 py-3 rounded-xl mb-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">Hubo un error al cargar las métricas. Intenta nuevamente.</p>
            </div>
            {errorMessages.length > 0 && (
              <ul className="text-sm text-red-600 list-disc list-inside ml-6">
                {errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Period warning if none selected */}
        {!period && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <AlertCircle size={16} style={{ color: "#F97316", flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#92400e" }}>
              Seleccioná un período para ver las métricas y habilitar la exportación.
            </p>
          </div>
        )}

        {/* Loading Overlay */}
        {period && isLoading && (
          <div className="flex items-center justify-center p-12">
             <Loader2 size={32} className="animate-spin text-orange-500" />
             <span className="ml-3 text-gray-500 font-medium text-sm">Cargando métricas...</span>
          </div>
        )}

        {/* Content Tabs */}
        {period && !isLoading && !hasError && (
          <>
            <div
              className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
              style={{ background: "#fff", border: "1px solid #e5e7eb" }}
            >
              {(["resumen", "categoria"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-4 py-2 rounded-lg transition-all"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    background: tab === t ? "#F97316" : "transparent",
                    color: tab === t ? "#fff" : "#6b7280",
                  }}
                >
                  {t === "resumen" ? "Resumen" : "Por categoría"}
                </button>
              ))}
            </div>

            {tab === "resumen" && (
              <>
                {/* Metric cards */}
                <div className="grid grid-cols-4 gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                  <MetricCard
                    icon={Users}
                    label="Usuarios nuevos"
                    value={String(newUsers)}
                    sub={period ? `Últimos ${days} días` : "Últimos 30 días"}
                    color="#F97316"
                  />
                  <MetricCard
                    icon={ShoppingCart}
                    label="Total órdenes"
                    value={String(totalOrders)}
                    sub={`en el período`}
                    color="#3b82f6"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Monto transaccionado"
                    value={`$${(totalRevenue / 1000).toFixed(0)}K`}
                    sub="Solo órdenes entregadas"
                    color="#22c55e"
                  />
                  <MetricCard
                    icon={Users}
                    label="Total usuarios"
                    value={String(totalUsers)}
                    sub="Histórico"
                    color="#8b5cf6"
                  />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Timeline chart */}
                  <div
                    className="rounded-xl p-5"
                    style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                      Órdenes en el tiempo
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorOrdenes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                          formatter={(v) => [v ?? 0, "Órdenes"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="ordenes"
                          stroke="#F97316"
                          strokeWidth={2}
                          fill="url(#colorOrdenes)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status distribution */}
                  <div
                    className="rounded-xl p-5"
                    style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                      Distribución por estado
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={statusDist} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} width={60} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                          formatter={(v) => [v ?? 0, "Órdenes"]}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {statusDist.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue chart */}
                <div
                  className="rounded-xl p-5 mb-6"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                    Ingresos en el tiempo (miles de $)
                  </p>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                        formatter={(v) => [`$${Number(v ?? 0).toFixed(0)}K`, "Ingresos"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="ingresos"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#colorIngresos)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Top products */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <Package size={16} style={{ color: "#F97316" }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Productos más vendidos</p>
                  </div>
                  {topProducts.length === 0 ? (
                    <p className="text-center py-8" style={{ fontSize: 14, color: "#9ca3af" }}>
                      Sin datos de ventas en este período.
                    </p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                          {["#", "Producto", "Unidades vendidas", "Ingresos"].map((h) => (
                            <th
                              key={h}
                              className="text-left px-5 py-3"
                              style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}
                            >
                              {h.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, idx) => (
                          <tr
                            key={p.name}
                            style={{ borderBottom: idx < topProducts.length - 1 ? "1px solid #f9fafb" : "none" }}
                          >
                            <td className="px-5 py-3">
                              <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                  width: 24,
                                  height: 24,
                                  background: idx === 0 ? "#fff7ed" : "#f3f4f6",
                                  color: idx === 0 ? "#F97316" : "#9ca3af",
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {idx + 1}
                              </div>
                            </td>
                            <td className="px-5 py-3" style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                              {p.name}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="rounded-full"
                                  style={{
                                    height: 6,
                                    width: `${Math.round((p.units / (topProducts[0]?.units || 1)) * 80)}px`,
                                    background: "#F97316",
                                    opacity: 0.7,
                                  }}
                                />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.units}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>
                              {formatPrice(p.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {tab === "categoria" && (
              <div className="flex flex-col gap-4">
                {/* Category chart */}
                <div
                  className="rounded-xl p-5"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                    Ingresos por categoría
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={categoryMetrics}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#9ca3af" }} width={100} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                        formatter={(v) => [formatPrice(Number(v ?? 0)), "Ingresos"]}
                      />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {categoryMetrics.map((_, idx) => (
                          <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category table */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        {["Categoría", "Órdenes", "Monto transaccionado"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3"
                            style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}
                          >
                            {h.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoryMetrics.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8" style={{ fontSize: 14, color: "#9ca3af" }}>
                            Sin ventas en este período.
                          </td>
                        </tr>
                      ) : (
                        categoryMetrics.map((cat, idx) => (
                          <tr
                            key={cat.category}
                            style={{ borderBottom: idx < categoryMetrics.length - 1 ? "1px solid #f9fafb" : "none" }}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="rounded-sm"
                                  style={{ width: 10, height: 10, background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length], flexShrink: 0 }}
                                />
                                <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{cat.category}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3" style={{ fontSize: 13, color: "#6b7280" }}>{cat.orders}</td>
                            <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>
                              {formatPrice(cat.revenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

