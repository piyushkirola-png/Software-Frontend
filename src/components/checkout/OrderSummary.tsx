import { Receipt, CheckCircle } from "lucide-react";
import { CouponResponse } from "../../api/services/couponService";

interface Props {
  subtotal: number;
  coupon: CouponResponse | null;
}

export default function OrderSummary({ subtotal, coupon }: Props) {
  const discount = coupon
    ? coupon.type === "PERCENT"
      ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Infinity)
      : coupon.value
    : 0;

  const afterDiscount = Math.max(0, subtotal - discount);
  const total = afterDiscount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Receipt size={16} className="text-brand" />
        <h3 className="font-bold text-navy">Order Summary</h3>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-navy">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span className="flex items-center gap-1">
              <CheckCircle size={12} /> Discount ({coupon?.code})
            </span>
            <span className="font-semibold">−₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted">GST</span>
          <span className="text-xs text-muted">Included</span>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
        <span className="font-bold text-navy">Total</span>
        <span className="text-xl font-extrabold text-navy">
          ₹{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}