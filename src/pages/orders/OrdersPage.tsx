import { useState, useEffect } from "react";
import { Search, ChevronRight, X, ArrowLeft, ArrowRight, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrder } from "../../shared/api/orders";

const PAGE_SIZE = 10;

function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

function formatDate(isoString: string) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDIENTE_DE_PAGO: "Pendiente",
  CONFIRMADA: "Confirmada",
  EN_PREPARACION: "En preparación",
  ENVIADA: "Enviada",
  ENTREGADA: "Entregada",
  PAGO_RECHAZADO: "Pago Rechazado",
  CANCELADA: "Cancelada",
  REEMBOLSO_EN_PROCESO: "Reembolso en proceso",
  REEMBOLSO_PROCESADO: "Reembolsada",
};

const ORDER_STATUS_STYLE: Record<string, { background: string; color: string }> = {
  PENDIENTE_DE_PAGO: { background: "#fef3c7", color: "#d97706" },
  CONFIRMADA: { background: "#dbeafe", color: "#2563eb" },
  EN_PREPARACION: { background: "#ffedd5", color: "#ea580c" },
  ENVIADA: { background: "#e0e7ff", color: "#4f46e5" },
  ENTREGADA: { background: "#dcfce7", color: "#16a34a" },
  PAGO_RECHAZADO: { background: "#fee2e2", color: "#dc2626" },
  CANCELADA: { background: "#fee2e2", color: "#dc2626" },
  REEMBOLSO_EN_PROCESO: { background: "#ffedd5", color: "#ea580c" },
  REEMBOLSO_PROCESADO: { background: "#f3f4f6", color: "#4b5563" },
};

function StatusBadge({ status }: { status: string }) {
  const style = ORDER_STATUS_STYLE[status] || ORDER_STATUS_STYLE.CANCELADA;
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full" style={{ fontSize: 12, fontWeight: 600, ...style }}>
      {ORDER_STATUS_LABEL[status] || status}
    </span>
  );
}

// ── Panel de Detalle (Solo lectura) ──
function DetailPanel({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
  });

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>Detalle de Orden</h2>
          <button onClick={onClose} className="close-drawer-btn" title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="detail-body">
          {isLoading ? (
            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Cargando detalles de la orden...</span>
          ) : isError || !order ? (
            <span style={{ color: "#dc2626" }}>Error al cargar la orden. Verificá que el ID sea correcto.</span>
          ) : (
            <>
              <div className="detail-title-section">
                <div className="detail-title-row">
                  <h3 className="detail-product-title" style={{ fontSize: 18 }}>
                    #{order.order_id.split("-")[0]}
                  </h3>
                  <StatusBadge status={order.status} />
                </div>
                <p className="detail-product-desc">
                  Comprador ID: <span style={{ fontFamily: 'monospace' }}>{order.user_id}</span>
                </p>
                <p className="detail-product-desc" style={{ marginTop: 4 }}>
                  Fecha: {formatDate(order.created_at)}
                </p>
              </div>

              <div className="specs-grid">
                <div className="spec-box">
                  <p className="spec-label">Monto Total</p>
                  <p className="spec-price">{formatPrice(order.total_amount)}</p>
                </div>
                <div className="spec-box">
                  <p className="spec-label">Estado Logístico</p>
                  <p className="spec-value">
                    {order.aggregated_status ? ORDER_STATUS_LABEL[order.aggregated_status] : "N/A"}
                  </p>
                </div>
              </div>

              {/* Lista de Items */}
              <div className="history-section">
                <p className="seller-info-title" style={{ marginBottom: 16 }}>Items comprados</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#111827' }}>{item.product_name}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                          Vendedor ID: <span style={{ fontFamily: 'monospace' }}>{item.seller_id || "N/A"}</span>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                          {item.quantity}x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                         <StatusBadge status={item.status} />
                         <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
                           {formatPrice(item.unit_price * item.quantity)}
                         </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de la orden */}
              <div className="history-section">
                <p className="seller-info-title">Historial de Transiciones</p>
                {order.status_history.length === 0 ? (
                  <span style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>Sin cambios registrados.</span>
                ) : (
                  <ol className="history-list">
                    {order.status_history.map((entry, idx) => (
                      <li key={idx} className="history-entry">
                        <div className="history-dot" />
                        <div className="history-content">
                          <div className="history-states">
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                              {ORDER_STATUS_LABEL[entry.new_status] || entry.new_status}
                            </span>
                          </div>
                          <div className="history-meta">
                            <span>{formatDate(entry.timestamp)}</span>
                            <span className="history-role" style={{ textTransform: 'none' }}>{entry.origin}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const cleanSearch = searchInput.trim();
      if (cleanSearch.length === 36) {
        setSelectedId(cleanSearch);
        setSearchId("");
      } else {
        setSearchId(cleanSearch);
      }
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders", page, PAGE_SIZE, statusFilter],
    queryFn: () => getOrders(page, PAGE_SIZE, statusFilter || undefined),
    retry: 1,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="users-page-container">
      {selectedId && (
        <DetailPanel orderId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      <h1 className="main-title">Monitor de Órdenes</h1>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Listado General</h2>
        </div>

        <div className="search-bar" style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por ID exacto de la orden..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', background: 'white', color: '#374151' }}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Comprador ID</th>
                <th>Fecha</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="table-message-cell">Cargando órdenes...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="table-message-cell" style={{color: '#dc2626'}}>
                    Error al cargar órdenes: {(error as any)?.response?.data?.detail || "Desconocido"}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-message-cell">
                    <Package size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                    No se encontraron órdenes.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, fontFamily: 'monospace' }}>
                        #{order.order_id.split("-")[0]}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#4b5563", fontFamily: 'monospace' }}>
                        {order.user_id.split("-")[0]}...
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#4b5563" }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {formatPrice(order.total_amount)}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedId(order.order_id)}
                        className="icon-btn"
                        style={{ background: "#f3f4f6", color: "#4b5563", margin: "0 auto" }}
                        title="Ver detalle completo"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Página {page} de {totalPages}
            </span>
            <div className="pagination-buttons">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="pagination-btn">
                <ArrowLeft size={18} /> Anterior
              </button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="pagination-btn">
                Siguiente <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}