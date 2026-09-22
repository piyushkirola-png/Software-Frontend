import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  Ban,
  Key,
  Loader2,
  Plus,
  ChevronDown,
  Filter,
  RefreshCw,
  X,
  ChevronLeft,
  Check,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import Reveal from "../../../components/animations/Reveal";
import {
  useAdminKeys,
  useAdminProducts,
} from "../../../api/queries/useAdmin";
import {
  useAddKey,
  useBulkUploadKeys,
  useRevokeKey,
  useDeleteKey,
} from "../../../api/mutations/adminMutations";
import { getErrorMessage } from "../../../lib/api-client";

export default function AdminKeys() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [productId, setProductId] = useState<number | undefined>();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Filter popover
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftProductId, setDraftProductId] = useState<number | undefined>();
  const [draftSearch, setDraftSearch] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  // Applied search
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isRefetching } = useAdminKeys(
    page,
    10,
    status || undefined,
    productId,
    undefined,
    search || undefined,
  );
  const { data: productsData } = useAdminProducts(0, 100);

  const addKey = useAddKey();
  const bulkUpload = useBulkUploadKeys();
  const revoke = useRevokeKey();
  const del = useDeleteKey();

  const [uploadProductId, setUploadProductId] = useState<number>(0);
  const [uploadVariantId, setUploadVariantId] = useState<number | undefined>();
  const [uploadBatch, setUploadBatch] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);

  const [singleProductId, setSingleProductId] = useState<number>(0);
  const [singleVariantId, setSingleVariantId] = useState<number | undefined>();
  const [singleKey, setSingleKey] = useState("");
  const [singleBatch, setSingleBatch] = useState("");
  const [addError, setAddError] = useState("");

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    key: any | null;
    actionType: "revoke" | "delete";
  }>({ open: false, key: null, actionType: "revoke" });

  interface ProductOption {
    id: number;
    title: string;
  }

  interface ProductSelectProps {
    products: ProductOption[];
    value: number | undefined;
    onChange: (id: number | undefined) => void;
    placeholder?: string;
    visibleCount?: number;
    allowAll?: boolean;
    className?: string;
  }

  function ProductSelect({
    products,
    value,
    onChange,
    placeholder = "— Select Product —",
    visibleCount = 10,
    allowAll = false,
    className = "",
  }: ProductSelectProps) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

    const selected = products.find((p) => p.id === value);
    const label = selected ? selected.title : placeholder;

    // Compute the panel position whenever it opens (and on scroll/resize)
    const updatePosition = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ITEM_HEIGHT = 25;
      const maxHeight = visibleCount * ITEM_HEIGHT;
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxHeight,
        zIndex: 9999,
      });
    };

    useEffect(() => {
      if (!open) return;
      updatePosition();

      const onScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);

      const onClickOutside = (e: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
          setFilterOpen(false);
          setDraftStatus(status);
          setDraftProductId(productId);
          setDraftSearch(search);
        }
      };
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setFilterOpen(false);
          setDraftStatus(status);
          setDraftProductId(productId);
          setDraftSearch(search);
        }
      };

      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEsc);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
        document.removeEventListener("mousedown", onClickOutside);
        document.removeEventListener("keydown", onEsc);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, visibleCount]);

    return (
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-left focus:outline-none focus:border-brand transition"
        >
          <span
            className={selected ? "text-navy truncate" : "text-muted truncate"}
          >
            {label}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""
              }`}
          />
        </button>

        {open &&
          createPortal(
            <div
              ref={panelRef}
              style={panelStyle}
              className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-y-auto"
            >
              {allowAll && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-navy hover:bg-soft transition"
                >
                  <span>All</span>
                  {value === undefined && (
                    <Check size={14} className="text-brand shrink-0" />
                  )}
                </button>
              )}

              {products.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted text-center">
                  No products
                </div>
              )}

              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left transition ${value === p.id
                    ? "bg-brand/5 text-brand font-semibold"
                    : "text-navy hover:bg-soft"
                    }`}
                >
                  <span className="truncate">{p.title}</span>
                  {value === p.id && (
                    <Check size={14} className="text-brand shrink-0" />
                  )}
                </button>
              ))}
            </div>,
            document.body
          )}
      </div>
    );
  }

  const [toast, setToast] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Close filter on outside click / ESC
  useEffect(() => {
    if (!filterOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setDraftStatus(status);
        setDraftProductId(productId);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setDraftStatus(status);
        setDraftProductId(productId);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [filterOpen, status, productId, search]);

  const products = productsData?.content || [];
  const keys = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;
  const hasAnyVariant = keys.some((k: any) => !!k.variantName);
  const hasFilters =
    status !== "" || productId !== undefined || search.trim() !== "";

  const openFilter = () => {
    setDraftStatus(status);
    setDraftProductId(productId);
    setDraftSearch(search);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setStatus(draftStatus);
    setProductId(draftProductId);
    setSearch(draftSearch);
    setPage(0);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftStatus("");
    setDraftProductId(undefined);
    setDraftSearch("");
    setStatus("");
    setProductId(undefined);
    setSearch("");
    setPage(0);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  const handleUpload = async () => {
    setUploadError("");
    if (!uploadProductId) return setUploadError("Select a product");
    if (!uploadFile) return setUploadError("Select a CSV file");

    try {
      const result = await bulkUpload.mutateAsync({
        file: uploadFile,
        productId: uploadProductId,
        variantId: uploadVariantId,
        batchName: uploadBatch || undefined,
      });
      setUploadResult(result);
      setToast(`Uploaded ${result.inserted} key(s)`);
    } catch (e) {
      const msg = getErrorMessage(e);
      setUploadError(msg);
      setToast(msg);
    }
  };

  const handleAddSingle = async () => {
    setAddError("");
    if (!singleProductId) return setAddError("Select a product");
    if (!singleKey.trim()) return setAddError("Enter a license key");

    try {
      await addKey.mutateAsync({
        productId: singleProductId,
        variantId: singleVariantId,
        licenseKey: singleKey.trim(),
        batchName: singleBatch || undefined,
      });
      setAddOpen(false);
      setSingleKey("");
      setSingleBatch("");
      setSingleProductId(0);
      setSingleVariantId(undefined);
      setToast("License key added");
    } catch (e) {
      const msg = getErrorMessage(e);
      setAddError(msg);
      setToast(msg);
    }
  };

  const confirmRevoke = (k: any) => {
    setConfirmState({ open: true, key: k, actionType: "revoke" });
  };

  const confirmDelete = (k: any) => {
    setConfirmState({ open: true, key: k, actionType: "delete" });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.key) return;
    try {
      if (confirmState.actionType === "revoke") {
        await revoke.mutateAsync(confirmState.key.id);
        setToast("Key revoked");
      } else {
        await del.mutateAsync(confirmState.key.id);
        setToast("Key deleted");
      }
      setConfirmState({ open: false, key: null, actionType: "revoke" });
    } catch (e) {
      setToast(getErrorMessage(e));
      setConfirmState({ open: false, key: null, actionType: "revoke" });
    }
  };

  const confirmPending = revoke.isPending || del.isPending;

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            License Keys
          </h1>
          <p className="text-muted mt-1 text-sm">
            Manage your software license keys inventory
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter popover */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => (filterOpen ? setFilterOpen(false) : openFilter())}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border text-sm font-semibold transition ${hasFilters
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
              <div className="absolute right-0 mt-2 w-[520px] max-w-[92vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-navy uppercase tracking-wider">
                    Filters
                  </span>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 text-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Key name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={draftSearch}
                      onChange={(e) => setDraftSearch(e.target.value)}
                      placeholder="Search by license key..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="">All</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="SOLD">Sold</option>
                      <option value="REVOKED">Revoked</option>
                    </select>
                  </div>

                  {/* Product */}
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Product
                    </label>
                    <ProductSelect
                      products={products}
                      value={draftProductId}
                      onChange={setDraftProductId}
                      placeholder="All"
                      allowAll
                      visibleCount={10}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={clearFilter}
                    className="flex-1 rounded-lg px-3 py-1.5 border border-gray-200 text-[11px] font-semibold text-navy hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyFilter}
                    className="flex-1 rounded-lg px-3 py-1.5 bg-brand text-white text-[11px] font-semibold hover:bg-brand-dark transition"
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

          {/* Add One */}
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm font-semibold text-navy hover:bg-gray-50 transition"
          >
            <Plus size={16} /> Add One
          </button>

          {/* Bulk Upload */}
          <Button onClick={() => setUploadOpen(true)}>
            <Upload size={16} /> Bulk Upload
          </Button>
        </div>
      </div>

      {/* ============ LOADING ============ */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!isLoading && keys.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <Key className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching keys" : "No keys yet"}
          </h2>
          <p className="text-sm text-muted">
            {hasFilters
              ? "Try clearing filters."
              : "Upload keys to start selling."}
          </p>
        </div>
      )}

      {/* ============ TABLE ============ */}
      {!isLoading && keys.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Product</th>
                    {hasAnyVariant && <th className="px-4 py-3">Variant</th>}
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr
                      key={k.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-navy max-w-[200px] truncate">
                        {k.licenseKey}
                      </td>
                      <td className="px-4 py-3 text-xs text-navy line-clamp-1">
                        {k.productTitle}
                      </td>
                      {hasAnyVariant && (
                        <td className="px-4 py-3 text-xs text-muted">
                          {k.variantName || "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Badge
                          color={
                            k.status === "AVAILABLE"
                              ? "green"
                              : k.status === "RESERVED"
                                ? "yellow"
                                : k.status === "SOLD"
                                  ? "blue"
                                  : "red"
                          }
                        >
                          {k.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {k.status !== "SOLD" && k.status !== "REVOKED" && (
                            <button
                              onClick={() => confirmRevoke(k)}
                              className="w-8 h-8 rounded-lg hover:bg-yellow-50 text-yellow-600 flex items-center justify-center"
                              title="Revoke"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                          {k.status !== "SOLD" && (
                            <button
                              onClick={() => confirmDelete(k)}
                              className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* ============ PAGINATION ============ */}
      {!isLoading && keys.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="text-xs text-muted">
            Showing{" "}
            <span className="font-semibold text-navy">
              {page * 50 + 1}
            </span>
            {" – "}
            <span className="font-semibold text-navy">
              {page * 50 + keys.length}
            </span>{" "}
            of <span className="font-semibold text-navy">{totalElements}</span>
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

      {/* ============ BULK UPLOAD MODAL ============ */}
      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadResult(null);
          setUploadError("");
          setUploadFile(null);
        }}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-navy">
              Bulk Upload License Keys
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Upload a CSV file to add multiple keys at once
            </p>
          </div>

          {uploadResult ? (
            <>
              <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-sm">
                <div className="font-bold text-success mb-2">
                  Upload Complete
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    Total rows: <b>{uploadResult.totalRows}</b>
                  </div>
                  <div>
                    Inserted:{" "}
                    <b className="text-success">{uploadResult.inserted}</b>
                  </div>
                  <div>
                    Skipped:{" "}
                    <b className="text-yellow-600">{uploadResult.skipped}</b>
                  </div>
                </div>
              </div>
              {uploadResult.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                  <div className="text-xs font-bold text-red-600 mb-1">
                    Errors:
                  </div>
                  {uploadResult.errors.map((e: string, i: number) => (
                    <div key={i} className="text-[11px] text-red-500">
                      {e}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadOpen(false);
                    setUploadResult(null);
                    setUploadFile(null);
                  }}
                  className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                >
                  Close
                </button>
                <Button
                  fullWidth
                  onClick={() => {
                    setUploadResult(null);
                    setUploadFile(null);
                  }}
                >
                  Upload More
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                  Product
                </label>
                <ProductSelect
                  products={products}
                  value={uploadProductId || undefined}
                  onChange={(id) => {
                    setUploadProductId(id ?? 0);
                    setUploadVariantId(undefined);
                  }}
                  placeholder="— Select Product —"
                  visibleCount={10}
                />
              </div>

              <Input
                label="Batch Name (optional)"
                value={uploadBatch}
                onChange={(e) => setUploadBatch(e.target.value)}
                placeholder="Feb2026"
              />

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border border-gray-200 rounded-xl p-2"
                />
                <p className="text-[11px] text-muted mt-2">
                  Format: one license key per line. Header row is auto-skipped.
                </p>
              </div>

              {uploadError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  disabled={bulkUpload.isPending}
                  className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <Button
                  fullWidth
                  onClick={handleUpload}
                  loading={bulkUpload.isPending}
                  disabled={!uploadFile || !uploadProductId}
                >
                  Upload
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ============ ADD SINGLE MODAL ============ */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-navy">
              Add Single License Key
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Add one key manually
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
              Product
            </label>
            <ProductSelect
              products={products}
              value={singleProductId || undefined}
              onChange={(id) => setSingleProductId(id ?? 0)}
              placeholder="— Select Product —"
              visibleCount={10}
            />
          </div>

          <Input
            label="License Key"
            value={singleKey}
            onChange={(e) => setSingleKey(e.target.value)}
            placeholder="XXXXX-XXXXX-XXXXX"
          />

          <Input
            label="Batch Name (optional)"
            value={singleBatch}
            onChange={(e) => setSingleBatch(e.target.value)}
          />

          {addError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
              {addError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              disabled={addKey.isPending}
              className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <Button fullWidth onClick={handleAddSingle} loading={addKey.isPending}>
              Add Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============ CONFIRM DIALOG (Astro style) ============ */}
      {createPortal(
        <AnimatePresence>
          {confirmState.open && confirmState.key && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() =>
                setConfirmState({ open: false, key: null, actionType: "revoke" })
              }
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-sm font-bold text-navy mb-1">
                  {confirmState.actionType === "revoke"
                    ? "Revoke this key?"
                    : "Delete this key?"}
                </h3>
                <p className="text-xs text-muted mb-5">
                  {confirmState.actionType === "revoke"
                    ? "The key will no longer be sellable."
                    : "This action cannot be undone."}
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() =>
                      setConfirmState({
                        open: false,
                        key: null,
                        actionType: "revoke",
                      })
                    }
                    disabled={confirmPending}
                    className="flex-1 rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={confirmPending}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-white text-xs font-semibold disabled:opacity-60 ${confirmState.actionType === "revoke"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-red-600 hover:bg-red-700"
                      }`}
                  >
                    {confirmPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : confirmState.actionType === "revoke" ? (
                      "Revoke"
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
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
        document.body
      )}
    </div>
  );
}