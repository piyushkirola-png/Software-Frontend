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
  CreditCard,
  Copy,
  Check,
  Eye,
  Download,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Reveal from "../../../components/animations/Reveal";
import { useAdminPayments } from "../../../api/queries/useAdmin";
import { adminService } from "../../../api/services/adminService";
import type { Payment } from "../../../types/payment";
import { getErrorMessage } from "../../../lib/api-client";

const PAGE_SIZE = 10;

export default function AdminPayments() {
  const [page, setPage] = useState(0);

  // applied filters
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterPaymentId, setFilterPaymentId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGateway, setFilterGateway] = useState("");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");

  // draft filters
  const [draftOrderId, setDraftOrderId] = useState("");
  const [draftPaymentId, setDraftPaymentId] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftGateway, setDraftGateway] = useState("");
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useAdminPayments(
    page,
    PAGE_SIZE,
    filterStatus || undefined,
    filterGateway || undefined,
    filterOrderId || undefined,
    filterPaymentId || undefined,
    filterMin ? Number(filterMin) : undefined,
    filterMax ? Number(filterMax) : undefined,
  );

  const [viewing, setViewing] = useState<Payment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

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
    filterOrderId,
    filterPaymentId,
    filterStatus,
    filterGateway,
    filterMin,
    filterMax,
  ]);

  const payments = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const hasFilters =
    filterOrderId !== "" ||
    filterPaymentId !== "" ||
    filterStatus !== "" ||
    filterGateway !== "" ||
    filterMin !== "" ||
    filterMax !== "";

  const rangeStart = payments.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + payments.length;

  const openFilter = () => {
    setDraftOrderId(filterOrderId);
    setDraftPaymentId(filterPaymentId);
    setDraftStatus(filterStatus);
    setDraftGateway(filterGateway);
    setDraftMin(filterMin);
    setDraftMax(filterMax);
    setFilterOpen(true);
  };

  const closeFilterAndResetDrafts = () => {
    setFilterOpen(false);
    setDraftOrderId(filterOrderId);
    setDraftPaymentId(filterPaymentId);
    setDraftStatus(filterStatus);
    setDraftGateway(filterGateway);
    setDraftMin(filterMin);
    setDraftMax(filterMax);
  };

  const applyFilter = () => {
    setFilterOrderId(draftOrderId);
    setFilterPaymentId(draftPaymentId);
    setFilterStatus(draftStatus);
    setFilterGateway(draftGateway);
    setFilterMin(draftMin);
    setFilterMax(draftMax);
    setPage(0);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftOrderId("");
    setDraftPaymentId("");
    setDraftStatus("");
    setDraftGateway("");
    setDraftMin("");
    setDraftMax("");
    setFilterOrderId("");
    setFilterPaymentId("");
    setFilterStatus("");
    setFilterGateway("");
    setFilterMin("");
    setFilterMax("");
    setPage(0);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await adminService.exportPaymentsCsv(
        filterStatus || undefined,
        filterGateway || undefined,
        filterOrderId || undefined,
        filterPaymentId || undefined,
        filterMin ? Number(filterMin) : undefined,
        filterMax ? Number(filterMax) : undefined,
      );
      setToast("CSV downloaded");
    } catch (e) {
      setToast(getErrorMessage(e) || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
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

                {/* Row 1: Order ID + Payment ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Order ID
                    </label>
                    <input
                      type="text"
                      value={draftOrderId}
                      onChange={(e) => setDraftOrderId(e.target.value)}
                      placeholder="SU-2026..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={draftPaymentId}
                      onChange={(e) => setDraftPaymentId(e.target.value)}
                      placeholder="145723XXXXX"
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Row 2: Status + Gateway */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
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
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
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
                      <option value="CASHFREE">CASHFREE</option>
                      <option value="RAZORPAY">RAZORPAY</option>
                      <option value="PAYU">PAYU</option>
                      <option value="SABPAISA">SABPAISA</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Min + Max */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Min (₹)
                    </label>
                    <input
                      type="number"
                      value={draftMin}
                      onChange={(e) => setDraftMin(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Max (₹)
                    </label>
                    <input
                      type="number"
                      value={draftMax}
                      onChange={(e) => setDraftMax(e.target.value)}
                      placeholder="100000"
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Row 4: Clear + Apply */}
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
          <p className="text-sm text-navy mb-3">Failed to load payments</p>
          <button
            onClick={handleRefresh}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
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

      {/* TABLE */}
      {!isLoading && !isError && payments.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Order ID</th>
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

      {/* PAGINATION */}
      {!isLoading && !isError && payments.length > 0 && (
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

      {/* DETAIL MODAL */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        maxWidth="max-w-5xl"
      >
        {viewing && <PaymentDetail payment={viewing} onCopy={setToast} />}
      </Modal>

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
        document.body,
      )}
    </div>
  );
}

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
        <h3 className="text-lg font-bold text-navy">Payment {payment.id}</h3>
        <p className="text-xs text-muted mt-0.5">
          {new Date(payment.createdAt).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-gray-100 pt-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-4">
            <div>
              <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
                Amount
              </div>
              <div className="font-bold text-navy text-lg">
                ₹{payment.amount?.toFixed(2)} {payment.currency}
              </div>
            </div>
            <div className="text-right pr-6">
              <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
                Status
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </div>

          <DetailRow
            label="Order Number"
            value={payment.orderNumber}
            onCopy={() => copy(payment.orderNumber, "order")}
            copied={copied === "order"}
          />

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
              </a>
            </div>
          )}

          {payment.failureReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">
                Failure Reason
              </div>
              <div className="text-xs text-red-600">
                {payment.failureReason}
              </div>
            </div>
          )}
        </div>

        {payment.rawResponse && (
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
              Raw Gateway Response
            </div>
            <pre className="bg-navy text-white text-[10px] font-mono rounded-lg p-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-all">
              {prettyJson(payment.rawResponse)}
            </pre>
          </div>
        )}
      </div>
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
        <span
          className={`text-xs text-navy ${mono ? "font-mono" : ""} break-all`}
        >
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