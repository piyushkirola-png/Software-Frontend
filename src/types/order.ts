import { Address } from "./address";

export interface OrderItem {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string;
  thumbnailUrl?: string | null;
  variantId?: number | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  licenseKey?: string | null;
  licenseKeys?: string[] | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  tax: number;
  total: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  invoiceNumber?: string | null;
  invoicePdfUrl?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  addressId: number;
  couponCode?: string;
  gateway?: string;
  gstNumber?: string;
  notes?: string;
}
