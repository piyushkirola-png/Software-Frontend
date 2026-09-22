import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  Loader2,
  AlertCircle,
  Trash2,
  Power,
  PowerOff,
  CheckCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminUsers } from "../../../api/queries/useAdmin";
import {
  useToggleUserActive,
  useDeleteUser,
} from "../../../api/mutations/adminMutations";
import userService from "../../../api/services/userService";
import Badge from "../../../components/ui/Badge";
import type { User } from "../../../types/user";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch } = useAdminUsers(page, PAGE_SIZE);
  const toggleMutation = useToggleUserActive();
  const deleteMutation = useDeleteUser();

  const [confirmAction, setConfirmAction] = useState<{
    type: "toggle" | "delete";
    user: User;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const closeMenu = () => setMenuOpenFor(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const rangeStart = users.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + users.length;

  const handleToggleConfirm = () => {
    if (!confirmAction) return;
    const { user } = confirmAction;
    toggleMutation.mutate(user.id, {
      onSuccess: () => {
        setToast(user.isActive ? `${user.name} deactivated` : `${user.name} activated`);
        setConfirmAction(null);
      },
      onError: (err: any) => {
        setToast(err?.response?.data?.message || "Action failed");
        setConfirmAction(null);
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!confirmAction) return;
    const { user } = confirmAction;
    deleteMutation.mutate(user.id, {
      onSuccess: () => {
        setToast(`${user.name} deleted`);
        setConfirmAction(null);
      },
      onError: (err: any) => {
        setToast(err?.response?.data?.message || "Delete failed");
        setConfirmAction(null);
      },
    });
  };

  const saving = toggleMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">Users</h1>
        <p className="text-muted mt-1 text-sm">
          Manage all registered users on the platform
        </p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">Failed to load users</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <UsersIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-navy mb-1">No users yet</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Registered users will appear here.
          </p>
        </div>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-visible">
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/50 text-[11px] uppercase tracking-wider text-muted font-semibold">
            <div className="col-span-3">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-1">Joined</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {users.map((u) => {
            const avatarSrc = userService.absoluteAvatarUrl(u.avatarUrl);
            const showImage = avatarSrc && !imgErrors[u.id];

            return (
              <div
                key={u.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition items-center"
              >
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  {showImage ? (
                    <img
                      src={avatarSrc}
                      alt={u.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0 border border-gray-200"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [u.id]: true }))
                      }
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-navy truncate">
                      {u.name}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 text-xs text-navy/70 truncate">
                  {u.email}
                </div>

                <div className="col-span-2 text-xs text-navy/70 truncate">
                  {u.phone || "—"}
                </div>

                <div className="col-span-1">
                  <Badge color={u.role === "ADMIN" ? "navy" : "blue"}>
                    {u.role}
                  </Badge>
                </div>

                <div className="col-span-1 text-xs text-muted">
                  {fmtDate(u.createdAt)}
                </div>

                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${u.isActive
                        ? "bg-success/10 text-success"
                        : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-success" : "bg-gray-400"
                        }`}
                    />
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="col-span-1 flex justify-start md:justify-end relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFor(menuOpenFor === u.id ? null : u.id);
                    }}
                    className="p-2 rounded-lg text-muted hover:text-navy hover:bg-gray-100 transition"
                    aria-label="Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {menuOpenFor === u.id && (
                    <div
                      className="absolute right-0 top-10 z-50 w-48 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {u.isActive ? (
                        <button
                          onClick={() => {
                            setMenuOpenFor(null);
                            setConfirmAction({ type: "toggle", user: u });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-navy hover:bg-gray-50 transition"
                        >
                          <PowerOff className="h-3.5 w-3.5" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setMenuOpenFor(null);
                            setConfirmAction({ type: "toggle", user: u });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-navy hover:bg-gray-50 transition"
                        >
                          <Power className="h-3.5 w-3.5" />
                          Activate
                        </button>
                      )}

                      <div className="h-px bg-gray-100" />

                      <button
                        onClick={() => {
                          setMenuOpenFor(null);
                          if (u.isActive) {
                            setToast(
                              "Active users must be deactivated before deletion",
                            );
                          } else {
                            setConfirmAction({ type: "delete", user: u });
                          }
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition ${u.isActive
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-danger hover:bg-red-50"
                          }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="text-xs text-muted">
            Showing <span className="font-semibold text-navy">{rangeStart}</span>
            {" – "}
            <span className="font-semibold text-navy">{rangeEnd}</span> of{" "}
            <span className="font-semibold text-navy">{totalElements}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-navy px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {confirmAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmAction(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                {confirmAction.type === "toggle" ? (
                  <>
                    <h3 className="text-sm font-bold text-navy mb-1">
                      {confirmAction.user.isActive
                        ? `Deactivate ${confirmAction.user.name}?`
                        : `Activate ${confirmAction.user.name}?`}
                    </h3>
                    <p className="text-xs text-muted mb-5">
                      {confirmAction.user.isActive
                        ? "They won't be able to log in until reactivated."
                        : "They will be able to log in again."}
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setConfirmAction(null)}
                        disabled={saving}
                        className="flex-1 rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleToggleConfirm}
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 bg-gradient-to-r from-brand to-brand-light text-white text-xs font-semibold hover:shadow-md disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : confirmAction.user.isActive ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-navy mb-1">
                      Delete {confirmAction.user.name}?
                    </h3>
                    <p className="text-xs text-muted mb-5">
                      This will permanently remove the user. Cannot be undone.
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setConfirmAction(null)}
                        disabled={saving}
                        className="flex-1 rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteConfirm}
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-white border border-success/20 shadow-xl rounded-lg px-3.5 py-2.5 max-w-xs"
            >
              <div className="p-1 rounded bg-success/10">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-xs font-medium text-navy">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}