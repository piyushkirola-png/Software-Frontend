export interface Review {
  id: number;
  productId: number;
  productTitle?: string;
  userId: number;
  userName: string;
  userInitials: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}