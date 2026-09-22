import { ArrowRight, Loader2, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "../../api/queries/useCategories";
import Reveal from "../animations/Reveal";
import { resolveImageUrl } from "../../lib/upload";

export default function CategoryGrid() {
  const { data: categories, isLoading, error } = useCategories();

  return (
    <section className="bg-soft py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy/5 text-navy text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <LayoutGrid size={12} /> BROWSE BY CATEGORY
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
              Top Categories
            </h2>
            <p className="text-muted mt-3 text-sm md:text-base max-w-2xl mx-auto">
              Our top categories bring together powerful software solutions
              that deliver performance, reliability, and long-term value.
            </p>
          </div>
        </Reveal>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500 text-sm">
            Failed to load categories.
          </div>
        )}

        {!isLoading && !error && (!categories || categories.length === 0) && (
          <div className="text-center py-20 text-muted">
            <p className="text-lg font-semibold">No categories yet</p>
          </div>
        )}

        {categories && categories.length > 0 && (
          <Reveal delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((c, i) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className="group rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-cardHover transition-all hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-soft">
                    <img
                      src={resolveImageUrl(c.imageUrl)}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="bg-navy group-hover:bg-brand transition-colors px-5 py-4 flex items-center justify-between">
                    <span className="text-white font-bold text-sm md:text-base">
                      {c.name}
                    </span>
                    <span className="w-9 h-9 rounded-lg bg-white/20 group-hover:bg-white flex items-center justify-center transition-colors">
                      <ArrowRight
                        size={16}
                        className="text-white group-hover:text-brand transition-colors"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}