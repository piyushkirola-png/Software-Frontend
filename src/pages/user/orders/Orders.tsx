import { Link } from "react-router-dom";
import { PackageX, Loader2, ChevronRight } from "lucide-react";
import { useMyOrders } from "../../../api/queries/useOrders";

export default function UserOrders() {
  const { data: orders = [], isLoading } = useMyOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
      <h1 className="text-2xl font-extrabold text-navy mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No orders yet</p>
          <Link
            to="/products"
            className="text-brand text-sm mt-2 inline-block hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/user/orders/${o.id}`}
              className="block border border-gray-100 rounded-lg p-4 hover:border-brand transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-navy text-sm">
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
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-navy">
                    ₹{o.total.toFixed(2)}
                  </div>
                  <ChevronRight size={16} className="text-muted ml-auto mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
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
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {status}
    </span>
  );
}