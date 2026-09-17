import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "../services/cartService";

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      productId: number;
      variantId?: number;
      quantity?: number;
    }) => cartService.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cartItemId,
      quantity,
    }: {
      cartItemId: number;
      quantity: number;
    }) => cartService.updateQuantity(cartItemId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: number) => cartService.removeItem(cartItemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}