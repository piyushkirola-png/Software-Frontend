import { X, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../../api/queries/useCart";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { data: cart, isLoading } = useCart();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy flex items-center gap-2">
            <ShoppingBag size={18} /> Your Cart
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {isLoading && (
            <div className="py-10 text-center text-muted text-sm">
              Loading...
            </div>
          )}

          {!isLoading && (!cart || cart.items.length === 0) && (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted font-semibold">Your cart is empty</p>
              <Link
                to="/products"
                onClick={onClose}
                className="text-brand text-sm font-semibold mt-3 inline-block hover:underline"
              >
                Start Shopping →
              </Link>
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <div>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-gray-100 p-5">
            <CartSummary cart={cart} showCheckoutButton onClose={onClose} />
          </div>
        )}
      </div>
    </>
  );
}
