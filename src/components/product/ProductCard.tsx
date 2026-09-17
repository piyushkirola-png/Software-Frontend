import { ShoppingCart, Settings, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../lib/AuthContext";
import { useAddToCart } from "../../api/mutations/cartMutations";

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

export default function ProductCard({ product, onSelectVariant }: Props) {
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

    if (product.hasVariants) {
      onSelectVariant?.(product);
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-cardHover transition-shadow">
      <div className="relative bg-soft aspect-square flex items-center justify-center p-6">
        {product.sale && (
          <span className="absolute top-3 left-3 bg-success text-white text-[11px] font-bold px-2.5 py-1 rounded z-10">
            Sale!
          </span>
        )}
        <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full object-contain"
          />
        </Link>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-navy leading-snug line-clamp-2 min-h-[40px] hover:text-brand">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {product.mrp && product.mrp > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.mrp.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-bold text-navy">₹{product.price.toFixed(2)}</span>
          <span className="text-xs text-muted">Inc GST</span>
          {discount > 0 && (
            <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
        </div>

        {product.hasVariants ? (
          <button
            onClick={handleAdd}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition"
          >
            <Settings size={16} /> SELECT OPTIONS
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={addToCart.isPending}
            className={`mt-4 w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-lg transition ${
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
        )}
      </div>
    </div>
  );
}