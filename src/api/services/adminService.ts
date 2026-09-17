import { apiDelete, apiGet, apiPost, apiPut, apiClient, ApiResponse } from "../../lib/api-client";
import { Category } from "../../types/category";
import { Product, PagedResponse } from "../../types/product";
import { Order } from "../../types/order";
import { User } from "../../types/user";
import { Review } from "../../types/review";

// ================== Dashboard ==================
export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  successOrders: number;
  failedOrders: number;
  totalUsers: number;
  todayNewUsers: number;
  totalProducts: number;
  totalCategories: number;
  activeProducts: number;
  pendingReviews: number;
  totalReviews: number;
  availableKeys: number;
  reservedKeys: number;
  soldKeys: number;
  revokedKeys: number;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
}

// ================== Category ==================
export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ================== Product ==================
export interface ProductRequest {
  categoryId: number;
  title: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  seoKeywords?: string;
  mrp?: number;
  price: number;
  thumbnailUrl?: string;
  downloadFilePath?: string;
  licenseType?: string;
  activationType?: string;
  hasVariants?: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  images?: string[];
  variants?: Array<{
    variantName: string;
    mrp?: number;
    price: number;
    stockQuantity?: number;
    displayOrder?: number;
    isActive?: boolean;
  }>;
}

// ================== Coupon ==================
export interface CouponRequest {
  code: string;
  description?: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

// ================== Key ==================
export interface KeyStock {
  productId: number;
  productTitle: string;
  variantId?: number | null;
  variantName?: string | null;
  available: number;
  reserved: number;
  sold: number;
  revoked: number;
  total: number;
}

export interface AdminKey {
  id: number;
  productId: number;
  productTitle: string;
  variantId?: number | null;
  variantName?: string | null;
  licenseKey: string;
  status: string;
  soldAt?: string | null;
}

// ================== Reports ==================
export interface SalesReport {
  fromDate: string;
  toDate: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export interface GstReport {
  fromDate: string;
  toDate: string;
  totalInvoices: number;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  totalInvoiceValue: number;
}

// ================== Service ==================
export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>("/admin/dashboard/stats");
  },

  async getRecentOrders(limit = 10): Promise<RecentOrder[]> {
    return apiGet<RecentOrder[]>(`/admin/dashboard/recent-orders?limit=${limit}`);
  },

  async getSalesReport(fromDate?: string, toDate?: string): Promise<SalesReport> {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    return apiGet<SalesReport>(`/admin/dashboard/reports/sales?${params}`);
  },

  async getGstReport(fromDate?: string, toDate?: string): Promise<GstReport> {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    return apiGet<GstReport>(`/admin/dashboard/reports/gst?${params}`);
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return apiGet<Category[]>("/admin/categories");
  },

  async createCategory(data: CategoryRequest): Promise<Category> {
    return apiPost<Category>("/admin/categories", data);
  },

