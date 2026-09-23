import { apiDelete, apiGet, apiPost, apiPut } from "../../lib/api-client";
import { Cart } from "../../types/cart";

export const cartService = {
  async get(): Promise<Cart> {
    return apiGet<Cart>("/cart");
  },

  async getCount(): Promise<number> {
    return apiGet<number>("/cart/count");
  },

  async add(data: {
    productId: number;
    variantId?: number;
    quantity?: number;
  }): Promise<Cart> {
    return apiPost<Cart>("/cart/add", data);
  },

  async updateQuantity(cartItemId: number, quantity: number): Promise<Cart> {
    return apiPut<Cart>(`/cart/items/${cartItemId}?quantity=${quantity}`);
  },

  async removeItem(cartItemId: number): Promise<Cart> {
    return apiDelete<Cart>(`/cart/items/${cartItemId}`);
  },

  async clear(): Promise<void> {
    return apiDelete<void>("/cart/clear");
  },
};
