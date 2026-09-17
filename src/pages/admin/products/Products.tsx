import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, PackageX, Eye, EyeOff } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import {
  useAdminProducts,
  useAdminCategories,
} from "../../../api/queries/useAdmin";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductActive,
} from "../../../api/mutations/adminMutations";
import { ProductRequest } from "../../../api/services/adminService";
import { Product } from "../../../types/product";
import { getErrorMessage } from "../../../lib/api-client";

const EMPTY: ProductRequest = {
  categoryId: 0,
  title: "",
  price: 0,
  hasVariants: false,
  isFeatured: false,
  isActive: true,
};

export default function AdminProducts() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useAdminProducts(page, 20, status || undefined);
  const { data: categories = [] } = useAdminCategories();

  const create = useCreateProduct();
  const update = useUpdateProduct();
  const del = useDeleteProduct();
  const toggle = useToggleProductActive();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const products = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, categoryId: categories[0]?.id || 0 });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      categoryId: p.categoryId,
      title: p.title,
      slug: p.slug,
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      seoKeywords: p.seoKeywords || "",
      mrp: p.mrp ?? undefined,
      price: p.price,
      thumbnailUrl: p.thumbnailUrl || "",
      licenseType: p.licenseType || "",
      activationType: p.activationType || "",
      hasVariants: p.hasVariants,
      stockQuantity: p.stockQuantity ?? 0,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      images: p.images || [],
    });
    setError("");
    setModalOpen(true);
  };

  const save = async () => {
    setError("");
    if (!form.categoryId) return setError("Please select a category");
    if (!form.title.trim()) return setError("Title is required");
    if (!form.price || form.price <= 0) return setError("Price must be greater than 0");

    setSaving(true);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: form });
        notify.success("Product updated");
      } else {
        await create.mutateAsync(form);
        notify.success("Product created");
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
      title: "Delete product?",
      message: "This action cannot be undone.",
      danger: true,
      action: async () => {
        try {
          await del.mutateAsync(id);
          notify.success("Product deleted");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const handleToggle = async (id: number) => {
    try {
      await toggle.mutateAsync(id);
      notify.success("Product status updated");
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const update_ = (k: keyof ProductRequest, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy">Products</h1>
          <p className="text-sm text-muted mt-1">
            {data?.totalElements || 0} products
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No products yet</p>
            <p className="text-sm mt-1">Click "Add Product" to create your first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft">
                <tr className="text-left text-xs text-muted uppercase">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-soft">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-soft rounded overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={p.thumbnailUrl || "https://placehold.co/40x40?text=P"}
                            alt=""
                            className="max-h-full max-w-full object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-navy text-xs line-clamp-1 max-w-[280px]">
                            {p.title}
                          </div>
                          {p.isFeatured && (
                            <span className="text-[10px] text-brand font-bold">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {p.categoryName}
                    </td>
                    <td className="px-4 py-3 font-bold text-navy">
                      ₹{p.price.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.hasVariants ? (
                        <Badge color="blue">Variants</Badge>
                      ) : (
                        <span className={p.stockQuantity && p.stockQuantity > 0 ? "text-success font-semibold" : "text-red-500"}>
                          {p.stockQuantity || 0}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(p.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {p.isActive ? (
                          <>
                            <Eye size={12} className="text-success" />
                            <Badge color="green">Active</Badge>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="text-gray-400" />
                            <Badge color="gray">Inactive</Badge>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="w-8 h-8 rounded hover:bg-brand/10 text-brand flex items-center justify-center"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(p.id)}
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
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-brand"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted px-3">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-brand"
          >
            Next →
          </button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Product" : "Add Product"}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => update_("categoryId", Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value={0}>— Select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Title"
            value={form.title}
            onChange={(e) => update_("title", e.target.value)}
            placeholder="Windows 11 Pro License"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="MRP (₹)"
              type="number"
              value={form.mrp ?? ""}
              onChange={(e) =>
                update_("mrp", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="399"
            />
            <Input
              label="Selling Price (₹)"
              type="number"
              value={form.price ?? ""}
              onChange={(e) => update_("price", Number(e.target.value))}
              placeholder="349"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">
              Short Description
            </label>
            <textarea
              value={form.shortDescription || ""}
              onChange={(e) => update_("shortDescription", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">
              Full Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => update_("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <Input
            label="Thumbnail URL"
            value={form.thumbnailUrl || ""}
            onChange={(e) => update_("thumbnailUrl", e.target.value)}
            placeholder="/uploads/product.png"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="License Type"
              value={form.licenseType || ""}
              onChange={(e) => update_("licenseType", e.target.value)}
              placeholder="Lifetime"
            />
            <Input
              label="Activation Type"
              value={form.activationType || ""}
              onChange={(e) => update_("activationType", e.target.value)}
              placeholder="Online"
            />
          </div>

          <Input
            label="Download File Path"
            value={form.downloadFilePath || ""}
            onChange={(e) => update_("downloadFilePath", e.target.value)}
            placeholder="/software/windows/win11.zip"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Stock Quantity"
              type="number"
              value={form.stockQuantity ?? 0}
              onChange={(e) => update_("stockQuantity", Number(e.target.value))}
            />
            <Input
              label="Display Order"
              type="number"
              value={form.displayOrder ?? 0}
              onChange={(e) => update_("displayOrder", Number(e.target.value))}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.hasVariants}
                onChange={(e) => update_("hasVariants", e.target.checked)}
              />
              Has Variants
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.isFeatured}
                onChange={(e) => update_("isFeatured", e.target.checked)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => update_("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button onClick={save} loading={saving} fullWidth>
              {editing ? "Update Product" : "Create Product"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              fullWidth
            >
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