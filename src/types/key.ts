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
