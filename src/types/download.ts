export interface DownloadItem {
  productId: number;
  productTitle: string;
  slug: string;
  thumbnailUrl?: string | null;
  downloadUrl: string;
  purchasedAt: string;
}