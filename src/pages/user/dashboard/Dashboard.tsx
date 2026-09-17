import { Link } from "react-router-dom";
import { Package, Key, Download, ArrowRight, Loader2, PackageX } from "lucide-react";
import { useMyOrders } from "../../../api/queries/useOrders";
import { useMyDownloads } from "../../../api/queries/useDownloads";
import { useAuthContext } from "../../../lib/AuthContext";

export default function UserDashboard() {
  const { user } = useAuthContext();
  const { data: orders = [], isLoading, isError } = useMyOrders();
  const { data: downloads = [] } = useMyDownloads();

  const successOrders = orders.filter((o) => o.status === "SUCCESS");
  const totalSpent = successOrders.reduce((sum, o) => sum + o.total, 0);
  const totalKeys = successOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.licenseKey).length,
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-navy rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-extrabold">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Here's your account summary
        </p>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">
          Failed to load your account data. Please refresh.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={18} />}
          label="Total Orders"
          value={orders.length}
          to="/user/orders"
        />
        <StatCard
          icon={<Key size={18} />}
          label="License Keys"
          value={totalKeys}
          to="/user/keys"
        />
        <StatCard
          icon={<Download size={18} />}
          label="Downloads"
          value={downloads.length}
          to="/user/downloads"
        />
        <StatCard
          icon="₹"
          label="Total Spent"
          value={`₹${totalSpent.toFixed(0)}`}
          to="/user/orders"
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy">Recent Orders</h2>
          <Link
            to="/user/orders"
            className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            <PackageX className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No orders yet.</p>
            <Link
              to="/products"
              className="text-brand hover:underline font-semibold"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                to={`/user/orders/${o.id}`}
                className="flex items-center justify-between border border-gray-100 rounded-lg p-3 hover:border-brand transition"
              >
                <div>
                  <div className="font-semibold text-navy text-sm">
                    {o.orderNumber}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-navy text-sm">
                    ₹{o.total.toFixed(2)}
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  to,
}: {
  icon: any;
  label: string;
  value: string | number;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-cardHover transition"
    >
      <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3 font-bold">
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-navy">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </Link>
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
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {status}
    </span>
  );
}