import { Link } from "react-router-dom";
import {
  DollarSign,
  Package,
  Users,
  Key,
  ShoppingBag,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import { useDashboardStats, useRecentOrders } from "../../../api/queries/useAdmin";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: recent } = useRecentOrders(8);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(0)}`,
      sub: `Today: ₹${stats.todayRevenue.toFixed(0)}`,
      icon: <DollarSign size={20} />,
      color: "text-success bg-success/10",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: `Today: ${stats.todayOrders}`,
      icon: <ShoppingBag size={20} />,
      color: "text-brand bg-brand/10",
    },
    {
      label: "Users",
      value: stats.totalUsers,
      sub: `New today: ${stats.todayNewUsers}`,
      icon: <Users size={20} />,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Products",
      value: stats.totalProducts,
      sub: `Active: ${stats.activeProducts}`,
      icon: <Package size={20} />,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  const keyStats = [
    { label: "Available", value: stats.availableKeys, color: "text-success" },
    { label: "Reserved", value: stats.reservedKeys, color: "text-yellow-600" },
    { label: "Sold", value: stats.soldKeys, color: "text-brand" },
    { label: "Revoked", value: stats.revokedKeys, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">
          Overview of your business
        </p>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}
            >
              {c.icon}
            </div>
            <div className="text-2xl font-extrabold text-navy">{c.value}</div>
            <div className="text-xs text-muted mt-0.5">{c.label}</div>
            <div className="text-[11px] text-muted mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Order status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Orders by Status
          </h2>
          <div className="space-y-3">
            <StatRow label="Success" value={stats.successOrders} color="text-success" />
            <StatRow label="Pending" value={stats.pendingOrders} color="text-yellow-600" />
            <StatRow label="Failed" value={stats.failedOrders} color="text-red-500" />
          </div>
        </div>

        {/* Keys */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
            <Key size={16} /> License Key Stock
          </h2>
          <div className="space-y-3">
            {keyStats.map((k) => (
              <StatRow key={k.label} label={k.label} value={k.value} color={k.color} />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
            <Star size={16} /> Reviews
          </h2>
          <div className="space-y-3">
            <StatRow label="Total" value={stats.totalReviews} color="text-navy" />
            <StatRow label="Pending Approval" value={stats.pendingReviews} color="text-yellow-600" />
          </div>
          {stats.pendingReviews > 0 && (
            <Link
              to="/admin/reviews?status=pending"
              className="block mt-4 text-xs text-brand font-semibold hover:underline"
            >
              Review now →
            </Link>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs text-brand font-semibold hover:underline"
          >
            View All →
          </Link>
        </div>

        {!recent || recent.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted uppercase border-b border-gray-100">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-soft">
                    <td className="py-3 font-semibold text-navy text-xs">
                      {o.orderNumber}
                    </td>
                    <td className="py-3">
                      <div className="text-xs font-semibold text-navy">
                        {o.customerName}
                      </div>
                      <div className="text-[11px] text-muted">
                        {o.customerEmail}
                      </div>
                    </td>
                    <td className="py-3 font-bold text-navy">
                      ₹{o.total.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <Badge
                        color={
                          o.status === "SUCCESS"
                            ? "green"
                            : o.status === "FAILED"
                            ? "red"
                            : "yellow"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}