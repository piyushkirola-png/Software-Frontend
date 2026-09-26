import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  FileText,
  AlertCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useOrder } from "../../../api/queries/useOrders";
import { useCreateReview } from "../../../api/mutations/reviewMutations";
import { resolveImageUrl } from "../../../lib/upload";
import { getErrorMessage } from "../../../lib/api-client";
import { notify } from "../../../components/ui/toast";

const API_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:8081";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { data: order, isLoading, isError } = useOrder(orderId);
  const [reviewProduct, setReviewProduct] = useState<{
    id: number;
    title: string;
  } | null>(null);

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
      <Link
        to="/user/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand transition"
      >
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      {/* HEADER CARD */}
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
            <InfoCell label="Total" value={`₹${order.total.toFixed(2)}`} bold />
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

      {/* ITEMS */}
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
                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  <div className="font-bold text-navy">
                    ₹{item.lineTotal.toFixed(2)}
                  </div>
                  {order.status === "SUCCESS" && (
                    <button
                      onClick={() =>
                        setReviewProduct({
                          id: item.productId,
                          title: item.productTitle,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand border border-brand/40 hover:bg-brand hover:text-white px-3 py-1.5 rounded-lg transition"
                    >
                      <MessageSquare size={12} />
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Review Modal */}
      <WriteReviewModal
        product={reviewProduct}
        onClose={() => setReviewProduct(null)}
      />
    </div>
  );
}

// WRITE REVIEW MODAL
function WriteReviewModal({
  product,
  onClose,
}: {
  product: { id: number; title: string } | null;
  onClose: () => void;
}) {
  const create = useCreateReview();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!product) return;
    setError("");
    if (!rating) return setError("Please select a rating");
    if (!title.trim()) return setError("Title is required");

    try {
      await create.mutateAsync({
        productId: product.id,
        rating,
        title: title.trim(),
        comment: comment.trim() || undefined,
      });
      notify.success("Review submitted successfully");
      setRating(5);
      setTitle("");
      setComment("");
      onClose();
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      notify.error(msg);
    }
  };

  const handleClose = () => {
    setRating(5);
    setTitle("");
    setComment("");
    setError("");
    onClose();
  };

  return (
    <Modal open={!!product} onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-navy">Write a Review</h3>
          <p className="text-xs text-muted mt-0.5 line-clamp-1">
            {product?.title}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  fill={n <= rating ? "#10B981" : "transparent"}
                  stroke={n <= rating ? "#10B981" : "#CBD5E1"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Great product!"
            maxLength={200}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={create.isPending}
            className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <Button onClick={submit} loading={create.isPending} fullWidth>
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
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