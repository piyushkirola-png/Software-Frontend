import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 30 * 1000,
  });
}

export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: ["admin", "recent-orders", limit],
    queryFn: () => adminService.getRecentOrders(limit),
  });
}

export function useSalesReport(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ["admin", "sales-report", fromDate, toDate],
    queryFn: () => adminService.getSalesReport(fromDate, toDate),
  });
}

export function useGstReport(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ["admin", "gst-report", fromDate, toDate],
    queryFn: () => adminService.getGstReport(fromDate, toDate),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminService.getAllCategories(),
  });
}

export function useAdminProducts(
  page = 0,
  size = 10,
  name?: string,
  categoryId?: number,
  status?: string,
  licenseType?: string,
  minPrice?: number,
  maxPrice?: number,
  sortBy?: string,
) {
  return useQuery({
    queryKey: [
      "admin",
      "products",
      page,
      size,
      name,
      categoryId,
      status,
      licenseType,
      minPrice,
      maxPrice,
      sortBy,
    ],
    queryFn: () =>
      adminService.getAllProducts(
        page,
        size,
        name,
        categoryId,
        status,
        licenseType,
        minPrice,
        maxPrice,
        sortBy,
      ),
  });
}

export function useAdminCoupons(page = 0, size = 20, status?: string) {
  return useQuery({
    queryKey: ["admin", "coupons", page, size, status],
    queryFn: () => adminService.getAllCoupons(page, size, status),
  });
}

export function useAdminOrders(
  page = 0,
  size = 20,
  status?: string,
  search?: string,
) {
  return useQuery({
    queryKey: ["admin", "orders", page, size, status, search],
    queryFn: () => adminService.getAllOrders(page, size, status, search),
  });
}

export function useAdminUsers(page = 0, size = 20, search?: string) {
  return useQuery({
    queryKey: ["admin", "users", page, size, search],
    queryFn: () => adminService.getAllUsers(page, size, search),
  });
}

export function useAdminReviews(page = 0, size = 10, status?: string) {
  return useQuery({
    queryKey: ["admin", "reviews", page, size, status],
    queryFn: () => adminService.getAllReviews(page, size, status),
  });
}

export function useAdminKeys(
  page = 0,
  size = 50,
  status?: string,
  productId?: number,
  variantId?: number,
  search?: string,
) {
  return useQuery({
    queryKey: [
      "admin",
      "keys",
      page,
      size,
      status,
      productId,
      variantId,
      search,
    ],
    queryFn: () =>
      adminService.getKeys(page, size, status, productId, variantId, search),
  });
}

export function useAdminKeyStock() {
  return useQuery({
    queryKey: ["admin", "key-stock"],
    queryFn: () => adminService.getKeyStock(),
  });
}

export function useAdminPayments(
  page = 0,
  size = 20,
  status?: string,
  gateway?: string,
  search?: string,
) {
  return useQuery({
    queryKey: ["admin", "payments", page, size, status, gateway, search],
    queryFn: () =>
      adminService.getAllPayments(page, size, status, gateway, search),
  });
}
