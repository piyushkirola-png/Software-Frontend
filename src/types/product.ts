export interface ProductVariant {
  id: number;
  variantName: string;
  mrp?: number | null;
  price: number;
  stockQuantity?: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  title: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  seoKeywords?: string | null;
  mrp?: number | null;
  price: number;
  discountPercent?: number;
  thumbnailUrl?: string | null;
  images?: string[];
  licenseType?: string | null;
  activationType?: string | null;
  hasVariants: boolean;
  stockQuantity?: number;
  isFeatured: boolean;
  isActive: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  variants?: ProductVariant[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}