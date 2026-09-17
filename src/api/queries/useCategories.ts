import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });
}