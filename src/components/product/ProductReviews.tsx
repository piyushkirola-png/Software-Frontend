import { useState } from "react";
import { Star, Loader2, MessageSquare, CheckCircle } from "lucide-react";
import Reveal from "../animations/Reveal";
import { useProductReviews } from "../../api/queries/useReviews";

interface Props {
  productId: number;
}

export default function ProductReviews({ productId }: Props) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useProductReviews(productId, page, 10);

  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-navy">Customer Reviews</h3>
        <p className="text-xs text-muted mt-0.5">
          {totalElements} review{totalElements !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && reviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <MessageSquare className="h-8 w-8 text-ink-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-navy">No reviews yet</p>
          <p className="text-xs text-muted mt-1">
            Be the first to review after your purchase.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && reviews.length > 0 && (
        <Reveal>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-100 rounded-2xl p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-sm shrink-0">
                    {r.userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy text-sm">
                        {r.userName}
                      </span>
                      {r.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < r.rating ? "#10B981" : "transparent"}
                          stroke={i < r.rating ? "#10B981" : "#CBD5E1"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {r.title && (
                  <h4 className="font-bold text-navy text-sm mb-1">
                    {r.title}
                  </h4>
                )}
                {r.comment && (
                  <p className="text-sm text-muted leading-relaxed">
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 mt-4 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-navy font-semibold disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-xs font-bold text-navy">
                Page {page + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
                className="text-navy font-semibold disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </Reveal>
      )}
    </div>
  );
}