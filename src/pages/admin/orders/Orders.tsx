import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  PackageX,
  AlertCircle,
  Filter,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/animations/Reveal";
import { useAdminOrders } from "../../../api/queries/useAdmin";
import { useUpdateOrderStatus } from "../../../api/mutations/adminMutations";
import { orderService } from "../../../api/services/orderService";
import { Order } from "../../../types/order";
import { getErrorMessage } from "../../../lib/api-client";

type StatusFilter = "ALL" | "PENDING" | "SUCCESS" | "FAILED";

export default function AdminOrders() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  // filters
  const [customer, setCustomer] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState<StatusFilter>("ALL");
  const [draftMinAmount, setDraftMinAmount] = useState<string>("");
  const [draftMaxAmount, setDraftMaxAmount] = useState<string>("");

  // draft
  const [draftCustomer, setDraftCustomer] = useState<string>("");
  const [draftProduct, setDraftProduct] = useState<string>("");

  const filterRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useAdminOrders(
    page,
    10,
    status !== "ALL" ? status : undefined,
    search || undefined
  );

  const updateStatus = useUpdateOrderStatus();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    order: Order | null;
    newStatus: string;
  }>({ open: false, order: null, newStatus: "" });

  const [toast, setToast] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!filterOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setDraftSearch(search);
        setDraftStatus(status);
        setDraftMinAmount(minAmount);
        setDraftMaxAmount(maxAmount);
        setDraftCustomer(customer);
        setDraftProduct(product);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setDraftSearch(search);
        setDraftStatus(status);
        setDraftMinAmount(minAmount);
        setDraftMaxAmount(maxAmount);
        setDraftCustomer(customer);
        setDraftProduct(product);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [filterOpen, search, status, minAmount, maxAmount, customer, product]);

  const rawOrders = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  // Client-side filters: amount, customer, product
  const orders = useMemo(() => {
    const min = minAmount ? Number(minAmount) : null;
    const max = maxAmount ? Number(maxAmount) : null;
    const cq = customer.trim().toLowerCase();
    const pq = product.trim().toLowerCase();

    return rawOrders.filter((o) => {
      if (min !== null && o.total < min) return false;
      if (max !== null && o.total > max) return false;

      if (cq) {
        const name = (o.customerName || "").toLowerCase();
        const email = (o.customerEmail || "").toLowerCase();
        if (!name.includes(cq) && !email.includes(cq)) return false;
      }

      if (pq) {
        const match = (o.items || []).some((it) =>
          (it.productTitle || "").toLowerCase().includes(pq)
        );
        if (!match) return false;
      }

      return true;
    });
  }, [rawOrders, minAmount, maxAmount, customer, product]);

  const stats = useMemo(() => {
    const success = orders.filter((o) => o.status === "SUCCESS").length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const failed = orders.filter((o) => o.status === "FAILED").length;
    return { success, pending, failed };
  }, [orders]);

  const hasFilters =
    search !== "" ||
    status !== "ALL" ||
    minAmount !== "" ||
    maxAmount !== "" ||
    customer !== "" ||
    product !== "";

  const rangeStart = orders.length === 0 ? 0 : page * 20 + 1;
  const rangeEnd = page * 20 + orders.length;

  const openFilter = () => {
    setDraftSearch(search);
    setDraftStatus(status);
    setDraftMinAmount(minAmount);
    setDraftMaxAmount(maxAmount);
    setDraftCustomer(customer);
    setDraftProduct(product);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setSearch(draftSearch);
    setStatus(draftStatus);
    setMinAmount(draftMinAmount);
    setMaxAmount(draftMaxAmount);
    setCustomer(draftCustomer);
    setProduct(draftProduct);
    setPage(0);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftSearch("");
    setDraftStatus("ALL");
    setDraftMinAmount("");
    setDraftMaxAmount("");
    setDraftCustomer("");
    setDraftProduct("");
    setSearch("");
    setStatus("ALL");
    setMinAmount("");
    setMaxAmount("");
    setCustomer("");
    setProduct("");
    setPage(0);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await orderService.exportCsv();
      setToast("CSV exported successfully");
    } catch {
      setToast("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  const handleDownloadInvoice = async (orderId: number) => {
    setDownloading(orderId);
    try {
      await orderService.downloadInvoice(orderId);
      setToast("Invoice downloaded");
    } catch {
      setToast("Failed to download invoice");
    } finally {
      setDownloading(null);
    }
  };

  const changeStatus = (o: Order, newStatus: string) => {
    setConfirmState({ open: true, order: o, newStatus });
  };

  const handleStatusConfirm = async () => {
    if (!confirmState.order) return;
    try {
      await updateStatus.mutateAsync({
        id: confirmState.order.id,
        status: confirmState.newStatus,
      });
      setToast(`Order marked ${confirmState.newStatus}`);
      setConfirmState({ open: false, order: null, newStatus: "" });
      setSelected(null);
    } catch (e) {
      setToast(getErrorMessage(e));
      setConfirmState({ open: false, order: null, newStatus: "" });
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Orders</h1>
          <p className="text-muted mt-1 text-sm">
            Manage all customer orders on the platform
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              <div className="absolute right-0 mt-2 w-[560px] max-w-[92vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Search */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Search (order id, email, name)
                    </label>
                    <input
                      type="text"
                      value={draftSearch}
                      onChange={(e) => setDraftSearch(e.target.value)}
                      placeholder="SU-2026..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={draftStatus}
                      onChange={(e) =>
                        setDraftStatus(e.target.value as StatusFilter)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>

                  {/* 🆕 Customer name / email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Customer (name or email)
                    </label>
                    <input
                      type="text"
                      value={draftCustomer}
                      onChange={(e) => setDraftCustomer(e.target.value)}
                      placeholder="John / john@example.com"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* 🆕 Product name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Product name
                    </label>
                    <input
                      type="text"
                      value={draftProduct}
                      onChange={(e) => setDraftProduct(e.target.value)}
                      placeholder="Windows 11"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* Amount Min */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Amount Min (₹)
                    </label>
                    <input
                      type="number"
                      value={draftMinAmount}
                      onChange={(e) => setDraftMinAmount(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* Amount Max */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Amount Max (₹)
                    </label>
                    <input
                      type="number"
                      value={draftMaxAmount}
                      onChange={(e) => setDraftMaxAmount(e.target.value)}
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

          {/* Export CSV */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm font-semibold text-navy hover:bg-gray-50 disabled:opacity-60 transition"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Export CSV
          </button>

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
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Success
            </span>
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div className="text-3xl font-bold text-navy">{stats.success}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Pending
            </span>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="text-3xl font-bold text-navy">{stats.pending}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Failed
            </span>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy">{stats.failed}</div>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">Failed to load orders</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <PackageX className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching orders" : "No orders yet"}
          </h2>
          <p className="text-sm text-muted">
            {hasFilters
              ? "Try clearing filters."
              : "Orders will appear here once customers start buying."}
          </p>
        </div>
      )}

      {/* TABLE */}
      {!isLoading && !isError && orders.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const firstItem = o.items[0];
                    const extraCount = o.items.length - 1;
                    return (
                      <tr
                        key={o.id}
                        className="border-t border-gray-100 hover:bg-soft/50 transition"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-xs text-navy whitespace-nowrap">
                          {o.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-navy">
                            {o.customerName}
                          </div>
                          <div className="text-[11px] text-muted">
                            {o.customerEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-navy">
                          <div className="line-clamp-1 max-w-[200px]">
                            {firstItem?.productTitle || "—"}
                          </div>
                          {extraCount > 0 && (
                            <span className="text-[10px] text-muted">
                              +{extraCount} more
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {o.items.length}
                        </td>
                        <td className="px-4 py-3 font-bold text-navy whitespace-nowrap">
                          ₹{o.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            color={
                              o.status === "SUCCESS"
                                ? "green"
                                : o.status === "FAILED"
                                  ? "red"
                                  : "yellow"
                            }
                          >
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDownloadInvoice(o.id)}
                            disabled={downloading === o.id}
                            title="Download Invoice"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 transition"
                          >
                            {downloading === o.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* PAGINATION */}
      {!isLoading && !isError && orders.length > 0 && (
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

      {/* VIEW MODAL */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy">
                Order {selected.orderNumber}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {new Date(selected.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted">Customer</div>
                <div className="font-semibold text-navy">
                  {selected.customerName}
                </div>
                <div className="text-xs text-muted">
                  {selected.customerEmail}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Status</div>
                <Badge
                  color={
                    selected.status === "SUCCESS"
                      ? "green"
                      : selected.status === "FAILED"
                        ? "red"
                        : "yellow"
                  }
                >
                  {selected.status}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted">Subtotal</div>
                <div className="font-semibold">
                  ₹{selected.subtotal.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Total</div>
                <div className="font-bold text-navy text-lg">
                  ₹{selected.total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs font-bold text-navy uppercase mb-2">
                Items
              </div>
              {selected.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-navy line-clamp-1">
                      {item.productTitle}
                    </div>
                    {item.variantName && (
                      <div className="text-[11px] text-muted">
                        {item.variantName}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-navy">
                    ₹{item.lineTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {selected.status === "PENDING" && (
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-bold text-navy uppercase mb-2">
                  Manually update status
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => changeStatus(selected, "SUCCESS")}
                  >
                    Mark SUCCESS
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => changeStatus(selected, "FAILED")}
                  >
                    Mark FAILED
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CONFIRM DIALOG */}
      {createPortal(
        <AnimatePresence>
          {confirmState.open && confirmState.order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() =>
                setConfirmState({ open: false, order: null, newStatus: "" })
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
                  Mark order as {confirmState.newStatus}?
                </h3>
                <p className="text-xs text-muted mb-5">
                  {confirmState.newStatus === "SUCCESS"
                    ? "Keys will be marked SOLD. This action is usually irreversible."
                    : "Reserved keys will be released back to AVAILABLE."}
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() =>
                      setConfirmState({
                        open: false,
                        order: null,
                        newStatus: "",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="flex-1 rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusConfirm}
                    disabled={updateStatus.isPending}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-white text-xs font-semibold disabled:opacity-60 ${confirmState.newStatus === "FAILED"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-brand hover:bg-brand-dark"
                      }`}
                  >
                    {updateStatus.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* TOAST */}
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