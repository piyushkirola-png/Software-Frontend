import { useState, useEffect, useRef } from "react";
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
  Copy,
  Check,
  ExternalLink,
  Eye,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Reveal from "../../../components/animations/Reveal";
import { useAdminPayments } from "../../../api/queries/useAdmin";
import type { Payment } from "../../../types/payment";

const PAGE_SIZE = 20;

export default function AdminPayments() {
  const [page, setPage] = useState(0);

  // Applied filters
  const [status, setStatus] = useState("");
  const [gateway, setGateway] = useState("");
  const [search, setSearch] = useState("");

  // Draft filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftGateway, setDraftGateway] = useState("");
  const [draftSearch, setDraftSearch] = useState("");

  const filterRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useAdminPayments(
    page,
    PAGE_SIZE,
    status || undefined,
    gateway || undefined,
    search || undefined,
  );

  const [viewing, setViewing] = useState<Payment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Outside click / ESC for filter
  useEffect(() => {
    if (!filterOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setDraftStatus(status);
        setDraftGateway(gateway);
        setDraftSearch(search);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setDraftStatus(status);
        setDraftGateway(gateway);
        setDraftSearch(search);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [filterOpen, status, gateway, search]);

  const payments = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const hasFilters = status !== "" || gateway !== "" || search.trim() !== "";

  const rangeStart = payments.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + payments.length;

  const openFilter = () => {
    setDraftStatus(status);
    setDraftGateway(gateway);
    setDraftSearch(search);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setStatus(draftStatus);
    setGateway(draftGateway);
    setSearch(draftSearch);
    setPage(0);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftStatus("");
    setDraftGateway("");
    setDraftSearch("");
    setStatus("");
    setGateway("");
    setSearch("");
    setPage(0);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Payments</h1>
          <p className="text-muted mt-1 text-sm">
            All payment activity across the platform
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
                  {/* Search */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Search (Order / Gateway IDs)
                    </label>
                    <input
                      type="text"
                      value={draftSearch}
                      onChange={(e) => setDraftSearch(e.target.value)}
                      placeholder="SU-2026..., cf_order_..."
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
                      <option value="SUCCESS">Success</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>

                  {/* Gateway */}
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Gateway
                    </label>
                    <select
                      value={draftGateway}
                      onChange={(e) => setDraftGateway(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="">All</option>
                      <option value="CASHFREE">Cashfree</option>
                      <option value="RAZORPAY">Razorpay</option>
                      <option value="PAYU">PayU</option>
                      <option value="SABPAISA">SabPaisa</option>
                    </select>
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
          <p className="text-sm text-navy mb-3">Failed to load payments</p>
          <button
            onClick={handleRefresh}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!isLoading && !isError && payments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching payments" : "No payments yet"}
          </h2>
          <p className="text-sm text-muted">
            {hasFilters
              ? "Try clearing filters."
              : "Payments will appear here when customers check out."}
          </p>
        </div>
      )}

      {/* ============ TABLE ============ */}
      {!isLoading && !isError && payments.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Gateway</th>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-navy whitespace-nowrap">
                        {p.orderNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-navy whitespace-nowrap">
                        {p.gateway}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap max-w-[180px] truncate">
                        {p.gatewayPaymentId || p.gatewayOrderId || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-navy whitespace-nowrap">
                        ₹{p.amount?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {p.paymentLink && (
                            <a
                              href={p.paymentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg hover:bg-brand/10 text-brand flex items-center justify-center"
                              title="Open Payment Link"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => setViewing(p)}
                            className="w-8 h-8 rounded-lg hover:bg-brand/10 text-brand flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye size={14} />
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

      {/* ============ PAGINATION ============ */}
      {!isLoading && !isError && payments.length > 0 && (
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

      {/* ============ DETAIL MODAL ============ */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} maxWidth="max-w-2xl">
        {viewing && <PaymentDetail payment={viewing} onCopy={setToast} />}
      </Modal>

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

// ============ SUB COMPONENTS ============
function PaymentStatusBadge({ status }: { status: string }) {
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

function PaymentDetail({
  payment,
  onCopy,
}: {
  payment: Payment;
  onCopy: (msg: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    onCopy("Copied to clipboard");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-navy">
          Payment #{payment.id}
        </h3>
        <p className="text-xs text-muted mt-0.5">
          {new Date(payment.createdAt).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-gray-100 py-4">
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
            Amount
          </div>
          <div className="font-bold text-navy text-lg">
            ₹{payment.amount?.toFixed(2)} {payment.currency}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
            Status
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>
      </div>

      {/* Order */}
      <DetailRow
        label="Order Number"
        value={payment.orderNumber}
        onCopy={() => copy(payment.orderNumber, "order")}
        copied={copied === "order"}
      />

      {/* Gateway */}
      <DetailRow label="Gateway" value={payment.gateway} />

      {payment.gatewayOrderId && (
        <DetailRow
          label="Gateway Order ID"
          value={payment.gatewayOrderId}
          mono
          onCopy={() => copy(payment.gatewayOrderId!, "gwo")}
          copied={copied === "gwo"}
        />
      )}

      {payment.gatewayPaymentId && (
        <DetailRow
          label="Gateway Payment ID"
          value={payment.gatewayPaymentId}
          mono
          onCopy={() => copy(payment.gatewayPaymentId!, "gwp")}
          copied={copied === "gwp"}
        />
      )}

      {/* Payment link */}
      {payment.paymentLink && (
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
            Payment Link
          </div>
          <a
            href={payment.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline break-all"
          >
            {payment.paymentLink}
            <ExternalLink size={11} className="shrink-0" />
          </a>
        </div>
      )}

      {/* Failure reason */}
      {payment.failureReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">
            Failure Reason
          </div>
          <div className="text-xs text-red-600">{payment.failureReason}</div>
        </div>
      )}

      {/* Raw response */}
      {payment.rawResponse && (
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
            Raw Gateway Response
          </div>
          <pre className="bg-navy text-white text-[10px] font-mono rounded-lg p-3 max-h-60 overflow-auto whitespace-pre-wrap break-all">
            {prettyJson(payment.rawResponse)}
          </pre>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  onCopy,
  copied = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs text-navy ${mono ? "font-mono" : ""} break-all`}>
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:bg-brand/10 px-2 py-1 rounded-lg transition"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}