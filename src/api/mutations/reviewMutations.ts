import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "../../lib/api-client";

interface ReviewRequest {
  productId: number;
  rating: number;
  title: string;
  comment?: string;
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewRequest) => apiPost("/reviews", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
