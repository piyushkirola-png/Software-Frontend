import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Tag, CheckCircle } from "lucide-react";
import { Cart } from "../../types/cart";
import Button from "../ui/Button";

interface Props {
  cart: Cart;
  showCheckoutButton?: boolean;
  onClose?: () => void;
}

export default function CartSummary({
  cart,
  showCheckoutButton = true,
  onClose,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={16} className="text-brand" />
        <h3 className="font-bold text-navy">Order Summary</h3>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Items</span>
          <span className="font-semibold text-navy">{cart.totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-navy">
            ₹{cart.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">GST (18%)</span>
          <span className="text-xs text-muted">Included</span>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
        <span className="font-bold text-navy">Total</span>
        <span className="text-xl font-extrabold text-navy">
          ₹{cart.subtotal.toFixed(2)}
        </span>
      </div>

      {showCheckoutButton && (
        <div className="mt-5">
          <Link to="/checkout" onClick={onClose}>
            <Button fullWidth size="lg">
              Proceed to Checkout <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={14} className="text-success" />
          100% Secure Payment
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <CheckCircle size={14} className="text-success" />
          Instant License Delivery
        </div>
      </div>
    </div>
  );
}