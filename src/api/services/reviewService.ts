import { apiGet } from "../../lib/api-client";
import { Review } from "../../types/review";
import { PagedResponse } from "../../types/product";

export const reviewService = {
  async getFeatured(): Promise<Review[]> {
    return apiGet<Review[]>("/reviews/featured");
  },

  async getForProduct(
    productId: number,
    page = 0,
    size = 10
  ): Promise<PagedResponse<Review>> {
    return apiGet<PagedResponse<Review>>(`/reviews/product/${productId}`, {
      page,
      size,
    });
  },
};