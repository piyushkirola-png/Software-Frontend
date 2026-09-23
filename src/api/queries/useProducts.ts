import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeatured(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllProducts(
  page = 0,
  size = 12,
  sortBy?: string,
  minPrice?: number,
  maxPrice?: number,
) {
  return useQuery({
    queryKey: ["products", "all", page, size, sortBy, minPrice, maxPrice],
    queryFn: () =>
      productService.getAll(page, size, sortBy, minPrice, maxPrice),
  });
}

export function useProductsByCategory(
  slug: string,
  page = 0,
  size = 12,
  sortBy?: string,
  minPrice?: number,
  maxPrice?: number,
) {
  return useQuery({
    queryKey: [
      "products",
      "category",
      slug,
      page,
      size,
      sortBy,
      minPrice,
      maxPrice,
    ],
    queryFn: () =>
      productService.getByCategory(
        slug,
        page,
        size,
        sortBy,
        minPrice,
        maxPrice,
      ),
    enabled: !!slug,
  });
}

export function useProductSearch(q: string, page = 0, size = 12) {
  return useQuery({
    queryKey: ["products", "search", q, page, size],
    queryFn: () => productService.search(q, page, size),
    enabled: q.length > 0,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  });
}
