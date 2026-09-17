import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../api/queries/useCart";
import CartItemRow from "../../components/cart/CartItemRow";
import CartSummary from "../../components/cart/CartSummary";
import { useAuthContext } from "../../lib/AuthContext";
import Button from "../../components/ui/Button";

export default function Cart() {
  const { isAuthenticated } = useAuthContext();
  const { data: cart, isLoading } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-14 h-14 text-gray-300 mb-4" />
        <h1 className="text-2xl font-extrabold text-navy mb-2">
          Please login to view your cart
        </h1>
        <p className="text-muted text-sm mb-6">
          Login or create an account to continue shopping.
        </p>
        <div className="flex gap-3">
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-muted">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-14 h-14 text-gray-300 mb-4" />
        <h1 className="text-2xl font-extrabold text-navy mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted text-sm mb-6">
          Add products to your cart to see them here.
        </p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-soft min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
            Shopping Cart
          </h1>
          <p className="text-sm text-muted mt-1">
            {cart.totalItems} item{cart.totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <CartSummary cart={cart} showCheckoutButton />
          </aside>
        </div>
      </div>
    </div>
  );
}