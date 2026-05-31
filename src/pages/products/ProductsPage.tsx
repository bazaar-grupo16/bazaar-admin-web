import { useState, useEffect } from "react";
import { Search, ChevronRight, X, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getSellerProfile, blockProduct, unblockProduct, type AdminProduct } from "../../shared/api/products";

const PAGE_SIZE = 10;

function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  out_of_stock: "Sin stock",
  inactive: "Pausado (Vendedor)",
};

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  active: { background: "#dcfce7", color: "#16a34a" },
  out_of_stock: { background: "#fef9c3", color: "#a16207" },
  inactive: { background: "#f3f4f6", color: "#6b7280" },
};

function StatusBadge({ product }: { product: AdminProduct }) {
  if (product.adminDisabled) {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full" style={{ fontSize: 12, fontWeight: 600, background: "#fee2e2", color: "#dc2626" }}>
        Deshabilitado (Admin)
      </span>
    );
  }

  const style = STATUS_STYLE[product.status] || STATUS_STYLE.inactive;
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full" style={{ fontSize: 12, fontWeight: 600, ...style }}>
      {STATUS_LABEL[product.status] || "Desconocido"}
    </span>
  );
}

function SellerName({ sellerId }: { sellerId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sellerProfile", sellerId],
    queryFn: () => getSellerProfile(sellerId),
    enabled: !!sellerId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <span style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>Cargando...</span>;
  if (isError) return <span style={{ color: "#dc2626", fontSize: 13 }}>Error de perfil</span>;
  return <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{data?.name || "Sin nombre registrado"}</span>;
}

function SellerDetailCard({ sellerId }: { sellerId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sellerProfile", sellerId],
    queryFn: () => getSellerProfile(sellerId),
    enabled: !!sellerId,
    staleTime: 1000 * 60 * 5, 
  });

  return (
    <div className="seller-card">
      <p className="seller-info-title">Información del Vendedor</p>
      {isLoading ? (
        <span style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>Cargando datos del vendedor...</span>
      ) : isError ? (
        <span style={{ color: "#dc2626", fontSize: 13 }}>Error al cargar el perfil público.</span>
      ) : (
        <div className="seller-profile-data">
          <p style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
            {data?.name || "Sin nombre registrado"}
          </p>
          <p style={{ fontSize: 13, color: "#4b5563", marginTop: 4, lineHeight: 1.5 }}>
            {data?.description || "Sin descripción proporcionada."}
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            ID único: {sellerId}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Componente del Panel de Detalle ──
function DetailPanel({ product, onClose }: { product: AdminProduct; onClose: () => void }) {
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        
        <div className="detail-header">
          <h2>Detalle del Producto</h2>
          <button onClick={onClose} className="close-drawer-btn" title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-title-section">
            <div className="detail-title-row">
              <h3 className="detail-product-title" style={{ textDecoration: product.adminDisabled ? 'line-through' : 'none', color: product.adminDisabled ? '#9ca3af' : '#111827' }}>
                {product.title}
              </h3>
              <StatusBadge product={product} />
            </div>
            <p className="detail-product-desc">
              {product.description || "Sin descripción proporcionada."}
            </p>
          </div>

          <div className="specs-grid">
            <div className="spec-box">
              <p className="spec-label">Precio</p>
              <p className="spec-price">{formatPrice(product.price)}</p>
            </div>
            <div className="spec-box">
              <p className="spec-label">Stock Disponible</p>
              <p className="spec-value">{product.stock} unidades</p>
            </div>
            <div className="spec-box" style={{ gridColumn: "span 2" }}>
              <p className="spec-label">Categoría</p>
              <p className="spec-value" style={{ textTransform: 'capitalize' }}>{product.category}</p>
            </div>
          </div>

          {product.adminDisabled && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', marginTop: '4px' }}>
              <EyeOff size={20} style={{ color: "#dc2626", flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "#991b1b", margin: 0, lineHeight: 1.4 }}>
                Este producto está deshabilitado por administración. Ya no es visible en el catálogo y el vendedor no puede reactivarlo por su cuenta.
              </p>
            </div>
          )}

          <SellerDetailCard sellerId={product.sellerId} />
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", page, PAGE_SIZE, search],
    queryFn: () => getProducts(page, PAGE_SIZE, search),
    retry: 1,
  });

  const blockMutation = useMutation({
    mutationFn: blockProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Producto deshabilitado por administración.", 'success');
    },
    onError: () => showToast("Error al intentar deshabilitar el producto.", 'error')
  });

  const unblockMutation = useMutation({
    mutationFn: unblockProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Producto rehabilitado correctamente.", 'success');
    },
    onError: () => showToast("Error al intentar rehabilitar el producto.", 'error')
  });

  const handleToggleBlock = (product: AdminProduct) => {
    if (product.adminDisabled) {
      unblockMutation.mutate(product.id);
    } else {
      blockMutation.mutate(product.id);
    }
  };

  const products = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  
  const selectedProduct = products.find(p => p.id === selectedId) || null;

  return (
    <div className="users-page-container">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {selectedProduct && (
        <DetailPanel product={selectedProduct} onClose={() => setSelectedId(null)} />
      )}

      <h1 className="main-title">Catálogo de Productos</h1>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Listado General</h2>
        </div>

        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Vendedor</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="table-message-cell">Cargando productos...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="table-message-cell" style={{color: '#dc2626'}}>
                    Error al cargar productos: {(error as any)?.response?.data?.detail || "Desconocido"}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-message-cell">No se encontraron productos en el catálogo.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} style={{ opacity: product.adminDisabled ? 0.6 : 1 }}>
                    <td>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0, textDecoration: product.adminDisabled ? 'line-through' : 'none' }}>
                        {product.title}
                      </p>
                    </td>
                    <td>
                      <SellerName sellerId={product.sellerId} />
                    </td>
                    <td style={{ fontSize: 13, color: "#4b5563", textTransform: 'capitalize' }}>{product.category}</td>
                    <td style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {formatPrice(product.price)}
                    </td>
                    <td><StatusBadge product={product} /></td>
                    <td>
                      <div className="action-buttons-group" style={{ justifyContent: "center" }}>
                        <button
                          onClick={() => handleToggleBlock(product)}
                          disabled={blockMutation.isPending || unblockMutation.isPending}
                          className={`icon-btn ${product.adminDisabled ? 'unblock-btn' : 'block-btn'}`}
                          title={product.adminDisabled ? "Rehabilitar producto" : "Deshabilitar producto"}
                        >
                          {product.adminDisabled ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setSelectedId(product.id)}
                          className="icon-btn"
                          style={{ background: "#f3f4f6", color: "#4b5563" }}
                          title="Ver detalle completo"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
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