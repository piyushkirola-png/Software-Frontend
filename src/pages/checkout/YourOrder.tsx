import { CouponResponse } from "../../api/services/couponService";

interface CartItem {
  id: number;
  quantity: number;
  // support common shapes
  name?: string;
  productName?: string;
  product?: { name?: string; title?: string };
  price?: number;
  unitPrice?: number;
  lineTotal?: number;
}

interface YourOrderProps {
  items: CartItem[];
  subtotal: number;
  coupon: CouponResponse | null;
}

export default function YourOrder({ items, subtotal, coupon }: YourOrderProps) {
  const discount = coupon
    ? coupon.type === "PERCENT"
      ? Math.min(
          (subtotal * coupon.value) / 100,
          coupon.maxDiscount ?? Infinity,
        )
      : coupon.value
    : 0;

  const total = Math.max(0, subtotal - discount);

  // Assume prices are GST-inclusive (common for digital products in India)
  // GST amount = total × 18 / 118
  const gstAmount = (total * 18) / 118;

  const getItemName = (item: CartItem) =>
    item.name ||
    item.productName ||
    item.product?.name ||
    item.product?.title ||
    "Product";

  const getLineTotal = (item: CartItem) => {
    if (typeof item.lineTotal === "number") return item.lineTotal;
    const unit = item.price ?? item.unitPrice ?? 0;
    return unit * item.quantity;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-navy">Your order</h3>
      </div>

      <div className="px-5 py-4">
        {/* Product list */}
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="flex-1 min-w-0">
                <span className="font-medium text-navy">
                  {getItemName(item)}
                </span>
                <span className="text-muted"> × {item.quantity}</span>
              </div>
              <div className="font-semibold text-navy shrink-0">
                ₹{getLineTotal(item).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium text-navy">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          {coupon && discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-success">
                Coupon ({coupon.code})
              </span>
              <span className="font-medium text-success">
                −₹{discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
            <span className="text-navy">Total</span>
            <span className="text-navy">₹{total.toFixed(2)}</span>
          </div>

          <p className="text-[11px] text-muted text-right">
            (includes ₹{gstAmount.toFixed(2)} GST)
          </p>
        </div>
      </div>
    </div>
  );
}