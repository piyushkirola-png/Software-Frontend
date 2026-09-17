import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CartItem } from "../../types/cart";
import { useUpdateCartQuantity, useRemoveCartItem } from "../../api/mutations/cartMutations";

interface Props {
  item: CartItem;
}

export default function CartItemRow({ item }: Props) {
  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveCartItem();

  const handleQty = (newQty: number) => {
    if (newQty < 1) return;
    updateQty.mutate({ cartItemId: item.id, quantity: newQty });
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link
        to={`/product/${item.productSlug}`}
        className="w-20 h-20 bg-soft rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
      >
        <img
          src={item.thumbnailUrl || "https://placehold.co/80x80?text=Img"}
          alt={item.productTitle}
          className="max-h-full max-w-full object-contain p-2"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.productSlug}`}
          className="font-semibold text-navy text-sm leading-snug hover:text-brand line-clamp-2"
        >
          {item.productTitle}
        </Link>
        {item.variantName && (
          <div className="text-xs text-muted mt-1">{item.variantName}</div>
        )}
        <div className="text-sm font-bold text-navy mt-2">
          ₹{item.unitPrice.toFixed(2)}
        </div>
      </div>

      {/* Qty */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
        <button
          onClick={() => handleQty(item.quantity - 1)}
          disabled={item.quantity <= 1 || updateQty.isPending}
          className="w-8 h-8 flex items-center justify-center hover:bg-soft disabled:opacity-40 rounded-l-lg"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-semibold">
          {updateQty.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : item.quantity}
        </span>
        <button
          onClick={() => handleQty(item.quantity + 1)}
          disabled={updateQty.isPending}
          className="w-8 h-8 flex items-center justify-center hover:bg-soft disabled:opacity-40 rounded-r-lg"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Line total */}
      <div className="hidden sm:block w-24 text-right font-bold text-navy text-sm">
        ₹{item.lineTotal.toFixed(2)}
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem.mutate(item.id)}
        disabled={removeItem.isPending}
        className="w-9 h-9 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition"
      >
        {removeItem.isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );
}