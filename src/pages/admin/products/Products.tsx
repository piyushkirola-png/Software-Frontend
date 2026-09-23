import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  PackageX,
  Filter,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import {
  useAdminProducts,
  useAdminCategories,
} from "../../../api/queries/useAdmin";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../../api/mutations/adminMutations";
import { ProductRequest } from "../../../api/services/adminService";
import { Product } from "../../../types/product";
import { getErrorMessage } from "../../../lib/api-client";
import ImageUploader from "../../../components/ui/ImageUploader";
import { resolveImageUrl } from "../../../lib/upload";

const EMPTY: ProductRequest = {
  categoryId: 0,
  title: "",
  price: 0,
  hasVariants: false,
  isFeatured: false,
  isActive: true,
};

const LICENSE_OPTIONS = ["1 User", "2 User", "3 User", "5 User", "10 User"];
const DURATION_OPTIONS = ["1 Year", "3 Year"];

export default function AdminProducts() {
  const { showToast } = useAuthContext();
  const [page, setPage] = useState(0);

  const { data, isLoading, refetch, isRefetching } = useAdminProducts(page, 10);
  const { data: categories = [] } = useAdminCategories();

  const create = useCreateProduct();
  const update = useUpdateProduct();
  const del = useDeleteProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  const [toast, setToast] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── APPLIED filters ─────────────────────────────
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "active" | "inactive"
  >("ALL");
  const [filterLicense, setFilterLicense] = useState<string>("ALL");
  const [filterPriceMin, setFilterPriceMin] = useState<string>("");
  const [filterPriceMax, setFilterPriceMax] = useState<string>("");

  // ── DRAFT filters (popover) ─────────────────────
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<number | "ALL">("ALL");
  const [draftStatus, setDraftStatus] = useState<"ALL" | "active" | "inactive">(
    "ALL",
  );
  const [draftLicense, setDraftLicense] = useState<string>("ALL");
  const [draftPriceMin, setDraftPriceMin] = useState<string>("");
  const [draftPriceMax, setDraftPriceMax] = useState<string>("");

  const filterRef = useRef<HTMLDivElement>(null);

  // ── Toast auto-dismiss ──────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Close popover on outside click / ESC ────────
  useEffect(() => {
    if (!filterOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        closeFilterAndResetDrafts();
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFilterAndResetDrafts();
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [
    filterOpen,
    filterName,
    filterCategory,
    filterStatus,
    filterLicense,
    filterPriceMin,
    filterPriceMax,
  ]);

  const products = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const filtered = useMemo(() => {
    const min = filterPriceMin ? Number(filterPriceMin) : null;
    const max = filterPriceMax ? Number(filterPriceMax) : null;
    const q = filterName.trim().toLowerCase();

    return products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (filterCategory !== "ALL" && p.categoryId !== filterCategory)
        return false;
      if (filterStatus === "active" && !p.isActive) return false;
      if (filterStatus === "inactive" && p.isActive) return false;
      if (filterLicense !== "ALL" && p.licenseType !== filterLicense)
        return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      return true;
    });
  }, [
    products,
    filterName,
    filterCategory,
    filterStatus,
    filterLicense,
    filterPriceMin,
    filterPriceMax,
  ]);

  const rangeStart = filtered.length === 0 ? 0 : page * 20 + 1;
  const rangeEnd = page * 20 + filtered.length;

  const hasFilters =
    filterName !== "" ||
    filterCategory !== "ALL" ||
    filterStatus !== "ALL" ||
    filterLicense !== "ALL" ||
    filterPriceMin !== "" ||
    filterPriceMax !== "";

  const licenseTypes = LICENSE_OPTIONS;

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
      displayOrder: p.displayOrder ?? 0,
      images: p.images || [],
    });
    setError("");
    setModalOpen(true);
  };

  const save = async () => {
    setError("");
    if (!form.categoryId) return setError("Please select a category");
    if (!form.title.trim()) return setError("Title is required");
    if (!form.price || form.price <= 0)
      return setError("Price must be greater than 0");

    setSaving(true);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: form });
        setToast("Product updated");
      } else {
        await create.mutateAsync(form);
        setToast("Product created");
      }
      setModalOpen(false);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      setToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p: Product) => {
    setConfirmState({ open: true, product: p });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmState.product) return;
    try {
      await del.mutateAsync(confirmState.product.id);
      setToast("Product deleted");
      setConfirmState({ open: false, product: null });
    } catch (e) {
      setToast(getErrorMessage(e));
      setConfirmState({ open: false, product: null });
    }
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  const openFilter = () => {
    setDraftName(filterName);
    setDraftCategory(filterCategory);
    setDraftStatus(filterStatus);
    setDraftLicense(filterLicense);
    setDraftPriceMin(filterPriceMin);
    setDraftPriceMax(filterPriceMax);
    setFilterOpen(true);
  };

  const closeFilterAndResetDrafts = () => {
    setFilterOpen(false);
    setDraftName(filterName);
    setDraftCategory(filterCategory);
    setDraftStatus(filterStatus);
    setDraftLicense(filterLicense);
    setDraftPriceMin(filterPriceMin);
    setDraftPriceMax(filterPriceMax);
  };

  const applyFilter = () => {
    setFilterName(draftName);
    setFilterCategory(draftCategory);
    setFilterStatus(draftStatus);
    setFilterLicense(draftLicense);
    setFilterPriceMin(draftPriceMin);
    setFilterPriceMax(draftPriceMax);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftName("");
    setDraftCategory("ALL");
    setDraftStatus("ALL");
    setDraftLicense("ALL");
    setDraftPriceMin("");
    setDraftPriceMax("");

    setFilterName("");
    setFilterCategory("ALL");
    setFilterStatus("ALL");
    setFilterLicense("ALL");
    setFilterPriceMin("");
    setFilterPriceMax("");

    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const update_ = (k: keyof ProductRequest, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Products</h1>
          <p className="text-muted mt-1 text-sm">
            Manage your software products catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => (filterOpen ? setFilterOpen(false) : openFilter())}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border text-sm font-semibold transition ${
                hasFilters
                  ? "border-brand/40 bg-brand/5 text-brand"
                  : "border-gray-200 text-navy hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasFilters && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-[560px] max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider">
                    Filters
                  </span>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 text-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Row 1: Name */}
                <div className="mb-3">
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Search by product title..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Row 2: Category + Status + License */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={draftCategory}
                      onChange={(e) =>
                        setDraftCategory(
                          e.target.value === "ALL"
                            ? "ALL"
                            : Number(e.target.value),
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      License Type
                    </label>
                    <select
                      value={draftLicense}
                      onChange={(e) => setDraftLicense(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      {licenseTypes.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Price Min + Max */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Price Min (₹)
                    </label>
                    <input
                      type="number"
                      value={draftPriceMin}
                      onChange={(e) => setDraftPriceMin(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Price Max (₹)
                    </label>
                    <input
                      type="number"
                      value={draftPriceMax}
                      onChange={(e) => setDraftPriceMax(e.target.value)}
                      placeholder="100000"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={clearFilter}
                    className="flex-1 rounded-lg px-3 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyFilter}
                    className="flex-1 rounded-lg px-3 py-2 bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm font-semibold text-navy hover:bg-gray-50 disabled:opacity-60 transition"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {/* Add */}
          <Button onClick={openCreate}>
            <Plus size={16} /> Add Product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <PackageX className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching products" : "No products yet"}
          </h2>
          <p className="text-sm text-muted">
            {hasFilters
              ? "Try clearing filters."
              : 'Click "Add Product" to create your first one.'}
          </p>
        </div>
      ) : (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-xs">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Cutted Price</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">License</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-soft rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={resolveImageUrl(p.thumbnailUrl)}
                              alt=""
                              className="max-h-full max-w-full object-contain p-0.5"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "https://placehold.co/40x40?text=P";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-navy text-xs line-clamp-1 max-w-[220px]">
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
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {p.categoryName || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {p.mrp ? (
                          <span className="text-muted line-through">
                            ₹{p.mrp.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-navy whitespace-nowrap">
                        ₹{p.price.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {p.hasVariants ? (
                          <Badge color="blue">Variants</Badge>
                        ) : (
                          <span
                            className={
                              p.stockQuantity && p.stockQuantity > 0
                                ? "text-success font-semibold"
                                : "text-red-600"
                            }
                          >
                            {p.stockQuantity || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {p.licenseType || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {p.activationType || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {p.displayOrder ?? 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.isActive ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-8 h-8 rounded-lg hover:bg-brand/10 text-brand flex items-center justify-center"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(p)}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center"
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

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="text-xs text-muted">
            Showing{" "}
            <span className="font-semibold text-navy">{rangeStart}</span>
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

      {/* ============ ADD / EDIT MODAL ============ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-navy">
              {editing ? "Edit Product" : "Add Product"}
            </h3>
            <p className="text-[10px] text-muted mt-0.5">
              {editing ? "Update product details" : "Create a new product"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => update_("categoryId", Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
              >
                <option value={0}>— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => update_("title", e.target.value)}
                placeholder="Windows 11 Pro License"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                Slug
              </label>
              <input
                value={form.slug || ""}
                onChange={(e) => update_("slug", e.target.value)}
                placeholder="windows-11-pro"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Cutted Price (₹)", key: "mrp", placeholder: "1000" },
              { label: "Price (₹)", key: "price", placeholder: "500" },
              { label: "Stock", key: "stockQuantity", placeholder: "0" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                  {f.label}
                </label>
                <input
                  type="number"
                  value={(form as any)[f.key] ?? ""}
                  onChange={(e) =>
                    update_(
                      f.key as any,
                      e.target.value
                        ? Number(e.target.value)
                        : f.key === "mrp"
                          ? undefined
                          : 0,
                    )
                  }
                  placeholder={f.placeholder}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
              Short Description
            </label>
            <textarea
              value={form.shortDescription || ""}
              onChange={(e) => update_("shortDescription", e.target.value)}
              rows={2}
              placeholder="Brief summary shown on listing cards..."
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
              Full Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => update_("description", e.target.value)}
              rows={3}
              placeholder="Detailed product description..."
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand resize-none"
            />
          </div>

          <div className="grid grid-cols-1">
            <ImageUploader
              label="Thumbnail"
              value={form.thumbnailUrl || ""}
              onChange={(url) => update_("thumbnailUrl", url)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                License Type
              </label>
              <select
                value={form.licenseType || ""}
                onChange={(e) => update_("licenseType", e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
              >
                <option value="">— Select —</option>
                {LICENSE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                Duration
              </label>
              <select
                value={form.activationType || ""}
                onChange={(e) => update_("activationType", e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
              >
                <option value="">— Select —</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                Display Order
              </label>
              <input
                type="number"
                value={form.displayOrder ?? 0}
                onChange={(e) =>
                  update_("displayOrder", Number(e.target.value))
                }
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                key: "hasVariants",
                label: "Variants",
                activeColor: "bg-brand",
                borderColor: "border-brand/30 bg-brand/5",
                textColor: "text-brand",
              },
              {
                key: "isFeatured",
                label: "Featured",
                activeColor: "bg-warning",
                borderColor: "border-warning/30 bg-warning/5",
                textColor: "text-warning",
              },
              {
                key: "isActive",
                label: "Active",
                activeColor: "bg-success",
                borderColor: "border-success/30 bg-success/5",
                textColor: "text-success",
              },
            ].map((t) => {
              const val = !!(form as any)[t.key];
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => update_(t.key as any, !val)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition ${
                    val ? t.borderColor : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span
                    className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition ${
                      val ? t.activeColor : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow transition ${
                        val ? "translate-x-[12px]" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      val ? t.textColor : "text-muted"
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-[10px] text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <Button onClick={save} loading={saving} fullWidth>
              {editing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============ DELETE CONFIRM DIALOG ============ */}
      {createPortal(
        <AnimatePresence>
          {confirmState.open && confirmState.product && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmState({ open: false, product: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-sm font-bold text-navy mb-1">
                  Delete {confirmState.product.title}?
                </h3>
                <p className="text-xs text-muted mb-5">
                  This will permanently remove the product. Cannot be undone.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() =>
                      setConfirmState({ open: false, product: null })
                    }
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

      {/* ============ TOAST ============ */}
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
