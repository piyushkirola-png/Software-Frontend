import { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { couponService, CouponResponse } from "../../api/services/couponService";
import { getErrorMessage } from "../../lib/api-client";
import { notify } from "../ui/toast";

interface Props {
  subtotal: number;
  applied: CouponResponse | null;
  onApply: (coupon: CouponResponse | null) => void;
}

export default function CouponBox({ subtotal, applied, onApply }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const coupon = await couponService.validate(code.trim(), subtotal);
      onApply(coupon);
      notify.success(`Coupon "${coupon.code}" applied`);
      setCode("");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-4">
        <Tag size={16} className="text-brand" /> Apply Coupon
      </h3>

      {applied ? (
        <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Check size={18} className="text-success" />
            <div>
              <div className="font-bold text-sm text-success">
                {applied.code}
              </div>
              <div className="text-[11px] text-muted">
                {applied.type === "PERCENT"
                  ? `${applied.value}% off`
                  : `₹${applied.value} off`}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onApply(null);
              notify.success("Coupon removed");
            }}
            className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center text-muted hover:text-red-500 transition-colors"
            aria-label="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 uppercase transition-all"
            onKeyDown={(e) => e.key === "Enter" && apply()}
          />
          <button
            onClick={apply}
            disabled={loading || !code.trim()}
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-5 rounded-xl disabled:opacity-50 transition-colors min-w-[80px]"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
      )}
    </div>
  );
}