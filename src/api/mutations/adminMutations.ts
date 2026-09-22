import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminService,
  CategoryRequest,
  ProductRequest,
  CouponRequest,
} from "../services/adminService";

// Categories
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryRequest) => adminService.createCategory(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) =>
      adminService.updateCategory(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

// Products
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductRequest) => adminService.createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) =>
      adminService.updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.toggleProductActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

// Coupons
export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CouponRequest) => adminService.createCoupon(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CouponRequest }) =>
      adminService.updateCoupon(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}

export function useToggleCouponActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.toggleCouponActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}

// Orders
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
  });
}

export function useResendOrderEmail() {
  return useMutation({
    mutationFn: (id: number) => adminService.resendOrderEmail(id),
  });
}

// Users
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminService.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.toggleUserActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// Reviews
export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.approveReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.rejectReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

// Keys
export function useAddKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.addKey(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "keys"] });
      qc.invalidateQueries({ queryKey: ["admin", "key-stock"] });
    },
  });
}

export function useBulkUploadKeys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      productId,
      variantId,
      batchName,
    }: {
      file: File;
      productId: number;
      variantId?: number;
      batchName?: string;
    }) => adminService.bulkUploadKeys(file, productId, variantId, batchName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "keys"] });
      qc.invalidateQueries({ queryKey: ["admin", "key-stock"] });
    },
  });
}

export function useRevokeKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.revokeKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "keys"] }),
  });
}

export function useDeleteKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "keys"] }),
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (p: number) => void;
    }) => {
      const { uploadProductImage } = await import("../../lib/upload");
      return uploadProductImage(file, onProgress);
    },
  });
}
