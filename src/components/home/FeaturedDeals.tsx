import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard, { ProductCardType } from "../product/ProductCard";
import VariantModal, { Variant } from "../product/VariantModal";
import { useFeaturedProducts } from "../../api/queries/useProducts";
import { Product } from "../../types/product";

export default function FeaturedDeals() {
  const { data: products, isLoading, error } = useFeaturedProducts();
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  // Convert API Product → ProductCard shape
  const toCardType = (p: Product): ProductCardType => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: p.thumbnailUrl || "https://placehold.co/300x200?text=Product",
    mrp: p.mrp ?? undefined,
    price: p.price,
    hasVariants: p.hasVariants,
    sale: !!p.mrp && p.mrp > p.price,
  });

  // Build variants for the modal from the selected product
  const modalVariants: Variant[] =
    variantProduct?.variants?.map((v) => ({
      id: v.id,
      name: v.variantName,
      price: v.price,
      mrp: v.mrp ?? undefined,
    })) || [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
          Top Software Deals
        </h2>
        <p className="text-muted mt-3 text-sm md:text-base">
          Instant license delivery with GST invoice to your email ID (step-by-step
          instructions included).
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-10 text-red-500 text-sm">
          Failed to load products. Please try again later.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && (!products || products.length === 0) && (
        <div className="text-center py-20 text-muted">
          <p className="text-lg font-semibold">No products available yet</p>
          <p className="text-sm mt-2">Check back soon!</p>
        </div>
      )}

      {/* Products Grid */}
      {products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.slice(0, 12).map((p) => (
            <ProductCard
              key={p.id}
              product={toCardType(p)}
              onSelectVariant={() => setVariantProduct(p)}
            />
          ))}
        </div>
      )}

      {/* View All */}
      {products && products.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 border-2 border-brand text-brand font-bold px-6 py-3 rounded-lg hover:bg-brand hover:text-white transition"
          >
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Variant Modal */}
      <VariantModal
        open={!!variantProduct}
        onClose={() => setVariantProduct(null)}
        productTitle={variantProduct?.title || ""}
        variants={modalVariants}
        onSelect={(v) => console.log("Selected variant:", v)}
      />
    </section>
  );
}