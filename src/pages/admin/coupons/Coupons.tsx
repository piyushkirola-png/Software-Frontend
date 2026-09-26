import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  AlertCircle,
  CheckCircle,
  Filter,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import Reveal from "../../../components/animations/Reveal";
import { useAdminCoupons } from "../../../api/queries/useAdmin";
import {
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponActive,
} from "../../../api/mutations/adminMutations";
import { CouponRequest, Coupon } from "../../../api/services/adminService";
import { getErrorMessage } from "../../../lib/api-client";

const EMPTY: CouponRequest = {
  code: "",
  type: "PERCENT",
  value: 10,
  minOrderAmount: 0,
  perUserLimit: 1,
  isActive: true,
};

const PAGE_SIZE = 10;

export default function AdminCoupons() {
  const [page, setPage] = useState(0);

  const [filterStatus, setFilterStatus] = useState<"ALL" | "active" | "inactive">("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "PERCENT" | "FLAT">("ALL");
  const [filterValueMin, setFilterValueMin] = useState<string>("");
  const [filterValueMax, setFilterValueMax] = useState<string>("");

  const [draftStatus, setDraftStatus] = useState<"ALL" | "active" | "inactive">("ALL");
  const [draftType, setDraftType] = useState<"ALL" | "PERCENT" | "FLAT">("ALL");
  const [draftValueMin, setDraftValueMin] = useState<string>("");
  const [draftValueMax, setDraftValueMax] = useState<string>("");

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useAdminCoupons(
    page,
    PAGE_SIZE,
    filterStatus === "ALL" ? undefined : filterStatus,
    filterType === "ALL" ? undefined : filterType,
    filterValueMin ? Number(filterValueMin) : undefined,
    filterValueMax ? Number(filterValueMax) : undefined,
  );

  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const del = useDeleteCoupon();
  const toggle = useToggleCouponActive();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponRequest>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    coupon: Coupon | null;
  }>({ open: false, coupon: null });

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Close popover on outside click / ESC
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
  }, [filterOpen, filterStatus, filterType, filterValueMin, filterValueMax]);

  const coupons = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const hasFilters =
    filterStatus !== "ALL" ||
    filterType !== "ALL" ||
    filterValueMin !== "" ||
    filterValueMax !== "";

  const rangeStart = coupons.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + coupons.length;

  const openFilter = () => {
    setDraftStatus(filterStatus);
    setDraftType(filterType);
    setDraftValueMin(filterValueMin);
    setDraftValueMax(filterValueMax);
    setFilterOpen(true);
  };

  const closeFilterAndResetDrafts = () => {
    setFilterOpen(false);
    setDraftStatus(filterStatus);
    setDraftType(filterType);
    setDraftValueMin(filterValueMin);
    setDraftValueMax(filterValueMax);
  };

  const applyFilter = () => {
    setFilterStatus(draftStatus);
    setFilterType(draftType);
    setFilterValueMin(draftValueMin);
    setFilterValueMax(draftValueMax);
    setPage(0);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftStatus("ALL");
    setDraftType("ALL");
    setDraftValueMin("");
    setDraftValueMax("");
    setFilterStatus("ALL");
    setFilterType("ALL");
    setFilterValueMin("");
    setFilterValueMax("");
    setPage(0);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description,
      type: c.type as "PERCENT" | "FLAT",
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      perUserLimit: c.perUserLimit,
      startsAt: c.startsAt,
      expiresAt: c.expiresAt,
      isActive: c.isActive,
    });
    setError("");
    setModalOpen(true);
  };

  const save = async () => {
    setError("");
    if (!form.code.trim()) return setError("Code is required");
    if (!form.value || form.value <= 0) return setError("Value must be > 0");

    setSaving(true);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: form });
        setToast("Coupon updated");
      } else {
        await create.mutateAsync(form);
        setToast("Coupon created");
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

  const confirmDelete = (c: Coupon) => {
    setConfirmState({ open: true, coupon: c });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmState.coupon) return;
    try {
      await del.mutateAsync(confirmState.coupon.id);
      setToast("Coupon deleted");
      setConfirmState({ open: false, coupon: null });
    } catch (e) {
      setToast(getErrorMessage(e));
      setConfirmState({ open: false, coupon: null });
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggle.mutateAsync(id);
      setToast("Coupon status updated");
    } catch (e) {
      setToast(getErrorMessage(e));
    }
  };

  const update_ = (k: keyof CouponRequest, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Coupons</h1>
          <p className="text-muted mt-1 text-sm">
            Manage your discount coupons and offers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
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
              <div className="absolute right-0 mt-2 w-[460px] max-w-[92vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <option value="active">ACTIVE</option>
                      <option value="inactive">INACTIVE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Type
                    </label>
                    <select
                      value={draftType}
                      onChange={(e) => setDraftType(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      <option value="PERCENT">PERCENT (%)</option>
                      <option value="FLAT">FLAT (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Value Min
                    </label>
                    <input
                      type="number"
                      value={draftValueMin}
                      onChange={(e) => setDraftValueMin(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Value Max
                    </label>
                    <input
                      type="number"
                      value={draftValueMax}
                      onChange={(e) => setDraftValueMax(e.target.value)}
                      placeholder="1000"
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
            <Plus size={16} /> Add Coupon
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">Failed to load coupons</p>
          <button
            onClick={handleRefresh}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && coupons.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <Tag className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching coupons" : "No coupons yet"}
          </h2>
          <p className="text-sm text-muted">
            {hasFilters
              ? "Try clearing filters."
              : "Create your first coupon code."}
          </p>
        </div>
      )}

      {!isLoading && !isError && coupons.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Min Order</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-navy text-xs">
                        {c.code}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={c.type === "PERCENT" ? "green" : "yellow"}>
                          {c.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-navy">
                        {c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        ₹{c.minOrderAmount || 0}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.usedCount}/{c.usageLimit || "∞"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(c.id)}>
                          <Badge color={c.isActive ? "green" : "gray"}>
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
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

      {/* PAGINATION */}
      {!isLoading && !isError && coupons.length > 0 && (
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

      {/* ============ ADD / EDIT MODAL ============ */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-navy">
              {editing ? "Edit Coupon" : "Add Coupon"}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {editing ? "Update coupon details" : "Create a new coupon code"}
            </p>
          </div>

          {/* Row 1: Code + Type + Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Code"
              value={form.code}
              onChange={(e) => update_("code", e.target.value.toUpperCase())}
              placeholder="SAVE10"
            />
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => update_("type", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
              >
                <option value="PERCENT">Percent (%)</option>
                <option value="FLAT">Flat (₹)</option>
              </select>
            </div>
            <Input
              label="Value"
              type="number"
              value={form.value}
              onChange={(e) => update_("value", Number(e.target.value))}
            />
          </div>

          {/* Row 2: Description (full width) */}
          <Input
            label="Description"
            value={form.description || ""}
            onChange={(e) => update_("description", e.target.value)}
            placeholder="10% off on all products"
          />

          {/* Row 3: Min Order + Max Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Min Order (₹)"
              type="number"
              value={form.minOrderAmount ?? 0}
              onChange={(e) =>
                update_("minOrderAmount", Number(e.target.value))
              }
            />
            <Input
              label="Max Discount (₹)"
              type="number"
              value={form.maxDiscount ?? ""}
              onChange={(e) =>
                update_(
                  "maxDiscount",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </div>

          {/* Row 4: Usage Limit + Per User Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Usage Limit"
              type="number"
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                update_(
                  "usageLimit",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
            <Input
              label="Per User Limit"
              type="number"
              value={form.perUserLimit ?? 1}
              onChange={(e) => update_("perUserLimit", Number(e.target.value))}
            />
          </div>

          {/* Row 5: Active toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => update_("isActive", e.target.checked)}
            />
            Active
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Row 6: Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <Button onClick={save} loading={saving} fullWidth>
              {editing ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============ DELETE CONFIRM DIALOG ============ */}
      {createPortal(
        <AnimatePresence>
          {confirmState.open && confirmState.coupon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmState({ open: false, coupon: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-sm font-bold text-navy mb-1">
                  Delete {confirmState.coupon.code}?
                </h3>
                <p className="text-xs text-muted mb-5">
                  This will permanently remove the coupon. Cannot be undone.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() =>
                      setConfirmState({ open: false, coupon: null })
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