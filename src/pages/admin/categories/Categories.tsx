import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderTree,
  AlertCircle,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { useAdminCategories } from "../../../api/queries/useAdmin";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../api/mutations/adminMutations";
import { CategoryRequest } from "../../../api/services/adminService";
import { Category } from "../../../types/category";
import { getErrorMessage } from "../../../lib/api-client";

const EMPTY: CategoryRequest = {
  name: "",
  description: "",
  imageUrl: "",
  iconUrl: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminCategories() {
  const { showToast } = useAuthContext();
  const { data: categories = [], isLoading, isError, refetch } =
    useAdminCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryRequest>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    category: Category | null;
  }>({ open: false, category: null });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      imageUrl: c.imageUrl || "",
      iconUrl: c.iconUrl || "",
      displayOrder: c.displayOrder || 0,
      isActive: c.isActive,
    });
    setError("");
    setModalOpen(true);
  };

  const save = async () => {
    setError("");
    if (!form.name.trim()) return setError("Name is required");
    setSaving(true);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: form });
        showToast("Category updated");
      } else {
        await create.mutateAsync(form);
        showToast("Category created");
      }
      setModalOpen(false);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      showToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (c: Category) => {
    setConfirmState({ open: true, category: c });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmState.category) return;
    try {
      await del.mutateAsync(confirmState.category.id);
      showToast("Category deleted");
      setConfirmState({ open: false, category: null });
    } catch (e) {
      showToast(getErrorMessage(e));
      setConfirmState({ open: false, category: null });
    }
  };

  const update_ = (k: keyof CategoryRequest, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            Categories
          </h1>
          <p className="text-muted mt-1 text-sm">
            Manage all product categories
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">
            Failed to load categories
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && categories.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <FolderTree className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No categories yet
          </h2>
          <p className="text-sm text-muted">
            Create one to start adding products.
          </p>
        </div>
      )}

      {!isLoading && categories.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Products</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-soft rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                            {c.imageUrl ? (
                              <img
                                src={c.imageUrl}
                                alt=""
                                className="max-h-full max-w-full object-contain p-0.5"
                              />
                            ) : (
                              <FolderTree size={16} className="text-muted" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-navy text-xs">
                              {c.name}
                            </div>
                            {c.description && (
                              <div className="text-[11px] text-muted line-clamp-1 max-w-[250px]">
                                {c.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted">
                        {c.slug}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-navy">
                        {c.productCount || 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {c.displayOrder}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={c.isActive ? "green" : "gray"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="w-8 h-8 rounded-lg hover:bg-brand/10 text-brand flex items-center justify-center"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(c)}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 text-danger flex items-center justify-center"
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
          </div>
        </Reveal>
      )}

      {/* ============ ADD / EDIT MODAL ============ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Title */}
          <div>
            <h3 className="text-lg font-bold text-navy">
              {editing ? "Edit Category" : "Add Category"}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {editing ? "Update category details" : "Create a new category"}
            </p>
          </div>

          {/* Row 1: Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => update_("name", e.target.value)}
              placeholder="Windows"
            />
            <Input
              label="Slug (optional — auto-generated)"
              value={form.slug || ""}
              onChange={(e) => update_("slug", e.target.value)}
              placeholder="windows"
            />
          </div>

          {/* Row 2: Description full width */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => update_("description", e.target.value)}
              rows={3}
              placeholder="Short description of the category..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand transition resize-none"
            />
          </div>

          {/* Row 3: Image URL + Icon URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Image URL"
              value={form.imageUrl || ""}
              onChange={(e) => update_("imageUrl", e.target.value)}
              placeholder="/categories/windows.png"
            />
            <Input
              label="Icon URL (optional)"
              value={form.iconUrl || ""}
              onChange={(e) => update_("iconUrl", e.target.value)}
              placeholder="/variant/window1.png"
            />
          </div>

          {/* Row 4: Display Order + Active toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Input
              label="Display Order"
              type="number"
              value={form.displayOrder ?? 0}
              onChange={(e) => update_("displayOrder", Number(e.target.value))}
            />

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Status
              </label>
              <button
                type="button"
                onClick={() => update_("isActive", !form.isActive)}
                className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border transition w-full ${form.isActive
                  ? "border-success/30 bg-success/5"
                  : "border-gray-200 bg-gray-50"
                  }`}
              >
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${form.isActive ? "bg-success" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.isActive ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                  />
                </span>
                <span
                  className={`text-sm font-semibold ${form.isActive ? "text-success" : "text-muted"
                    }`}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="w-full rounded-lg px-4 py-2.5 border border-gray-200 text-navy text-sm font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <Button onClick={save} loading={saving} fullWidth>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============ DELETE CONFIRM DIALOG ============ */}
      {createPortal(
        <AnimatePresence>
          {confirmState.open && confirmState.category && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmState({ open: false, category: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-sm font-bold text-navy mb-1">
                  Delete {confirmState.category.name}?
                </h3>
                <p className="text-xs text-muted mb-5">
                  This will permanently remove the category. Cannot be undone.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmState({ open: false, category: null })}
                    disabled={del.isPending}
                    className="flex-1 rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={del.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                  >
                    {del.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}