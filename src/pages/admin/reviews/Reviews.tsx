import { useState } from "react";
import { Check, X, Trash2, Loader2, Star } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import { useAdminReviews } from "../../../api/queries/useAdmin";
import {
  useApproveReview,
  useRejectReview,
  useDeleteReview,
} from "../../../api/mutations/adminMutations";
import { getErrorMessage } from "../../../lib/api-client";

export default function AdminReviews() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("pending");

  const { data, isLoading } = useAdminReviews(page, 20, status || undefined);
  const approve = useApproveReview();
  const reject = useRejectReview();
  const del = useDeleteReview();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const handleApprove = async (id: number) => {
    try {
      await approve.mutateAsync(id);
      notify.success("Review approved");
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await reject.mutateAsync(id);
      notify.success("Review unapproved");
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const handleDelete = (id: number) => {
    setConfirmState({
      open: true,
      title: "Delete review?",
      message: "This action cannot be undone.",
      danger: true,
      action: async () => {
        try {
          await del.mutateAsync(id);
          notify.success("Review deleted");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
          Reviews Moderation
        </h1>
        <p className="text-sm text-muted mt-1">
          {data?.totalElements || 0} reviews
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-2">
        {[
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "all", label: "All" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setStatus(t.key);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              status === t.key
                ? "bg-brand text-white"
                : "text-navy hover:bg-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl border border-gray-100">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-muted bg-white rounded-xl border border-gray-100">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No reviews in this tab</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                    {r.userInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-navy text-sm">
                      {r.userName}
                    </div>
                    <div className="text-xs text-muted">
                      {r.productTitle}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < r.rating ? "#10B981" : "transparent"}
                            stroke={i < r.rating ? "#10B981" : "#CBD5E1"}
                          />
                        ))}
                      </div>
                      {r.isVerifiedPurchase && (
                        <Badge color="green">Verified</Badge>
                      )}
                      <Badge color={r.isApproved ? "green" : "yellow"}>
                        {r.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted shrink-0">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {r.title && (
                <div className="font-bold text-navy text-sm mb-1">{r.title}</div>
              )}
              {r.comment && (
                <p className="text-sm text-muted leading-relaxed mb-3">
                  {r.comment}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {!r.isApproved && (
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={approve.isPending}
                    className="flex items-center gap-1.5 text-xs bg-success text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                {r.isApproved && (
                  <button
                    onClick={() => handleReject(r.id)}
                    disabled={reject.isPending}
                    className="flex items-center gap-1.5 text-xs bg-yellow-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                  >
                    <X size={14} /> Unapprove
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={del.isPending}
                  className="flex items-center gap-1.5 text-xs text-red-500 font-bold px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
        onCancel={() => setConfirmState({ open: false, title: "", message: "" })}
        onConfirm={async () => {
          const action = confirmState.action;
          setConfirmState({ open: false, title: "", message: "" });
          await action?.();
        }}
      />
    </div>
  );
}