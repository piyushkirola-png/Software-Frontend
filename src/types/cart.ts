export interface CartItem {
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
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}