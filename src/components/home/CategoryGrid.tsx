import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "../../api/queries/useCategories";

export default function CategoryGrid() {
  const { data: categories, isLoading, error } = useCategories();

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
          Top categories
        </h2>
        <p className="text-muted mt-3 text-sm md:text-base max-w-2xl mx-auto">
          Our top categories bring together powerful software solutions that
          deliver performance, reliability, and long-term value.
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
          Failed to load categories.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && (!categories || categories.length === 0) && (
        <div className="text-center py-20 text-muted">
          <p className="text-lg font-semibold">No categories yet</p>
        </div>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group rounded-xl overflow-hidden bg-white shadow-card hover:shadow-cardHover transition-all"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={c.imageUrl || "https://placehold.co/300x300?text=Category"}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-navy group-hover:bg-brand transition-colors px-4 py-4 flex items-center justify-between">
                <span className="text-white font-bold text-sm md:text-base">
                  {c.name}
                </span>
                <span className="w-9 h-9 rounded-md bg-white/20 group-hover:bg-white flex items-center justify-center transition-colors">
                  <ArrowRight
                    size={16}
                    className="text-white group-hover:text-brand transition-colors"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}