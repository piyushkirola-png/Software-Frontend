import { Star, CheckCircle, Loader2 } from "lucide-react";
import { useProductReviews } from "../../api/queries/useReviews";
import { useAuthContext } from "../../lib/AuthContext";

interface Props {
  productId: number;
}

export default function ProductReviews({ productId }: Props) {
  const { data, isLoading } = useProductReviews(productId, 0, 20);
  const { isAuthenticated } = useAuthContext();
  const reviews = data?.content || [];

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? "#10B981" : "transparent"}
        stroke={i < rating ? "#10B981" : "#CBD5E1"}
      />
    ));

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-navy">Customer Reviews</h2>
        {isAuthenticated && (
          <span className="text-xs text-muted">
            Only verified buyers can review
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <p className="text-muted text-sm py-6 text-center">
          No reviews yet. Be the first to review after your purchase.
        </p>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="pb-5 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-sm">
                    {r.userInitials}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">{r.userName}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex gap-0.5">{renderStars(r.rating)}</div>
                      {r.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-success font-semibold">
                          <CheckCircle size={11} /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted shrink-0">
                  {formatDate(r.createdAt)}
                </span>
              </div>
              {r.title && (
                <h4 className="font-bold text-navy text-sm mt-3">{r.title}</h4>
              )}
              {r.comment && (
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}