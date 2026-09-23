import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Lock,
  Minus,
  Plus,
  Trash2,
  Loader2,
  Tag,
  Check,
  X,
} from "lucide-react";
import { useCart } from "../../api/queries/useCart";
import {
  useUpdateCartQuantity,
  useRemoveCartItem,
} from "../../api/mutations/cartMutations";
import Button from "../../components/ui/Button";
import Reveal from "../../components/animations/Reveal";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import { useAuthContext } from "../../lib/AuthContext";
import {
  couponService,
  CouponResponse,
} from "../../api/services/couponService";
import { notify } from "../../components/ui/toast";
import { getErrorMessage } from "../../lib/api-client";
import { resolveImageUrl } from "../../lib/upload";

export default function Cart() {
  const { isAuthenticated } = useAuthContext();
  const { data: cart, isLoading } = useCart();
  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveCartItem();

  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <CheckoutSteps current={1} />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-soft">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-5">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2 text-center">
            Please login to view your cart
          </h1>
          <p className="text-muted text-sm mb-6 text-center max-w-md">
            Login or create an account to continue shopping.
          </p>
          <div className="flex gap-3">
            <Link to="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <CheckoutSteps current={1} />
        <div className="bg-soft min-h-[60vh] py-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <CheckoutSteps current={1} />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-soft">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-5">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2 text-center">
            Your cart is empty
          </h1>
          <p className="text-muted text-sm mb-6 text-center max-w-md">
            Add products to your cart to see them here.
          </p>
          <Link to="/products">
            <Button size="lg">
              Browse Products <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </>
    );
  }

  /* ============ TOTALS ============ */
  const discount = coupon
    ? coupon.type === "PERCENT"
      ? Math.min(
          (cart.subtotal * coupon.value) / 100,
          coupon.maxDiscount ?? Infinity,
        )
      : coupon.value
    : 0;

  const total = Math.max(0, cart.subtotal - discount);

  const gstIncluded = total - total / 1.18;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await couponService.validate(
        couponCode.trim(),
        cart.subtotal,
      );
      setCoupon(result);
      notify.success(`Coupon "${result.code}" applied`);
      setCouponCode("");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      <CheckoutSteps current={1} />

      <div className="bg-soft min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal>
            <div className="mb-5">
              <h1 className="text-2xl md:text-3xl font-bold text-navy">
                Shopping Cart
              </h1>
              <p className="text-sm text-muted mt-1">
                {cart.totalItems} item{cart.totalItems !== 1 ? "s" : ""} in your
                cart
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* ============ LEFT COLUMN: items + coupon ============ */}
            <div className="space-y-4">
              {/* Items box — stronger shadow + border */}
              <Reveal>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 md:p-6">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-gray-100 last:border-0"
                    >
                      <Link
                        to={`/product/${item.productSlug}`}
                        className="w-20 h-20 bg-soft rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100"
                      >
                        <img
                          src={resolveImageUrl(item.thumbnailUrl)}
                          alt={item.productTitle}
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="font-semibold text-navy text-sm leading-snug hover:text-brand line-clamp-2 transition-colors"
                        >
                          {item.productTitle}
                        </Link>
                        {item.variantName && (
                          <div className="text-xs text-muted mt-1">
                            {item.variantName}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        {/* Qty stepper */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() =>
                              updateQty.mutate({
                                cartItemId: item.id,
                                quantity: item.quantity - 1,
                              })
                            }
                            disabled={item.quantity <= 1 || updateQty.isPending}
                            className="w-9 h-9 flex items-center justify-center hover:bg-soft disabled:opacity-40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-navy">
                            {updateQty.isPending ? (
                              <Loader2
                                size={14}
                                className="animate-spin mx-auto"
                              />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              updateQty.mutate({
                                cartItemId: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            disabled={updateQty.isPending}
                            className="w-9 h-9 flex items-center justify-center hover:bg-soft disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Line total */}
                        <div className="w-24 text-right font-bold text-navy text-sm">
                          ₹{item.lineTotal.toFixed(2)}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem.mutate(item.id)}
                          disabled={removeItem.isPending}
                          className="w-9 h-9 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                          aria-label="Remove item"
                        >
                          {removeItem.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* ============ COUPON BOX (moved here — under items) ============ */}
              <Reveal delay={0.05}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 md:p-6">
                  <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-4">
                    <Tag size={16} className="text-brand" /> Apply Coupon
                  </h3>

                  {coupon ? (
                    <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Check size={18} className="text-success" />
                        <div>
                          <div className="font-bold text-sm text-success">
                            {coupon.code}
                          </div>
                          <div className="text-[11px] text-muted">
                            {coupon.type === "PERCENT"
                              ? `${coupon.value}% off`
                              : `₹${coupon.value} off`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCoupon(null);
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
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 uppercase transition-all"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-5 rounded-xl disabled:opacity-50 transition-colors min-w-[80px]"
                      >
                        {couponLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>

            {/* ============ RIGHT COLUMN: Order Summary ============ */}
            <Reveal delay={0.1}>
              <aside className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={16} className="text-brand" />
                    <h3 className="font-bold text-navy">Order Summary</h3>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-semibold text-navy">
                        ₹{cart.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span className="flex items-center gap-1">
                          <Check size={12} /> Discount ({coupon?.code})
                        </span>
                        <span className="font-semibold">
                          −₹{discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted">GST</span>
                      <span className="font-bold text-brand">
                        Included (₹{gstIncluded.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                    <span className="font-bold text-navy">Total</span>
                    <span className="text-xl font-extrabold text-navy">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-5">
                    <Link to="/checkout">
                      <Button fullWidth size="lg">
                        Proceed to Checkout <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Lock size={14} className="text-success" />
                      100% Secure Payment
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Check size={14} className="text-success" />
                      Instant License Delivery
                    </div>
                  </div>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
