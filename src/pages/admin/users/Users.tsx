import { useState } from "react";
import { Search, Loader2, Users as UsersIcon, Eye, EyeOff, Trash2 } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import { useAdminUsers } from "../../../api/queries/useAdmin";
import {
  useToggleUserActive,
  useDeleteUser,
} from "../../../api/mutations/adminMutations";
import { getErrorMessage } from "../../../lib/api-client";

export default function AdminUsers() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useAdminUsers(page, 20, search || undefined);
  const toggle = useToggleUserActive();
  const del = useDeleteUser();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const users = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const handleToggle = (id: number, name: string, isActive: boolean) => {
    setConfirmState({
      open: true,
      title: isActive ? `Block ${name}?` : `Unblock ${name}?`,
      message: isActive
        ? "They will not be able to log in until you unblock them."
        : "They will be able to log in again.",
      danger: isActive,
      action: async () => {
        try {
          await toggle.mutateAsync(id);
          notify.success(isActive ? "User blocked" : "User unblocked");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmState({
      open: true,
      title: `Delete ${name}?`,
      message: "This action cannot be undone. All their data will be removed.",
      danger: true,
      action: async () => {
        try {
          await del.mutateAsync(id);
          notify.success("User deleted");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy">Users</h1>
        <p className="text-sm text-muted mt-1">{data?.totalElements || 0} users</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft">
                <tr className="text-left text-xs text-muted uppercase">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-soft">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-navy text-xs">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-muted truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={u.role === "ADMIN" ? "blue" : "gray"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(u.id, u.name, u.isActive)}>
                        <Badge color={u.isActive ? "green" : "red"}>
                          {u.isActive ? "Active" : "Blocked"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(u.id, u.name, u.isActive)}
                          className="w-8 h-8 rounded hover:bg-brand/10 text-brand flex items-center justify-center"
                          title={u.isActive ? "Block" : "Unblock"}
                        >
                          {u.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="w-8 h-8 rounded hover:bg-red-50 text-red-500 flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
        onCancel={() => setConfirmState({ open: false, title: "", message: "" })}
        onConfirm={async () => {
          const action = confirmState.action;
          setConfirmState({ open: false, title: "", message: "" });
          await action?.();
        }}
      />
    </div>
  );
}