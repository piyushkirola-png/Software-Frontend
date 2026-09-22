import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../lib/AuthContext";
import { useAddToCart } from "../../api/mutations/cartMutations";
import { notify } from "../ui/toast";
import { getErrorMessage } from "../../lib/api-client";

export type ProductCardType = {
  id: number;
  slug: string;
  title: string;
  image: string;
  mrp?: number;
  price: number;
  hasVariants: boolean;
  sale?: boolean;
};

interface Props {
  product: ProductCardType;
  onSelectVariant?: (p: ProductCardType) => void;
}

export default function ProductCard({ product }: Props) {
  const nav = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: `/product/${product.slug}` } });
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      setAdded(true);
      notify.success("Added to cart");
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-brand/30 hover:shadow-cardHover hover:-translate-y-1 transition-all duration-300">
      <div className="relative bg-soft aspect-square flex items-center justify-center p-6 overflow-hidden">
        {product.sale && (
          <span className="absolute top-3 left-3 z-10 bg-success text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            Sale!
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 z-10 bg-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-navy leading-snug line-clamp-2 min-h-[40px] group-hover:text-brand transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price — inline row */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {product.mrp && product.mrp > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.mrp.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-extrabold text-navy">
            ₹{product.price.toFixed(2)}
          </span>
          <span className="text-sm font-bold text-brand">Inc GST</span>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handleAdd}
            disabled={addToCart.isPending}
            className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition ${
              added
                ? "bg-success text-white"
                : "bg-brand hover:bg-brand-dark text-white"
            } disabled:opacity-60`}
          >
            {addToCart.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : added ? (
              <>
                <Check size={16} /> ADDED
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> ADD TO CART
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}