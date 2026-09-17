import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Cart } from "../../types/cart";
import Button from "../ui/Button";

interface Props {
  cart: Cart;
  showCheckoutButton?: boolean;
  onClose?: () => void;
}

export default function CartSummary({ cart, showCheckoutButton = true, onClose }: Props) {
  return (
    <div className="bg-soft rounded-xl p-5">
      <h3 className="font-bold text-navy mb-4">Order Summary</h3>

      <div className="space-y-2 text-sm">
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
          <span className="text-muted text-xs">Included</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
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
    </div>
  );
}