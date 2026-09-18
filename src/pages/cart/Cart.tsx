import { ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../api/queries/useCart";
import CartItemRow from "../../components/cart/CartItemRow";
import CartSummary from "../../components/cart/CartSummary";
import { useAuthContext } from "../../lib/AuthContext";
import Button from "../../components/ui/Button";
import Reveal from "../../components/animations/Reveal";
import { SkeletonRow } from "../../components/ui/Skeleton";

export default function Cart() {
  const { isAuthenticated } = useAuthContext();
  const { data: cart, isLoading } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-soft">
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
    );
  }

  if (isLoading) {
    return (
      <div className="bg-soft min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-soft">
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
    );
  }

  return (
    <div className="bg-soft min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="mb-6">
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
          {/* Items */}
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </Reveal>

          {/* Summary — sticky */}
          <Reveal delay={0.1}>
            <aside className="lg:sticky lg:top-24 h-fit">
              <CartSummary cart={cart} showCheckoutButton />
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
}