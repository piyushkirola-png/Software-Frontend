import { useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { CouponResponse } from "../../api/services/couponService";
import { couponService } from "../../api/services/couponService";
import { getErrorMessage } from "../../lib/api-client";

interface CollapsibleCouponProps {
  subtotal: number;
  applied: CouponResponse | null;
  onApply: (coupon: CouponResponse | null) => void;
}

export default function CollapsibleCoupon({
  subtotal,
  applied,
  onApply,
}: CollapsibleCouponProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Adjust the method name if your couponService uses a different one
      // (e.g. validate, applyCoupon, check, etc.)
      const result = await couponService.validate(trimmed, subtotal);
      onApply(result);
      setCode("");
      setOpen(false);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onApply(null);
    setCode("");
    setError("");
  };

  // Already applied → show success chip
  if (applied) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Tag size={14} className="text-success" />
            <span className="font-medium text-navy">
              Coupon applied:{" "}
              <span className="text-success font-bold">{applied.code}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-muted hover:text-red-600 transition p-1"
            title="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Toggle link */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full px-5 py-3.5 text-left text-sm text-brand font-medium hover:bg-brand/5 transition flex items-center gap-2"
        >
          <Tag size={14} />
          Have a coupon? Click here to enter your code
        </button>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy">
              Coupon code
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError("");
                setCode("");
              }}
              className="text-[11px] text-muted hover:text-navy"
            >
              Cancel
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition uppercase"
              autoFocus
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !code.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {error && (
            <p className="text-[11px] text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}