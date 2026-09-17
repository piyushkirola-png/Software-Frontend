import { apiGet } from "../../lib/api-client";

export interface UserKey {
  id: number;
  productId: number;
  productTitle: string;
  variantId?: number | null;
  variantName?: string | null;
  licenseKey: string;
  status: string;
  soldAt?: string | null;
}

export const keyService = {
  async getMyKeys(): Promise<UserKey[]> {
    return apiGet<UserKey[]>("/keys/my");
  },

  async getKeysForOrder(orderId: number): Promise<UserKey[]> {
    return apiGet<UserKey[]>(`/keys/order/${orderId}`);
  },
};