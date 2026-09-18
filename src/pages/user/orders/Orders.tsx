import { Link } from "react-router-dom";
import { PackageX, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyOrders } from "../../../api/queries/useOrders";

export default function UserOrders() {
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">My Orders</h1>
        <p className="text-muted mt-1 text-sm">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">Failed to load orders</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <PackageX className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No orders yet
          </h2>
          <p className="text-sm text-muted mb-4">
            Your purchases will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
          >
            Browse Products <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  to={`/user/orders/${o.id}`}
                  className="block p-5 hover:bg-soft transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-navy text-sm font-mono">
                          {o.orderNumber}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {new Date(o.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" • "}
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="font-bold text-navy">
                          ₹{o.total.toFixed(2)}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "SUCCESS"
      ? "bg-success/10 text-success"
      : status === "FAILED"
        ? "bg-red-100 text-red-600"
        : "bg-yellow-100 text-yellow-700";
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${cls}`}
    >
      {status}
    </span>
  );
}