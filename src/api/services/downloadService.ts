import { apiGet } from "../../lib/api-client";

export interface DownloadItem {
  productId: number;
  productTitle: string;
  slug: string;
  thumbnailUrl?: string | null;
  downloadUrl: string;
  purchasedAt: string;
}

export const downloadService = {
  async getMyDownloads(): Promise<DownloadItem[]> {
    return apiGet<DownloadItem[]>("/downloads");
  },
};
