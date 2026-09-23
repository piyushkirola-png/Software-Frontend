import { Link } from "react-router-dom";
import { PackageX, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyOrders } from "../../../api/queries/useOrders";

export default function UserOrders() {
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">My Orders</h1>
        <p className="text-muted mt-1 text-sm">
          {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* ============ LOADING ============ */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ============ ERROR ============ */}
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

      {/* ============ EMPTY ============ */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <PackageX className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">No orders yet</h2>
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

      {/* ============ TABLE ============ */}
      {!isLoading && !isError && orders.length > 0 && (
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="bg-soft text-left text-[11px] uppercase tracking-wider text-muted font-semibold">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-gray-100 hover:bg-soft/50 transition"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-xs text-navy whitespace-nowrap">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 font-bold text-navy whitespace-nowrap">
                        ₹{o.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to={`/user/orders/${o.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-navy hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition"
                          title="View Order"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
