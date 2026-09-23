import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Loader2,
  Check,
  Shield,
  Zap,
  Headphones,
  Star,
  PackageX,
  FileText,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import ProductGallery from "../../components/product/ProductGallery";
import ProductReviews from "../../components/product/ProductReviews";
import Reveal from "../../components/animations/Reveal";
import { useProduct } from "../../api/queries/useProducts";
import { useAuthContext } from "../../lib/AuthContext";
import { cartService } from "../../api/services/cartService";
import { getErrorMessage } from "../../lib/api-client";

type Tab = "description" | "reviews";

export default function ProductDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const { isAuthenticated, showToast } = useAuthContext();
  const { data: product, isLoading, error } = useProduct(slug);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");
  const [tab, setTab] = useState<Tab>("description");
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted">
        <PackageX className="w-12 h-12 mb-3 text-gray-300" />
        <p className="font-semibold text-navy">Product not found</p>
        <Link
          to="/products"
          className="text-brand text-sm mt-2 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setAddError("");
    if ((product.availableKeys ?? 0) <= 0) {
      setAddError("This product is currently out of stock.");
      return;
    }
    if (!isAuthenticated) {
      nav("/login", { state: { from: `/product/${slug}` } });
      return;
    }

    setAdding(true);
    try {
      await cartService.add({
        productId: product.id,
        quantity,
      });
      setAdded(true);
      showToast("Added to cart");
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      setAddError(getErrorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  const price = product.price;
  const mrp = product.mrp;
  const outOfStock = (product.availableKeys ?? 0) <= 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        {product.categorySlug && (
          <>
            <Link
              to={`/products/category/${product.categorySlug}`}
              className="hover:text-brand"
            >
              {product.categoryName}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        <span className="text-navy font-semibold">{product.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-10">
        <Reveal>
          <ProductGallery
            images={
              [product.thumbnailUrl, ...(product.images || [])].filter(
                Boolean,
              ) as string[]
            }
            alt={product.title}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="lg:sticky lg:top-24">
            {product.categoryName && (
              <div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">
                {product.categoryName}
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-navy leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            {product.ratingCount !== undefined && product.ratingCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={
                        i < Math.round(product.ratingAvg || 0)
                          ? "#10B981"
                          : "transparent"
                      }
                      stroke={
                        i < Math.round(product.ratingAvg || 0)
                          ? "#10B981"
                          : "#CBD5E1"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-muted">
                  {product.ratingAvg} ({product.ratingCount} reviews)
                </span>
              </div>
            )}

            {/* Price — inline row */}
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {mrp && mrp > price && (
                <span className="text-base text-gray-400 line-through">
                  ₹{mrp.toFixed(2)}
                </span>
              )}
              <span className="text-base font-extrabold text-navy">
                ₹{price.toFixed(2)}
              </span>
              <span className="text-base font-bold text-brand">Inc GST</span>
              {product.discountPercent && product.discountPercent > 0 && (
                <span className="bg-success text-white text-xs font-bold px-2.5 py-1 rounded-full ml-1">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-muted mt-4 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center text-navy hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-bold text-navy">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-navy hover:bg-soft transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                fullWidth
                size="lg"
                loading={adding}
                onClick={handleAddToCart}
                disabled={outOfStock}
                variant={added ? "outline" : "primary"}
              >
                {outOfStock ? (
                  <>Out of Stock</>
                ) : added ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </Button>
            </div>

            {addError && <p className="text-xs text-danger mt-2">{addError}</p>}

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-soft border border-gray-100">
                <Zap className="w-5 h-5 text-brand mx-auto mb-1" />
                <div className="text-[10px] text-navy font-semibold">
                  Instant Delivery
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-soft border border-gray-100">
                <Shield className="w-5 h-5 text-success mx-auto mb-1" />
                <div className="text-[10px] text-navy font-semibold">
                  Secured Payment
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-soft border border-gray-100">
                <Headphones className="w-5 h-5 text-brand mx-auto mb-1" />
                <div className="text-[10px] text-navy font-semibold">
                  24x7 Support
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-8 border-t border-gray-100 pt-5 space-y-2 text-xs text-muted">
              {product.licenseType && (
                <div>
                  <b className="text-navy">License Type:</b>{" "}
                  {product.licenseType}
                </div>
              )}
              {product.activationType && (
                <div>
                  <b className="text-navy">Activation:</b>{" "}
                  {product.activationType}
                </div>
              )}
              {product.availableKeys !== undefined && (
                <div>
                  <b className="text-navy">Availability:</b>{" "}
                  {product.availableKeys > 0 ? (
                    <span className="text-success font-semibold">
                      In Stock ({product.availableKeys})
                    </span>
                  ) : (
                    <span className="text-danger font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Tabs */}
      <div className="bg-soft py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-2 flex gap-1 mb-5 max-w-md">
            <button
              onClick={() => setTab("description")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "description"
                ? "bg-brand text-white shadow-md"
                : "text-navy hover:bg-soft"
                }`}
            >
              <FileText size={14} /> Description
            </button>
            <button
              onClick={() => setTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "reviews"
                ? "bg-brand text-white shadow-md"
                : "text-navy hover:bg-soft"
                }`}
            >
              <MessageSquare size={14} /> Reviews
              {product.ratingCount !== undefined && product.ratingCount > 0 && (
                <span className="text-[10px] bg-white/30 px-1.5 py-0.5 rounded-full">
                  {product.ratingCount}
                </span>
              )}
            </button>
          </div>

          {tab === "description" && (
            <Reveal>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
                {product.description ? (
                  <div
                    className="text-sm text-navy leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-sm text-muted text-center py-6">
                    No description available.
                  </p>
                )}
              </div>
            </Reveal>
          )}

          {tab === "reviews" && (
            <Reveal>
              <ProductReviews productId={product.id} />
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
