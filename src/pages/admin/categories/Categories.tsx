import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FolderTree } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
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
  const { data: categories = [], isLoading } = useAdminCategories();
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
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

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
        notify.success("Category updated");
      } else {
        await create.mutateAsync(form);
        notify.success("Category created");
      }
      setModalOpen(false);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => {
    setConfirmState({
      open: true,
      title: "Delete category?",
      message: "The category must have no products. This action cannot be undone.",
      danger: true,
      action: async () => {
        try {
          await del.mutateAsync(id);
          notify.success("Category deleted");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const update_ = (k: keyof CategoryRequest, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
            Categories
          </h1>
          <p className="text-sm text-muted mt-1">
            {categories.length} categories
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No categories yet</p>
            <p className="text-sm mt-1">Create one to start adding products</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft">
                <tr className="text-left text-xs text-muted uppercase">
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
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-soft">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-soft rounded overflow-hidden flex items-center justify-center shrink-0">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain p-0.5"
                            />
                          ) : (
                            <FolderTree size={16} className="text-gray-400" />
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 rounded hover:bg-brand/10 text-brand flex items-center justify-center"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(c.id)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4">
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
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => update_("description", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            />
          </div>
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
          <Input
            label="Display Order"
            type="number"
            value={form.displayOrder ?? 0}
            onChange={(e) => update_("displayOrder", Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => update_("isActive", e.target.checked)}
            />
            Active
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button onClick={save} loading={saving} fullWidth>
              {editing ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

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