import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Copy,
  CheckCircle,
  FileText,
  Key,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { useOrder } from "../../../api/queries/useOrders";
import { resolveImageUrl } from "../../../lib/upload";

const API_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:8081";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { showToast } = useAuthContext();
  const { data: order, isLoading, isError } = useOrder(orderId);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("License key copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
        <p className="text-sm text-navy mb-3">Order not found</p>
        <Link
          to="/user/orders"
          className="text-brand text-xs font-semibold hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        to="/user/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand transition"
      >
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      {/* ============ HEADER CARD ============ */}
      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-navy font-mono">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-muted mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
            <InfoCell
              label="Subtotal"
              value={`₹${order.subtotal.toFixed(2)}`}
            />
            {order.discount > 0 && (
              <InfoCell
                label="Discount"
                value={`−₹${order.discount.toFixed(2)}`}
                color="text-success"
              />
            )}
            <InfoCell label="GST" value={`₹${order.tax.toFixed(2)}`} />
            <InfoCell
              label="Total"
              value={`₹${order.total.toFixed(2)}`}
              bold
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
            {order.invoicePdfUrl && (
              <a
                href={`${API_URL}${order.invoicePdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                <FileText size={14} /> Download Invoice
              </a>
            )}
            {order.status === "SUCCESS" && (
              <span className="inline-flex items-center gap-2 bg-success/10 text-success text-xs font-bold px-4 py-2.5 rounded-xl">
                <CheckCircle size={14} /> Delivered to {order.customerEmail}
              </span>
            )}
          </div>
        </div>
      </Reveal>

      {/* ============ ITEMS ============ */}
      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <h2 className="text-sm font-bold text-navy mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-brand/20 transition"
              >
                <div className="w-16 h-16 bg-soft rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={resolveImageUrl(item.thumbnailUrl)}
                    alt={item.productTitle}
                    className="max-h-full max-w-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="font-semibold text-navy text-sm hover:text-brand line-clamp-2"
                  >
                    {item.productTitle}
                  </Link>
                  {item.variantName && (
                    <div className="text-xs text-muted mt-1">
                      {item.variantName}
                    </div>
                  )}
                  <div className="text-xs text-muted mt-1">
                    Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-navy">
                    ₹{item.lineTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============ LICENSE KEYS ============ */}
      {order.status === "SUCCESS" &&
        order.items.some((i) => i.licenseKey) && (
          <Reveal>
            <div className="bg-navy rounded-2xl p-5 lg:p-6 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Key size={16} /> Your License Keys
              </h2>
              <div className="space-y-3">
                {order.items
                  .filter((i) => i.licenseKey)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      <div className="text-xs text-gray-400 mb-2">
                        {item.productTitle}
                        {item.variantName ? ` • ${item.variantName}` : ""}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <code className="font-mono text-sm text-white break-all">
                          {item.licenseKey}
                        </code>
                        <button
                          onClick={() => copy(item.licenseKey!, item.id)}
                          className="shrink-0 inline-flex items-center gap-1 text-xs bg-brand hover:bg-brand-dark px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle size={12} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Reveal>
        )}
    </div>
  );
}

// ============ SUB COMPONENTS ============
function InfoCell({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted uppercase tracking-wider font-semibold">
        {label}
      </div>
      <div
        className={`mt-1 ${bold ? "font-extrabold text-navy text-base" : "font-semibold text-navy"} ${color || ""}`}
      >
        {value}
      </div>
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
      className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${cls}`}
    >
      {status}
    </span>
  );
}