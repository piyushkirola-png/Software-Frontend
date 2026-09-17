import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, PackageX } from "lucide-react";
import ProductCard, { ProductCardType } from "../../components/product/ProductCard";
import VariantModal, { Variant } from "../../components/product/VariantModal";
import ProductFilters, { FilterState } from "../../components/product/ProductFilters";
import { useProductsByCategory } from "../../api/queries/useProducts";
import { useCategory } from "../../api/queries/useCategories";
import { Product } from "../../types/product";

export default function CategoryListing() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<FilterState>({ sortBy: "default" });
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  const { data: category } = useCategory(slug);
  const { data, isLoading, error } = useProductsByCategory(slug, 0, 12, filters.sortBy);

  const products = data?.content || [];
  const totalElements = data?.totalElements || 0;

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
    <div className="bg-soft min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-xs text-muted mb-2">
            <Link to="/" className="hover:text-brand">Home</Link>
            <span className="mx-1">/</span>
            <span className="text-navy font-semibold">
              {category?.name || slug}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
            {category?.name || "Category"}
          </h1>
          {category?.description && (
            <p className="text-sm text-muted mt-1">{category.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside>
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            totalResults={totalElements}
          />
        </aside>

        <div>
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-500 text-sm">
              Failed to load products.
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-20 text-muted">
              <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No products in this category</p>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={toCardType(p)}
                  onSelectVariant={() => setVariantProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <VariantModal
        open={!!variantProduct}
        onClose={() => setVariantProduct(null)}
        productTitle={variantProduct?.title || ""}
        variants={modalVariants}
        onSelect={(v) => console.log("Selected variant:", v)}
      />
    </div>
  );
}