import { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { couponService, CouponResponse } from "../../api/services/couponService";
import { getErrorMessage } from "../../lib/api-client";

interface Props {
  subtotal: number;
  applied: CouponResponse | null;
  onApply: (coupon: CouponResponse | null) => void;
}

export default function CouponBox({ subtotal, applied, onApply }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    setError("");
    if (!code.trim()) return;
    setLoading(true);
    try {
      const coupon = await couponService.validate(code.trim(), subtotal);
      onApply(coupon);
      setCode("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-3">
        <Tag size={16} /> Apply Coupon
      </h3>

      {applied ? (
        <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-success" />
            <div>
              <div className="font-bold text-sm text-success">{applied.code}</div>
              <div className="text-[11px] text-muted">
                {applied.type === "PERCENT"
                  ? `${applied.value}% off`
                  : `₹${applied.value} off`}
              </div>
            </div>
          </div>
          <button
            onClick={() => onApply(null)}
            className="text-muted hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand uppercase"
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
            <button
              onClick={apply}
              disabled={loading || !code.trim()}
              className="bg-brand hover:bg-brand-dark text-white text-xs font-bold px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}