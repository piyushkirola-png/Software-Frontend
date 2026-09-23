import { useEffect, useState } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { useFeaturedReviews } from "../../api/queries/useReviews";
import Reveal from "../animations/Reveal";

export default function ReviewsCarousel() {
  const { data: reviews, isLoading } = useFeaturedReviews();
  const [start, setStart] = useState(0);
  const visible = 3;
  const MAX_REVIEWS = 8;

  // Take only the latest 8
  const list = (reviews || []).slice(0, MAX_REVIEWS);
  const maxStart = Math.max(0, list.length - visible);

  // Auto-slide every 3s, infinite
  useEffect(() => {
    if (list.length <= visible) return;
    const id = setInterval(() => {
      setStart((s) => (s >= maxStart ? 0 : s + 1));
    }, 3000);
    return () => clearInterval(id);
  }, [list.length, maxStart, visible]);

  const goPrev = () => {
    setStart((s) => (s <= 0 ? maxStart : s - 1));
  };

  const goNext = () => {
    setStart((s) => (s >= maxStart ? 0 : s + 1));
  };

  const renderStars = () =>
    [...Array(5)].map((_, i) => (
      <Star key={i} size={14} fill="#10B981" stroke="#10B981" />
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
    <section className="bg-soft pt-10 md:pt-12 pb-16 md:pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Star size={12} fill="currentColor" /> VERIFIED EXCELLENCE
              </div>
              <h2 className="text-3xl md:text-4xl text-navy">
                What Customers Say{" "}
                <span className="text-success font-extrabold">About Us.</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 bg-white rounded-full px-4 py-2">
              <CheckCircle size={16} className="text-success" />
              <span className="font-bold text-sm text-navy">Trustpilot</span>
              <div className="flex gap-0.5">{renderStars()}</div>
            </div>
          </div>
        </Reveal>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-success animate-spin" />
          </div>
        )}

        {!isLoading && list.length === 0 && (
          <div className="text-center py-16 text-muted">
            <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold">No reviews yet</p>
            <p className="text-sm mt-2">
              Be the first to review after your purchase!
            </p>
          </div>
        )}

        {!isLoading && list.length > 0 && (
          <>
            <Reveal delay={100}>
              <div className="flex items-center gap-4">
                {/* Left arrow */}
                <button
                  onClick={goPrev}
                  className="shrink-0 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-navy hover:border-success hover:text-success transition"
                  aria-label="Previous reviews"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Cards */}
                <div className="flex-1 grid md:grid-cols-3 gap-5">
                  {list.slice(start, start + visible).map((r, idx) => {
                    const isActive = idx === 0;
                    return (
                      <div
                        key={r.id}
                        className={`bg-white rounded-2xl p-6 transition-all ${
                          isActive
                            ? "border-2 border-success shadow-cardHover"
                            : "border border-gray-100"
                        }`}
                      >
                        <div className="flex gap-0.5 mb-4">{renderStars()}</div>
                        <h3 className="font-bold text-navy text-sm mb-2">
                          {r.title || "Great experience!"}
                        </h3>
                        <p className="text-sm text-muted leading-relaxed mb-6 min-h-[60px]">
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
                    );
                  })}
                </div>

                {/* Right arrow */}
                <button
                  onClick={goNext}
                  className="shrink-0 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-navy hover:border-success hover:text-success transition"
                  aria-label="Next reviews"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </Reveal>

            {/* Dots indicator */}
            {maxStart > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                {[...Array(maxStart + 1)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStart(i)}
                    aria-label={`Go to review set ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === start ? "w-6 bg-success" : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Badge */}
            <div className="flex justify-end mt-6">
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 text-success">
                  <CheckCircle size={16} />
                  <span className="text-xs font-bold text-navy">
                    100% Authentic Feedback
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-success">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold text-navy">
                    Secure &amp; Guaranteed
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
