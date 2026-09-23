import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, X, Check } from "lucide-react";
import { notify } from "../ui/toast";
import { useCategories } from "../../api/queries/useCategories";

export interface FilterState {
  sortBy: string;
  priceMin?: number;
  priceMax?: number;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  totalResults?: number;
}

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductFilters({ filters, onChange, totalResults }: Props) {
  const [open, setOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() || "");
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() || "");

  const { slug: activeSlug } = useParams<{ slug: string }>();
  const { data: categories } = useCategories();

  const applyPrice = () => {
    if (priceMin && priceMax && Number(priceMin) > Number(priceMax)) {
      notify.error("Min price cannot exceed Max price");
      return;
    }
    onChange({
      ...filters,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    });
    notify.success("Filter applied successfully");
  };

  const reset = () => {
    setPriceMin("");
    setPriceMax("");
    onChange({ sortBy: "default" });
    notify.success("Filter cleared successfully");
  };

  return (
    <div className="w-full">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 mb-3"
      >
        <span className="font-semibold text-navy text-sm">Filters & Sort</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`${open ? "block" : "hidden"
          } md:block bg-white border border-gray-100 rounded-xl p-5 shadow-card min-h-[600px]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
            Filters
          </h3>
          <button
            onClick={reset}
            className="text-xs text-brand hover:underline"
          >
            Reset
          </button>
        </div>

        {/* Sort */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-navy uppercase mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => {
              onChange({ ...filters, sortBy: e.target.value });
              notify.success("Sort applied successfully");
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-navy uppercase mb-2">
            Price Range (₹)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <button
            onClick={applyPrice}
            className="mt-3 w-full bg-brand hover:bg-brand-dark text-white text-xs font-bold py-2 rounded-lg transition"
          >
            Apply Price
          </button>
        </div>

        {/* Product Categories */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <label className="block text-xs font-bold text-navy uppercase mb-3">
            Product Categories
          </label>
          <div className="flex flex-col gap-1">
            <Link
              to="/products"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${!activeSlug
                ? "bg-brand/10 text-brand font-semibold"
                : "text-navy hover:bg-gray-50"
                }`}
            >
              <span>All Products</span>
              {!activeSlug && <Check size={14} />}
            </Link>

            {categories?.map((c) => {
              const isActive = activeSlug === c.slug;
              return (
                <Link
                  key={c.id}
                  to={`/products/category/${c.slug}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${isActive
                    ? "bg-brand/10 text-brand font-semibold"
                    : "text-navy hover:bg-gray-50"
                    }`}
                >
                  <span>{c.name}</span>
                  {isActive && <Check size={14} />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}