import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
} from "lucide-react";

const PAGE_SIZE = 10;

// ============ TYPES ============
interface PaymentRecord {
  id: number;
  gatewayOrderId: string;
  orderNumber?: string;
  productTitle?: string;
  productName?: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED" | string;
  gateway: string;
  utr?: string | null;
  createdAt: string;
}

// ============ FAKE SERVICE PLACEHOLDER ============
// Replace with real `adminService.listAllPayments()` etc.
const paymentService = {
  listAllPayments: async (): Promise<PaymentRecord[]> => {
    return [];
  },
  exportAllCsv: async (): Promise<void> => {
    throw new Error("Not implemented");
  },
  downloadInvoice: async (_orderId: string): Promise<void> => {
    throw new Error("Not implemented");
  },
};

export default function AdminPayments() {
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");

  const [draftOrderId, setDraftOrderId] = useState("");
  const [draftStatus, setDraftStatus] = useState("ALL");
  const [draftGateway, setDraftGateway] = useState("ALL");

  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  // ============ FETCH ============
  const fetchPayments = async () => {
    try {
      const res = await paymentService.listAllPayments();
      setData(res);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ============ TOAST ============
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // ============ OUTSIDE CLICK / ESC ============
  useEffect(() => {
    if (!filterOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setDraftOrderId(orderIdFilter);
        setDraftStatus(statusFilter);
        setDraftGateway(gatewayFilter);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setDraftOrderId(orderIdFilter);
        setDraftStatus(statusFilter);
        setDraftGateway(gatewayFilter);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [filterOpen, orderIdFilter, statusFilter, gatewayFilter]);

  // ============ HANDLERS ============
  const handleExport = async () => {
    setExporting(true);
    try {
      await paymentService.exportAllCsv();
      setToast("CSV exported successfully");
    } catch {
      setToast("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async (orderId: string) => {
    setDownloading(orderId);
    try {
      await paymentService.downloadInvoice(orderId);
      setToast("Invoice downloaded successfully");
    } catch {
      setToast("Failed to download invoice");
    } finally {
      setDownloading(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefetching(true);
    await fetchPayments();
    setToast("Refreshed successfully");
  };

  const openFilter = () => {
    setDraftOrderId(orderIdFilter);
    setDraftStatus(statusFilter);
    setDraftGateway(gatewayFilter);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setOrderIdFilter(draftOrderId);
    setStatusFilter(draftStatus);
    setGatewayFilter(draftGateway);
    setPage(1);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftOrderId("");
    setDraftStatus("ALL");
    setDraftGateway("ALL");
    setOrderIdFilter("");
    setStatusFilter("ALL");
    setGatewayFilter("ALL");
    setPage(1);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  // ============ DERIVED ============
  const filtered = useMemo(() => {
    return data.filter((p) => {
      if (
        orderIdFilter &&
        !p.gatewayOrderId.toLowerCase().includes(orderIdFilter.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (gatewayFilter !== "ALL" && p.gateway !== gatewayFilter) return false;
      return true;
    });
  }, [data, orderIdFilter, statusFilter, gatewayFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasFilters =
    orderIdFilter !== "" || statusFilter !== "ALL" || gatewayFilter !== "ALL";

  const successCount = data.filter((p) => p.status === "SUCCESS").length;
  const pendingCount = data.filter((p) => p.status === "PENDING").length;
  const failedCount = data.filter((p) => p.status === "FAILED").length;

  // ============ LOADING ============
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  // ============ ERROR ============
  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
        <p className="text-sm text-navy mb-3">Failed to load payments</p>
        <button
          onClick={handleRefresh}
          className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            Payments
          </h1>
          <p className="text-muted mt-1 text-sm">
            All payment activity across the platform
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
              <div className="absolute right-0 mt-2 w-[520px] max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Order ID
                    </label>
                    <input
                      type="text"
                      value={draftOrderId}
                      onChange={(e) => setDraftOrderId(e.target.value)}
                      placeholder="Search ORD-..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      <option value="SUCCESS">Success</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Gateway
                    </label>
                    <select
                      value={draftGateway}
                      onChange={(e) => setDraftGateway(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="ALL">All</option>
                      <option value="CASHFREE">Cashfree</option>
                      <option value="SABPAISA">SabPaisa</option>
                      <option value="RAZORPAY">Razorpay</option>
                      <option value="STRIPE">Stripe</option>
                    </select>
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

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Successful
            </span>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy">{successCount}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Pending
            </span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-navy">{pendingCount}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Failed
            </span>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy">{failedCount}</div>
        </div>
      </div>

      {/* ============ EMPTY / TABLE ============ */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-navy mb-1">
            {hasFilters ? "No matching transactions" : "No transactions yet"}
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            {hasFilters
              ? "Try clearing filters or broadening your search."
              : "User payments will appear here once they start buying."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Gateway</th>
                    <th className="px-4 py-3">UTR</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-navy whitespace-nowrap">
                        {row.gatewayOrderId}
                      </td>
                      <td className="px-4 py-3 text-navy whitespace-nowrap">
                        {row.productTitle || row.productName || "Payment"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">
                        ₹{row.amount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">
                        {row.gateway}
                      </td>
                      <td className="px-4 py-3 text-muted font-mono text-xs whitespace-nowrap">
                        {row.utr || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap text-xs">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDownload(row.gatewayOrderId)}
                          disabled={downloading === row.gatewayOrderId}
                          title="Download Invoice"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-muted hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 transition"
                        >
                          {downloading === row.gatewayOrderId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============ PAGINATION (Astro style) ============ */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
            <div className="text-xs text-muted">
              Showing{" "}
              <span className="font-semibold text-navy">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>
              {" – "}
              <span className="font-semibold text-navy">
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-navy">
                {filtered.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-navy px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
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

// ============ HELPERS ============
function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "SUCCESS") {
    return (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-green-100 text-green-700">
        Success
      </span>
    );
  }
  if (s === "FAILED") {
    return (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-100 text-red-700">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700">
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}