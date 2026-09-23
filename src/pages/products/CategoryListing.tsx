import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, PackageX, ChevronRight } from "lucide-react";
import ProductCard, { ProductCardType } from "../../components/product/ProductCard";
import VariantModal, { Variant } from "../../components/product/VariantModal";
import ProductFilters, { FilterState } from "../../components/product/ProductFilters";
import Reveal from "../../components/animations/Reveal";
import Pagination from "../../components/ui/Pagination";
import { useProductsByCategory } from "../../api/queries/useProducts";
import { useCategory } from "../../api/queries/useCategories";
import { Product } from "../../types/product";
import { resolveImageUrl } from "../../lib/upload";

const PAGE_SIZE = 16;

export default function CategoryListing() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<FilterState>({ sortBy: "default" });
  const [page, setPage] = useState(0);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  const { data: category } = useCategory(slug);
  const { data, isLoading, error } = useProductsByCategory(
    slug,
    page,
    PAGE_SIZE,
    filters.sortBy,
    filters.priceMin,
    filters.priceMax
  );

  const products = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  const handleFiltersChange = (f: FilterState) => {
    setFilters(f);
    setPage(0);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset page when navigating to a different category
  useEffect(() => {
    setPage(0);
  }, [slug]);

  const toCardType = (p: Product): ProductCardType => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: resolveImageUrl(p.thumbnailUrl),
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
      {/* Breadcrumb only — no title, no description */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Link to="/" className="hover:text-brand transition">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-navy font-semibold">
              {category?.name || slug}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 h-fit">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
          />
        </aside>

        <div>
          {!isLoading && !error && totalElements > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">
                Showing{" "}
                <b className="text-navy">
                  {products.length > 0 ? page * PAGE_SIZE + 1 : 0}
                </b>
                –
                <b className="text-navy">{page * PAGE_SIZE + products.length}</b> of{" "}
                <b className="text-navy">{totalElements}</b> results
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-brand animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-sm text-danger font-semibold">
                Failed to load products.
              </p>
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
                <PackageX className="h-8 w-8 text-white" />
              </div>
              <p className="text-base font-bold text-navy">
                No products in this category
              </p>
              <p className="text-sm text-muted mt-1">
                Check back soon for new arrivals.
              </p>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={toCardType(p)}
                    onSelectVariant={() => setVariantProduct(p)}
                  />
                ))}
              </div>
            </Reveal>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
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