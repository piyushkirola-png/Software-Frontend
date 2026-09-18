import { useState } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard, { ProductCardType } from "../product/ProductCard";
import VariantModal, { Variant } from "../product/VariantModal";
import { useFeaturedProducts } from "../../api/queries/useProducts";
import { Product } from "../../types/product";
import Reveal from "../animations/Reveal";
import { SkeletonCard } from "../ui/Skeleton";

export default function FeaturedDeals() {
  const { data: products, isLoading, error } = useFeaturedProducts();
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

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

  const modalVariants: Variant[] =
    variantProduct?.variants?.map((v) => ({
      id: v.id,
      name: v.variantName,
      price: v.price,
      mrp: v.mrp ?? undefined,
    })) || [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <Reveal>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Flame size={12} /> LIMITED TIME DEALS
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
            Top Software Deals
          </h2>
          <p className="text-muted mt-3 text-sm md:text-base max-w-2xl mx-auto">
            Instant license delivery with GST invoice to your email ID
            (step-by-step instructions included).
          </p>
        </div>
      </Reveal>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500 text-sm">
          Failed to load products. Please try again later.
        </div>
      )}

      {!isLoading && !error && (!products || products.length === 0) && (
        <div className="text-center py-20 text-muted">
          <p className="text-lg font-semibold">No products available yet</p>
          <p className="text-sm mt-2">Check back soon!</p>
        </div>
      )}

      {products && products.length > 0 && (
        <Reveal delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 12).map((p) => (
              <ProductCard
                key={p.id}
                product={toCardType(p)}
                onSelectVariant={() => setVariantProduct(p)}
              />
            ))}
          </div>
        </Reveal>
      )}

      {products && products.length > 0 && (
        <Reveal delay={200}>
          <div className="flex justify-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 border-2 border-brand text-brand font-bold px-7 py-3 rounded-xl hover:bg-brand hover:text-white transition"
            >
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      )}

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