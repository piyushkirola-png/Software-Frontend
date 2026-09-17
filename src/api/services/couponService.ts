import { apiPost } from "../../lib/api-client";

export interface CouponResponse {
  id: number;
  code: string;
  description?: string | null;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  isActive: boolean;
}

export const couponService = {
  async validate(code: string, subtotal: number): Promise<CouponResponse> {
    return apiPost<CouponResponse>(
      `/coupons/validate?subtotal=${subtotal}`,
      { code }
    );
  },
};