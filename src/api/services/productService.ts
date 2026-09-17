import { apiGet } from "../../lib/api-client";
import { PagedResponse, Product } from "../../types/product";

export const productService = {
  async getFeatured(): Promise<Product[]> {
    return apiGet<Product[]>("/products/featured");
  },

  async getAll(page = 0, size = 12, sortBy?: string): Promise<PagedResponse<Product>> {
    return apiGet<PagedResponse<Product>>("/products", { page, size, sortBy });
  },

  async getByCategory(
    slug: string,
    page = 0,
    size = 12,
    sortBy?: string
  ): Promise<PagedResponse<Product>> {
    return apiGet<PagedResponse<Product>>(`/products/category/${slug}`, {
      page,
      size,
      sortBy,
    });
  },

  async search(q: string, page = 0, size = 12): Promise<PagedResponse<Product>> {
    return apiGet<PagedResponse<Product>>("/products/search", { q, page, size });
  },

  async getBySlug(slug: string): Promise<Product> {
    return apiGet<Product>(`/products/${slug}`);
  },
};