import { apiGet } from "../../lib/api-client";
import { Category } from "../../types/category";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return apiGet<Category[]>("/categories");
  },

  async getBySlug(slug: string): Promise<Category> {
    return apiGet<Category>(`/categories/${slug}`);
  },
};