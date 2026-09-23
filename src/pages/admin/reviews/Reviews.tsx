import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Star,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Check,
  X,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/animations/Reveal";
import { useAdminReviews } from "../../../api/queries/useAdmin";
import {
  useApproveReview,
  useRejectReview,
  useDeleteReview,
} from "../../../api/mutations/adminMutations";
import { getErrorMessage } from "../../../lib/api-client";
import type { Review } from "../../../types/review";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "pending" | "approved";
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";
type VerifiedFilter = "all" | "yes" | "no";

export default function AdminReviews() {
  const [page, setPage] = useState(0);

  // Applied filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>("all");

  // Draft filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState<StatusFilter>("all");
  const [draftRating, setDraftRating] = useState<RatingFilter>("all");
  const [draftVerified, setDraftVerified] = useState<VerifiedFilter>("all");

  const filterRef = useRef<HTMLDivElement>(null);

  const apiStatus =
    statusFilter === "pending"
      ? "pending"
      : statusFilter === "approved"
        ? "approved"
        : undefined;

  const { data, isLoading, refetch, isRefetching } = useAdminReviews(
    page,
    PAGE_SIZE,
    apiStatus,
  );

  const approve = useApproveReview();
  const reject = useRejectReview();
  const del = useDeleteReview();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    review: Review | null;
  }>({ open: false, review: null });

  const [viewing, setViewing] = useState<Review | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!filterOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setDraftSearch(search);
        setDraftStatus(statusFilter);
        setDraftRating(ratingFilter);
        setDraftVerified(verifiedFilter);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setDraftSearch(search);
        setDraftStatus(statusFilter);
        setDraftRating(ratingFilter);
        setDraftVerified(verifiedFilter);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [filterOpen, search, statusFilter, ratingFilter, verifiedFilter]);

  const rawReviews = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const reviews = useMemo(() => {
    return rawReviews.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          r.userName?.toLowerCase().includes(q) ||
          r.productTitle?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) {
        return false;
      }
      if (verifiedFilter === "yes" && !r.isVerifiedPurchase) return false;
      if (verifiedFilter === "no" && r.isVerifiedPurchase) return false;
      return true;
    });
  }, [rawReviews, search, ratingFilter, verifiedFilter]);

  const hasFilters =
    search !== "" ||
    statusFilter !== "all" ||
    ratingFilter !== "all" ||
    verifiedFilter !== "all";

  const rangeStart = reviews.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + reviews.length;

  // ============ FILTER HANDLERS ============
  const openFilter = () => {
    setDraftSearch(search);
    setDraftStatus(statusFilter);
    setDraftRating(ratingFilter);
    setDraftVerified(verifiedFilter);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setSearch(draftSearch);
    setStatusFilter(draftStatus);
    setRatingFilter(draftRating);
    setVerifiedFilter(draftVerified);
    setPage(0);
    setFilterOpen(false);
    setToast("Filter applied");
  };

  const clearFilter = () => {
    setDraftSearch("");
    setDraftStatus("all");
    setDraftRating("all");
    setDraftVerified("all");
    setSearch("");
    setStatusFilter("all");
    setRatingFilter("all");
    setVerifiedFilter("all");
    setPage(0);
    setFilterOpen(false);
    setToast("Filter cleared");
  };

  const handleRefresh = async () => {
    await refetch();
    setToast("Refreshed successfully");
  };

  // ============ ACTIONS ============
  const handleApprove = async (id: number) => {
    try {
      await approve.mutateAsync(id);
      setToast("Review approved");
      setEditing(null);
    } catch (e) {
      setToast(getErrorMessage(e));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await reject.mutateAsync(id);
      setToast("Review unapproved");
      setEditing(null);
    } catch (e) {
      setToast(getErrorMessage(e));
    }
  };

  const confirmDelete = (r: Review) => {
    setConfirmState({ open: true, review: r });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmState.review) return;
    try {
      await del.mutateAsync(confirmState.review.id);
      setToast("Review deleted");
      setConfirmState({ open: false, review: null });
      setViewing(null);
      setEditing(null);
    } catch (e) {
      setToast(getErrorMessage(e));
      setConfirmState({ open: false, review: null });
    }
  };

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Reviews</h1>
          <p className="text-muted mt-1 text-sm">
            Moderate customer reviews and ratings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => (filterOpen ? setFilterOpen(false) : openFilter())}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border text-sm font-semibold transition ${
                hasFilters
                  ? "border-brand/40 bg-brand/5 text-brand"
                  : "border-gray-200 text-navy hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasFilters && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-[520px] max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider">
                    Filters
                  </span>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 text-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      value={draftSearch}
                      onChange={(e) => setDraftSearch(e.target.value)}
                      placeholder="User, product, text..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Rating
                    </label>
                    <select
                      value={draftRating}
                      onChange={(e) =>
                        setDraftRating(e.target.value as RatingFilter)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="all">All</option>
                      <option value="5">5 ★</option>
                      <option value="4">4 ★</option>
                      <option value="3">3 ★</option>
                      <option value="2">2 ★</option>
                      <option value="1">1 ★</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={draftStatus}
                      onChange={(e) =>
                        setDraftStatus(e.target.value as StatusFilter)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                      Verified Purchase
                    </label>
                    <select
                      value={draftVerified}
                      onChange={(e) =>
                        setDraftVerified(e.target.value as VerifiedFilter)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    >
                      <option value="all">All</option>
                      <option value="yes">Verified only</option>
                      <option value="no">Unverified only</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={clearFilter}
                    className="flex-1 rounded-lg px-3 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyFilter}
                    className="flex-1 rounded-lg px-3 py-2 bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm font-semibold text-navy hover:bg-gray-50 disabled:opacity-60 transition"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ============ LOADING ============ */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!isLoading && reviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <Star className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            {hasFilters ? "No matching reviews" : "No reviews yet"}
          </h2>
          <p className="text-sm text-muted">
            {hasFilters
              ? "Try clearing filters."
              : "Customer reviews will appear here."}
          </p>
        </div>
      )}

      {/* ============ TABLE ============ */}
      {!isLoading && reviews.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px] shrink-0">
                            {r.userInitials || r.userName?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-navy truncate max-w-[120px]">
                            {r.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted truncate max-w-[180px]">
                        {r.productTitle || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              fill={i < r.rating ? "#10B981" : "transparent"}
                              stroke={i < r.rating ? "#10B981" : "#CBD5E1"}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-navy max-w-[280px]">
                        <div className="line-clamp-2">
                          {r.title && (
                            <span className="font-semibold">{r.title}: </span>
                          )}
                          {r.comment || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge color={r.isApproved ? "green" : "yellow"}>
                            {r.isApproved ? "Approved" : "Pending"}
                          </Badge>
                          {r.isVerifiedPurchase && (
                            <Badge color="blue">Verified</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setViewing(r)}
                            className="w-8 h-8 rounded-lg hover:bg-brand/10 text-brand flex items-center justify-center"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setEditing(r)}
                            className="w-8 h-8 rounded-lg hover:bg-yellow-50 text-yellow-600 flex items-center justify-center"
                            title="Edit Status"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(r)}
                            disabled={del.isPending}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* ============ PAGINATION ============ */}
      {!isLoading && reviews.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="text-xs text-muted">
            Showing{" "}
            <span className="font-semibold text-navy">{rangeStart}</span>
            {" – "}
            <span className="font-semibold text-navy">{rangeEnd}</span> of{" "}
            <span className="font-semibold text-navy">{totalElements}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-navy px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============ VIEW MODAL (read-only) ============ */}
      <Modal open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy">
                {viewing.title || "Review"}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {viewing.userName} ·{" "}
                {new Date(viewing.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < viewing.rating ? "#10B981" : "transparent"}
                    stroke={i < viewing.rating ? "#10B981" : "#CBD5E1"}
                  />
                ))}
              </div>
              <Badge color={viewing.isApproved ? "green" : "yellow"}>
                {viewing.isApproved ? "Approved" : "Pending"}
              </Badge>
              {viewing.isVerifiedPurchase && (
                <Badge color="blue">Verified</Badge>
              )}
            </div>

            <div className="text-xs text-muted">
              <span className="font-semibold text-navy">Product: </span>
              {viewing.productTitle || "—"}
            </div>

            {viewing.comment && (
              <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-3">
                {viewing.comment}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* ============ EDIT MODAL (status change only) ============ */}
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy">Review Status</h3>
              <p className="text-xs text-muted mt-0.5">by {editing.userName}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Current:</span>
              <Badge color={editing.isApproved ? "green" : "yellow"}>
                {editing.isApproved ? "Approved" : "Pending"}
              </Badge>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={approve.isPending || reject.isPending}
                className="w-full rounded-xl px-5 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              {editing.isApproved ? (
                <button
                  onClick={() => handleReject(editing.id)}
                  disabled={reject.isPending}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 bg-yellow-500 text-white text-sm font-bold hover:bg-yellow-600 disabled:opacity-60 transition"
                >
                  {reject.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X size={14} /> Unapprove
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleApprove(editing.id)}
                  disabled={approve.isPending}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 bg-success text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-60 transition"
                >
                  {approve.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check size={14} /> Approve
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ============ CONFIRM DIALOG (Astro style) ============ */}
      {createPortal(
        <AnimatePresence>
          {confirmState.open && confirmState.review && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setConfirmState({ open: false, review: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-sm font-bold text-navy mb-1">
                  Delete this review?
                </h3>
                <p className="text-xs text-muted mb-5">
                  This action cannot be undone.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() =>
                      setConfirmState({ open: false, review: null })
                    }
                    disabled={del.isPending}
                    className="flex-1 rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={del.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                  >
                    {del.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* ============ TOAST ============ */}
      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-white border border-success/20 shadow-xl rounded-lg px-3.5 py-2.5 max-w-xs"
            >
              <div className="p-1 rounded bg-success/10">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-xs font-medium text-navy">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
