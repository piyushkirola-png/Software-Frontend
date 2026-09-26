import { apiGet } from "../../lib/api-client";

export interface UserKey {
  id: number;
  productId: number;
  productTitle: string;
  productSlug?: string | null;
  productThumbnailUrl?: string | null;
  productDownloadUrl?: string | null;
  variantId?: number | null;
  variantName?: string | null;
  licenseKey: string;
  status: string;
  orderId?: number | null;
  orderNumber?: string | null;
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
