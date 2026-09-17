import { useState } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useFeaturedReviews } from "../../api/queries/useReviews";

export default function ReviewsCarousel() {
  const { data: reviews, isLoading } = useFeaturedReviews();
  const [start, setStart] = useState(0);
  const visible = 3;

  const list = reviews || [];
  const maxStart = Math.max(0, list.length - visible);

  const renderStars = () =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        className="w-5 h-5 bg-success flex items-center justify-center rounded-sm"
      >
        <Star size={12} fill="white" stroke="white" />
      </span>
    ));

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Star size={12} fill="currentColor" /> VERIFIED EXCELLENCE
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
              What Customers Say <span className="text-success">About Us.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2">
            <CheckCircle size={16} className="text-success" />
            <span className="font-bold text-sm text-navy">Trustpilot</span>
            <div className="flex gap-0.5">{renderStars()}</div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-success animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && list.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-lg font-semibold">No reviews yet</p>
            <p className="text-sm mt-2">Be the first to review after your purchase!</p>
          </div>
        )}

        {/* Reviews */}
        {!isLoading && list.length > 0 && (
          <>
            <div className="grid md:grid-cols-3 gap-5">
              {list.slice(start, start + visible).map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex gap-0.5 mb-3">{renderStars()}</div>
                  <h3 className="font-bold text-navy text-sm mb-2">
                    {r.title || "Great experience!"}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-5 min-h-[60px]">
                    {r.comment || ""}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-sm">
                      {r.userInitials}
                    </div>
                    <div>
                      <div className="font-bold text-navy text-sm">
                        {r.userName}
                      </div>
                      <div className="text-[11px] text-success font-semibold flex items-center gap-1">
                        {r.isVerifiedPurchase && (
                          <>
                            <CheckCircle size={10} /> Verified Buyer •
                          </>
                        )}
                        <span className="text-muted">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {list.length > visible && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setStart(Math.max(0, start - 1))}
                  disabled={start === 0}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {[...Array(maxStart + 1)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStart(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === start ? "w-6 bg-success" : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setStart(Math.min(maxStart, start + 1))}
                  disabled={start === maxStart}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
              <button className="bg-success hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg text-sm inline-flex items-center gap-2">
                Read Verified Reviews →
              </button>
              <div className="flex items-center gap-5 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-success" /> 100% Authentic
                  Feedback
                </span>
                <span className="flex items-center gap-1.5">
                  🔒 Secure & Guaranteed
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}