export interface Coupon {
  id: number;
  code: string;
  description?: string | null;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  perUserLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
}