import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PackageX,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Filter,
  X,
  RefreshCw,
  Download,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyOrdersFiltered } from "../../../api/queries/useOrders";
import { orderService } from "../../../api/services/orderService";
import { notify } from "../../../components/ui/toast";
import { getErrorMessage } from "../../../lib/api-client";

const PAGE_SIZE = 10;

export default function UserOrders() {
  const [page, setPage] = useState(0);

  // applied filters
  const [filterOrderNumber, setFilterOrderNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterMinTotal, setFilterMinTotal] = useState<string>("");
  const [filterMaxTotal, setFilterMaxTotal] = useState<string>("");

  // draft filters
  const [draftOrderNumber, setDraftOrderNumber] = useState("");
  const [draftStatus, setDraftStatus] = useState<string>("ALL");
  const [draftMinTotal, setDraftMinTotal] = useState<string>("");
  const [draftMaxTotal, setDraftMaxTotal] = useState<string>("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } =
    useMyOrdersFiltered(
      page,
      PAGE_SIZE,
      filterOrderNumber || undefined,
      filterStatus === "ALL" ? undefined : filterStatus,
      filterMinTotal ? Number(filterMinTotal) : undefined,
      filterMaxTotal ? Number(filterMaxTotal) : undefined,
    );

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const hasFilters =
    filterOrderNumber !== "" ||
    filterStatus !== "ALL" ||
    filterMinTotal !== "" ||
    filterMaxTotal !== "";

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
  }, [filterOpen, filterOrderNumber, filterStatus, filterMinTotal, filterMaxTotal]);

  const openFilter = () => {
    setDraftOrderNumber(filterOrderNumber);
    setDraftStatus(filterStatus);
    setDraftMinTotal(filterMinTotal);
    setDraftMaxTotal(filterMaxTotal);
    setFilterOpen(true);
  };

  const closeFilterAndResetDrafts = () => {
    setFilterOpen(false);
    setDraftOrderNumber(filterOrderNumber);
    setDraftStatus(filterStatus);
    setDraftMinTotal(filterMinTotal);
    setDraftMaxTotal(filterMaxTotal);
  };

  const applyFilter = () => {
    setFilterOrderNumber(draftOrderNumber);
    setFilterStatus(draftStatus);
    setFilterMinTotal(draftMinTotal);
    setFilterMaxTotal(draftMaxTotal);
    setPage(0);
    setFilterOpen(false);
    notify.success("Filter applied");
  };

  const clearFilter = () => {
    setDraftOrderNumber("");
    setDraftStatus("ALL");
    setDraftMinTotal("");
    setDraftMaxTotal("");
    setFilterOrderNumber("");
    setFilterStatus("ALL");
    setFilterMinTotal("");
    setFilterMaxTotal("");
    setPage(0);
    setFilterOpen(false);
    notify.success("Filter cleared");
  };

  const handleRefresh = async () => {
    await refetch();
    notify.success("Refreshed");
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await orderService.exportMyOrdersCsv(
        filterOrderNumber || undefined,
        filterStatus === "ALL" ? undefined : filterStatus,
        filterMinTotal ? Number(filterMinTotal) : undefined,
        filterMaxTotal ? Number(filterMaxTotal) : undefined,
      );
      notify.success("CSV downloaded");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  const rangeStart = orders.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + orders.length;

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            My Orders
          </h1>
          <p className="text-muted mt-1 text-sm">
            View and manage your orders
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
              <div className="absolute right-0 mt-2 w-[480px] max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4">
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

                {/* Order Number */}
                <div className="mb-3">
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={draftOrderNumber}
                    onChange={(e) => setDraftOrderNumber(e.target.value)}
                    placeholder="e.g. SU-20260101-1234"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Status */}
                <div className="mb-3">
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                  >
                    <option value="ALL">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                {/* Amount range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Amount Min (₹)
                    </label>
                    <input
                      type="number"
                      value={draftMinTotal}
                      onChange={(e) => setDraftMinTotal(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Amount Max (₹)
                    </label>
                    <input
                      type="number"
                      value={draftMaxTotal}
                      onChange={(e) => setDraftMaxTotal(e.target.value)}
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
            disabled={exporting || totalElements === 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm font-semibold text-navy hover:bg-gray-50 disabled:opacity-60 transition"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
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

      {/* ============ LOADING ============ */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ============ ERROR ============ */}
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

      {/* ============ EMPTY ============ */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <PackageX className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching orders" : "No orders yet"}
          </h2>
          <p className="text-sm text-muted mb-4">
            {hasFilters
              ? "Try clearing filters."
              : "Your purchases will appear here."}
          </p>
          {!hasFilters && (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
            >
              Browse Products <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}

      {/* ============ TABLE ============ */}
      {!isLoading && !isError && orders.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-xs text-navy whitespace-nowrap">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 font-bold text-navy whitespace-nowrap">
                        ₹{o.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to={`/user/orders/${o.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition"
                          title="View Order"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "SUCCESS"
      ? "bg-success/10 text-success"
      : status === "FAILED"
        ? "bg-red-100 text-red-600"
        : "bg-yellow-100 text-yellow-700";
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${cls}`}
    >
      {status}
    </span>
  );
}