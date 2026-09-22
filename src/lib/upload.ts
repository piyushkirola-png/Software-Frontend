import { apiClient, ApiResponse } from "./api-client";

const BACKEND_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"
).replace(/\/api$/, "");

/**
 * Upload a product image to the backend.
 * Backend saves to uploads/products/{uuid}.ext and returns "/uploads/products/{uuid}.ext".
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await apiClient.post<ApiResponse<{ url: string }>>(
    "/admin/uploads/product",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    }
  );
  return res.data.data.url;
}

/**
 * Upload a category image to the backend.
 */
export async function uploadCategoryImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await apiClient.post<ApiResponse<{ url: string }>>(
    "/admin/uploads/category",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    }
  );
  return res.data.data.url;
}

/**
 * Resolve any stored image value to a URL the browser can load.
 *
 * Cases:
 *  - ImageKit / other full URL          → return as-is
 *  - Local upload (/uploads/products/…) → prepend backend base
 *  - Legacy path (public\software\… or public/software/…) → strip "public", use /software/…
 *  - Public folder asset (/software/…, /assets/…, etc.) → return as-is (frontend origin)
 *  - Empty / null                       → placeholder
 */
export function resolveImageUrl(raw?: string | null): string {
  const PLACEHOLDER = "https://placehold.co/600x600?text=No+Image";
  if (!raw) return PLACEHOLDER;

  let url = raw.trim().replace(/\\/g, "/");

  // Strip "public/" or "/public/" prefix
  url = url.replace(/^\.?\/?public\//i, "/");

  // Full URL
  if (/^https?:\/\//i.test(url)) return url;

  // Backend upload
  if (url.startsWith("/uploads/")) return BACKEND_BASE + url;

  // Ensure leading slash for other relative paths
  if (!url.startsWith("/")) url = "/" + url;

  return url;
}