import { useQuery } from "@tanstack/react-query";
import { reviewService } from "../services/reviewService";

export function useFeaturedReviews() {
  return useQuery({
    queryKey: ["reviews", "featured"],
    queryFn: () => reviewService.getFeatured(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReviews(productId: number, page = 0, size = 10) {
  return useQuery({
    queryKey: ["reviews", "product", productId, page, size],
    queryFn: () => reviewService.getForProduct(productId, page, size),
    enabled: !!productId,
  });
}