  async updateCategory(id: number, data: CategoryRequest): Promise<Category> {
    return apiPut<Category>(`/admin/categories/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    return apiDelete<void>(`/admin/categories/${id}`);
  },

  // Products
  async getAllProducts(
    page = 0,
    size = 20,
    status?: string,
    categoryId?: number
  ): Promise<PagedResponse<Product>> {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    if (categoryId) params.categoryId = categoryId;
    return apiGet<PagedResponse<Product>>("/admin/products", params);
  },

  async getProduct(id: number): Promise<Product> {
    return apiGet<Product>(`/admin/products/${id}`);
  },

  async createProduct(data: ProductRequest): Promise<Product> {
    return apiPost<Product>("/admin/products", data);
  },

  async updateProduct(id: number, data: ProductRequest): Promise<Product> {
    return apiPut<Product>(`/admin/products/${id}`, data);
  },

  async deleteProduct(id: number): Promise<void> {
    return apiDelete<void>(`/admin/products/${id}`);
  },

  async toggleProductActive(id: number): Promise<Product> {
    return apiPost<Product>(`/admin/products/${id}/toggle-active`);
  },

  // Coupons
  async getAllCoupons(
    page = 0,
    size = 20,
    status?: string
  ): Promise<PagedResponse<Coupon>> {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    return apiGet<PagedResponse<Coupon>>("/admin/coupons", params);
  },

  async createCoupon(data: CouponRequest): Promise<Coupon> {
    return apiPost<Coupon>("/admin/coupons", data);
  },

  async updateCoupon(id: number, data: CouponRequest): Promise<Coupon> {
    return apiPut<Coupon>(`/admin/coupons/${id}`, data);
  },

  async deleteCoupon(id: number): Promise<void> {
    return apiDelete<void>(`/admin/coupons/${id}`);
  },

  async toggleCouponActive(id: number): Promise<Coupon> {
    return apiPost<Coupon>(`/admin/coupons/${id}/toggle-active`);
  },

  // Orders
  async getAllOrders(
    page = 0,
    size = 20,
    status?: string,
    search?: string
  ): Promise<PagedResponse<Order>> {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    if (search) params.search = search;
    return apiGet<PagedResponse<Order>>("/admin/orders", params);
  },

  async getOrder(id: number): Promise<Order> {
    return apiGet<Order>(`/admin/orders/${id}`);
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    return apiPut<Order>(`/admin/orders/${id}/status?status=${status}`);
  },

  async resendOrderEmail(id: number): Promise<void> {
    return apiPost<void>(`/admin/orders/${id}/resend-email`);
  },

  // Users
  async getAllUsers(
    page = 0,
    size = 20,
    search?: string
  ): Promise<PagedResponse<User>> {
    const params: Record<string, unknown> = { page, size };
    if (search) params.search = search;
    return apiGet<PagedResponse<User>>("/admin/users", params);
  },

  async updateUser(
    id: number,
    data: { name?: string; phone?: string; role?: string; isActive?: boolean }
  ): Promise<User> {
    return apiPut<User>(`/admin/users/${id}`, data);
  },

  async toggleUserActive(id: number): Promise<User> {
    return apiPost<User>(`/admin/users/${id}/toggle-active`);
  },

  async deleteUser(id: number): Promise<void> {
    return apiDelete<void>(`/admin/users/${id}`);
  },

  // Reviews
  async getAllReviews(
    page = 0,
    size = 20,
    status?: string
  ): Promise<PagedResponse<Review>> {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    return apiGet<PagedResponse<Review>>("/admin/reviews", params);
  },

  async approveReview(id: number): Promise<Review> {
    return apiPost<Review>(`/admin/reviews/${id}/approve`);
  },

  async rejectReview(id: number): Promise<Review> {
    return apiPost<Review>(`/admin/reviews/${id}/reject`);
  },

  async deleteReview(id: number): Promise<void> {
    return apiDelete<void>(`/admin/reviews/${id}`);
  },

  // Keys
  async getKeys(
    page = 0,
    size = 50,
    status?: string,
    productId?: number,
    variantId?: number
  ): Promise<PagedResponse<AdminKey>> {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    if (productId) params.productId = productId;
    if (variantId) params.variantId = variantId;
    return apiGet<PagedResponse<AdminKey>>("/admin/keys", params);
  },

  async getKeyStock(): Promise<KeyStock[]> {
    return apiGet<KeyStock[]>("/admin/keys/stock-summary");
  },

  async addKey(data: {
    productId: number;
    variantId?: number;
    licenseKey: string;
    batchName?: string;
    notes?: string;
  }): Promise<AdminKey> {
    return apiPost<AdminKey>("/admin/keys", data);
  },

  async bulkUploadKeys(
    file: File,
    productId: number,
    variantId?: number,
    batchName?: string
  ): Promise<{ totalRows: number; inserted: number; skipped: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams();
    params.append("productId", productId.toString());
    if (variantId) params.append("variantId", variantId.toString());
    if (batchName) params.append("batchName", batchName);

    const res = await apiClient.post<ApiResponse<any>>(
      `/admin/keys/bulk-upload?${params}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  async revokeKey(id: number): Promise<AdminKey> {
    return apiPost<AdminKey>(`/admin/keys/${id}/revoke`);
  },

  async deleteKey(id: number): Promise<void> {
    return apiDelete<void>(`/admin/keys/${id}`);
  },
};