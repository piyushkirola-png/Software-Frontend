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
} from "lucide-react";
import Button from "../../components/ui/Button";
import ProductGallery from "../../components/product/ProductGallery";
import ProductReviews from "../../components/product/ProductReviews";
import VariantModal, { Variant } from "../../components/product/VariantModal";
import { useProduct } from "../../api/queries/useProducts";
import { useAuthContext } from "../../lib/AuthContext";
import { cartService } from "../../api/services/cartService";
import { getErrorMessage } from "../../lib/api-client";

export default function ProductDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { data: product, isLoading, error } = useProduct(slug);

  const [variantOpen, setVariantOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted">
        <PackageX className="w-12 h-12 mb-3 text-gray-300" />
        <p className="font-semibold">Product not found</p>
        <Link to="/products" className="text-brand text-sm mt-2 hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const variants: Variant[] =
    product.variants?.map((v) => ({
      id: v.id,
      name: v.variantName,
      price: v.price,
      mrp: v.mrp ?? undefined,
    })) || [];

  const handleAddToCart = async () => {
    setAddError("");
    if (!isAuthenticated) {
      nav("/login", { state: { from: `/product/${slug}` } });
      return;
    }

    if (product.hasVariants && !selectedVariant) {
      setVariantOpen(true);
      return;
    }

    setAdding(true);
    try {
      await cartService.add({
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      setAddError(getErrorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  const price = selectedVariant?.price ?? product.price;
  const mrp = selectedVariant?.mrp ?? product.mrp;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span className="mx-1">/</span>
        {product.categorySlug && (
          <>
            <Link
              to={`/products?category=${product.categorySlug}`}
              className="hover:text-brand"
            >
              {product.categoryName}
            </Link>
            <span className="mx-1">/</span>
          </>
        )}
        <span className="text-navy font-semibold">{product.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <ProductGallery
          images={[product.thumbnailUrl, ...(product.images || [])].filter(
            Boolean
          ) as string[]}
          alt={product.title}
        />

        {/* Info */}
        <div>
          {product.categoryName && (
            <div className="text-xs font-bold text-brand uppercase mb-2">
              {product.categoryName}
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy leading-snug">
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
                    fill={i < Math.round(product.ratingAvg || 0) ? "#10B981" : "transparent"}
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

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            {mrp && mrp > price && (
              <span className="text-lg text-gray-400 line-through">
                ₹{mrp.toFixed(2)}
              </span>
            )}
            <span className="text-3xl font-extrabold text-navy">
              ₹{price.toFixed(2)}
            </span>
            <span className="text-sm text-muted">Inc GST</span>
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="bg-success text-white text-xs font-bold px-2 py-0.5 rounded">
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

          {/* Variant selector info */}
          {product.hasVariants && variants.length > 0 && (
            <div className="mt-5 bg-soft rounded-lg p-4">
              <p className="text-xs font-bold text-navy uppercase mb-2">
                Choose Option
              </p>
              <button
                onClick={() => setVariantOpen(true)}
                className="w-full border-2 border-brand text-brand font-semibold py-2.5 rounded-lg hover:bg-brand hover:text-white transition"
              >
                {selectedVariant
                  ? `Selected: ${selectedVariant.name}`
                  : "Select Options"}
              </button>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              fullWidth
              size="lg"
              loading={adding}
              onClick={handleAddToCart}
              variant={added ? "outline" : "primary"}
            >
              {added ? (
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

          {addError && (
            <p className="text-xs text-red-500 mt-2">{addError}</p>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="text-center">
              <Zap className="w-5 h-5 text-brand mx-auto mb-1" />
              <div className="text-[11px] text-muted font-semibold">Instant Delivery</div>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 text-success mx-auto mb-1" />
              <div className="text-[11px] text-muted font-semibold">Secured Payment</div>
            </div>
            <div className="text-center">
              <Headphones className="w-5 h-5 text-brand mx-auto mb-1" />
              <div className="text-[11px] text-muted font-semibold">24x7 Support</div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-8 border-t border-gray-100 pt-5 space-y-2 text-xs text-muted">
            {product.licenseType && (
              <div>
                <b className="text-navy">License Type:</b> {product.licenseType}
              </div>
            )}
            {product.activationType && (
              <div>
                <b className="text-navy">Activation:</b> {product.activationType}
              </div>
            )}
            {!product.hasVariants && product.stockQuantity !== undefined && (
              <div>
                <b className="text-navy">Availability:</b>{" "}
                {product.stockQuantity > 0 ? (
                  <span className="text-success font-semibold">
                    In Stock ({product.stockQuantity})
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">Out of Stock</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description + Reviews */}
      <div className="bg-soft py-12">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[2fr_1fr] gap-6">
          {product.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-xl font-extrabold text-navy mb-4">
                Product Description
              </h2>
              <div
                className="text-sm text-muted leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
          <div className="lg:col-span-1">
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </div>

      <VariantModal
        open={variantOpen}
        onClose={() => setVariantOpen(false)}
        productTitle={product.title}
        variants={variants}
        onSelect={(v) => setSelectedVariant(v)}
      />
    </div>
  );
}