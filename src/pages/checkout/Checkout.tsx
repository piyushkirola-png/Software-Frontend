import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Plus, MapPin, Shield, Zap } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import AddressForm from "../../components/checkout/AddressForm";
import CouponBox from "../../components/checkout/CouponBox";
import OrderSummary from "../../components/checkout/OrderSummary";
import GatewayPickerModal from "../../components/payment/GatewayPickerModal";
import Reveal from "../../components/animations/Reveal";
import { useAuthContext } from "../../lib/AuthContext";
import { useCart } from "../../api/queries/useCart";
import {
  useCheckout,
  useInitiatePayment,
} from "../../api/mutations/orderMutations";
import { addressService } from "../../api/services/addressService";
import { CouponResponse } from "../../api/services/couponService";
import { Address, AddressRequest } from "../../types/address";
import { getErrorMessage } from "../../lib/api-client";

export default function Checkout() {
  const nav = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { data: cart, isLoading: cartLoading } = useCart();
  const checkout = useCheckout();
  const initiatePayment = useInitiatePayment();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: "/checkout" } });
    }
  }, [isAuthenticated, nav]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const list = await addressService.getAll();
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      } catch (e) {
        console.error(e);
      } finally {
        setAddrLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const createAddress = async (data: AddressRequest) => {
    try {
      const created = await addressService.create(data);
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handlePlaceOrder = async (gateway: string) => {
    setError("");
    if (!selectedAddressId) return setError("Please select an address");

    try {
      const order = await checkout.mutateAsync({
        addressId: selectedAddressId,
        couponCode: coupon?.code,
        gateway,
      });

      const payment = await initiatePayment.mutateAsync({
        orderId: order.id,
        gateway,
      });

      setGatewayOpen(false);

      await fetch(
        `http://localhost:8081/api/payments/${payment.paymentId}/simulate-success`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("su_token")}`,
          },
        },
      );

      nav(`/checkout/success/${order.orderNumber}`);
    } catch (e) {
      setError(getErrorMessage(e));
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
        <h2 className="text-2xl font-bold text-navy mb-2">
          Your cart is empty
        </h2>
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
    <div className="bg-soft min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-6">
            Checkout
          </h1>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left column */}
          <div className="space-y-5">
            {/* Address */}
            <Reveal>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                    <MapPin size={16} className="text-brand" />
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-[11px] text-brand font-semibold flex items-center gap-1 hover:underline uppercase tracking-wider"
                  >
                    <Plus size={12} /> Add New
                  </button>
                </div>

                {addrLoading && (
                  <p className="text-sm text-muted">Loading...</p>
                )}

                {!addrLoading && addresses.length === 0 && (
                  <p className="text-sm text-muted">
                    No addresses yet. Click "Add New" to add one.
                  </p>
                )}

                {!addrLoading && addresses.length > 0 && (
                  <div className="space-y-2">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`block border-2 rounded-xl p-4 cursor-pointer transition ${
                          selectedAddressId === a.id
                            ? "border-brand bg-brand/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                              selectedAddressId === a.id
                                ? "border-brand"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAddressId === a.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-navy text-sm flex items-center gap-2 flex-wrap">
                              {a.fullName}
                              {a.isDefault && (
                                <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted mt-1">
                              {a.phone}
                            </div>
                            <div className="text-xs text-muted mt-0.5">
                              {a.addressLine1}
                              {a.addressLine2 ? `, ${a.addressLine2}` : ""},{" "}
                              {a.city}, {a.state} - {a.pincode}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>

            {/* Coupon */}
            <Reveal delay={0.05}>
              <CouponBox
                subtotal={cart.subtotal}
                applied={coupon}
                onApply={setCoupon}
              />
            </Reveal>

            {/* Trust */}
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

          {/* Right column — sticky */}
          <Reveal delay={0.15}>
            <aside className="lg:sticky lg:top-24 h-fit space-y-4">
              <OrderSummary subtotal={cart.subtotal} coupon={coupon} />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                disabled={!selectedAddressId}
                onClick={() => setGatewayOpen(true)}
              >
                Proceed to Pay ₹{totalPayable.toFixed(2)}
              </Button>

              <p className="text-[11px] text-muted text-center">
                🔒 Your payment is secure and encrypted
              </p>
            </aside>
          </Reveal>
        </div>
      </div>

      {/* Add address modal */}
      <Modal
        open={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        title="Add New Address"
        maxWidth="max-w-lg"
      >
        <AddressForm
          onSubmit={createAddress}
          onCancel={() => setShowAddressForm(false)}
        />
      </Modal>

      {/* Gateway picker */}
      <GatewayPickerModal
        open={gatewayOpen}
        onClose={() => setGatewayOpen(false)}
        onSelect={handlePlaceOrder}
        loading={checkout.isPending || initiatePayment.isPending}
        amount={totalPayable}
      />
    </div>
  );
}