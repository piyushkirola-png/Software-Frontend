export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  displayOrder?: number;
  isActive: boolean;
  productCount?: number;
}