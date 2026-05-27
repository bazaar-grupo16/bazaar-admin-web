import { useState, useEffect } from "react";
import { Search, Ban, UserCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, blockUser, unblockUser } from "../../shared/api/users";
import { useAuth } from "../../shared/auth";

const PAGE_SIZE = 10;

export function UsersPage() {
  const { admin } = useAuth();
  const queryClient = useQueryClient();
  
  // ── Estados ──
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
    queryKey: ["users", page, PAGE_SIZE, search],
    queryFn: () => getUsers(page, PAGE_SIZE, search),
    retry: 1, 
  });

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("Usuario bloqueado correctamente.", 'success');
    },
    onError: () => showToast("Error al intentar bloquear al usuario.", 'error')
  });

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("Usuario desbloqueado correctamente.", 'success');
    },
    onError: () => showToast("Error al intentar desbloquear al usuario.", 'error')
  });

  const handleToggleBlock = (userId: string, currentStatus: boolean) => {
    if (userId === admin?.id) {
      showToast("No puedes bloquearte a ti mismo.", 'error');
      return;
    }
    if (currentStatus) {
      blockMutation.mutate(userId);
    } else {
      unblockMutation.mutate(userId);
    }
  };

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="users-page-container">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="main-title">Usuarios</h1>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Panel de Usuarios</h2>
        </div>

        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="table-message-cell">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="table-message-cell error-text">
                    Error al conectar con la API: {(error as any)?.response?.data?.detail || "Desconocido"}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-message-cell">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentAdmin = user.id === admin?.id;

                  return (
                    <tr key={user.id}>
                      <td>{user.name || "Sin nombre"}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                          {user.is_admin ? "Admin" : "Usuario"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? "Activo" : "Bloqueado"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {!isCurrentAdmin && (
                            <button 
                              onClick={() => handleToggleBlock(user.id, user.is_active)}
                              className={`icon-btn ${user.is_active ? 'block-btn' : 'unblock-btn'}`}
                              title={user.is_active ? "Bloquear Usuario" : "Desbloquear Usuario"}
                            >
                              {user.is_active ? <Ban size={18} /> : <UserCheck size={18} />}
                            </button>
                          )}
                          {isCurrentAdmin && <span className="current-user-tag">Tú</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="pagination-btn"
              >
                <ArrowLeft size={18} /> Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="pagination-btn"
              >
                Siguiente <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}