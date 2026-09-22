import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Shield, Zap } from "lucide-react";
import Button from "../../components/ui/Button";
import Reveal from "../../components/animations/Reveal";
import { useAuthContext } from "../../lib/AuthContext";
import { useCart } from "../../api/queries/useCart";
import {
  useCheckout,
  useInitiatePayment,
} from "../../api/mutations/orderMutations";
import { addressService } from "../../api/services/addressService";
import { CouponResponse } from "../../api/services/couponService";
import { getErrorMessage } from "../../lib/api-client";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import BillingForm, {
  BillingFormHandle,
} from "./BillingForm";
import AdditionalInfo from "./AdditionalInfo";
import YourOrder from "./YourOrder";
import PaymentMethodBox from "./PaymentMethodBox";
import CollapsibleCoupon from "./CollapsibleCoupon";

export default function Checkout() {
  const nav = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { data: cart, isLoading: cartLoading } = useCart();
  const checkout = useCheckout();
  const initiatePayment = useInitiatePayment();

  const billingRef = useRef<BillingFormHandle>(null);

  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedGateway, setSelectedGateway] = useState("razorpay");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: "/checkout" } });
    }
  }, [isAuthenticated, nav]);

  const handlePlaceOrder = async () => {
    setError("");
    const form = billingRef.current;
    if (!form) return;

    const addressData = form.getAddressRequest();
    if (!addressData) {
      setError("Please fill in all required billing details");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!selectedGateway) {
      setError("Please select a payment method");
      return;
    }

    const extra = form.getExtra(); // { gstNumber, email }

    setIsSubmitting(true);
    try {
      // 1. Create address (now includes gstNumber)
      const created = await addressService.create({
        ...addressData,
        gstNumber: extra.gstNumber || undefined,
      });

      // 2. Create order (now includes gstNumber + notes)
      const order = await checkout.mutateAsync({
        addressId: created.id,
        couponCode: coupon?.code,
        gateway: selectedGateway,
        gstNumber: extra.gstNumber || undefined,
        notes: notes || undefined,
      });

      // 3. Initiate payment
      const payment = await initiatePayment.mutateAsync({
        orderId: order.id,
        gateway: selectedGateway,
      });

      // 4. Redirect to gateway's hosted checkout page
      const paymentLink =
        (payment.gatewayData?.paymentLink as string | undefined) ||
        (payment as unknown as { paymentLink?: string }).paymentLink;

      if (!paymentLink || typeof paymentLink !== "string") {
        throw new Error(
          "Payment gateway did not return a redirect link. Please try again."
        );
      }

      window.location.href = paymentLink;
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-soft">
        <h2 className="text-2xl font-bold text-navy mb-2">Your cart is empty</h2>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const totalPayable = Math.max(
    0,
    cart.subtotal -
    (coupon
      ? coupon.type === "PERCENT"
        ? Math.min(
          (cart.subtotal * coupon.value) / 100,
          coupon.maxDiscount ?? Infinity,
        )
        : coupon.value
      : 0),
  );

  return (
    <>
      <CheckoutSteps current={2} />
      <div className="bg-soft min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal>
            <h1 className="text-2xl md:text-3xl font-bold text-navy mb-6">
              Checkout
            </h1>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* ───────── Left column ───────── */}
            <div className="space-y-5">
              <Reveal>
                <BillingForm ref={billingRef} />
              </Reveal>

              <Reveal delay={0.05}>
                <AdditionalInfo notes={notes} onChange={setNotes} />
              </Reveal>

              <Reveal delay={0.1}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Shield size={16} className="text-success" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">
                        100% Secure
                      </div>
                      <div className="text-[10px] text-muted">
                        Encrypted checkout
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand/10">
                      <Zap size={16} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">
                        Instant Delivery
                      </div>
                      <div className="text-[10px] text-muted">
                        License key via email
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ───────── Right column ───────── */}
            <Reveal delay={0.15}>
              <aside className="lg:sticky lg:top-24 h-fit space-y-4">
                <YourOrder
                  items={cart.items}
                  subtotal={cart.subtotal}
                  coupon={coupon}
                />

                {/* Collapsible Coupon (WooCommerce style) */}
                <CollapsibleCoupon
                  subtotal={cart.subtotal}
                  applied={coupon}
                  onApply={setCoupon}
                />

                <PaymentMethodBox
                  selected={selectedGateway}
                  onSelect={setSelectedGateway}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  fullWidth
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Place order ₹${totalPayable.toFixed(2)}`
                  )}
                </Button>

                <p className="text-[11px] text-muted leading-relaxed text-center">
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other purposes
                  described in our privacy policy.
                </p>
              </aside>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}