import { Link } from "react-router-dom";
import {
  Package,
  Key,
  Download,
  ArrowRight,
  Loader2,
  PackageX,
  MapPin,
  User,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyOrders } from "../../../api/queries/useOrders";
import { useMyDownloads } from "../../../api/queries/useDownloads";
import { useAuthContext } from "../../../lib/AuthContext";

export default function UserDashboard() {
  const { user } = useAuthContext();
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();
  const { data: downloads = [] } = useMyDownloads();

  const successOrders = orders.filter((o) => o.status === "SUCCESS");
  const totalSpent = successOrders.reduce((sum, o) => sum + o.total, 0);
  const totalKeys = successOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.licenseKey).length,
    0,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
        <h2 className="text-base font-bold text-navy mb-1">
          Couldn't load your account
        </h2>
        <p className="text-xs text-muted mb-4">
          Please try again in a moment.
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
        >
          Retry
        </button>
      </div>
    );
  }

  const initials = user?.name?.[0]?.toUpperCase() || "U";
  const firstName = user?.name?.split(" ")[0] || "there";

  const stats = [
    {
      icon: <Package className="h-4 w-4 text-white" />,
      label: "Total Orders",
      value: orders.length,
      to: "/user/orders",
      gradient: "from-brand to-brand-light",
    },
    {
      icon: <Key className="h-4 w-4 text-white" />,
      label: "License Keys",
      value: totalKeys,
      to: "/user/keys",
      gradient: "from-success to-emerald-500",
    },
    {
      icon: <Download className="h-4 w-4 text-white" />,
      label: "Downloads",
      value: downloads.length,
      to: "/user/downloads",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-white" />,
      label: "Total Spent",
      value: `₹${totalSpent.toFixed(0)}`,
      to: "/user/orders",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const quickActions = [
    {
      icon: <ShoppingBag className="h-5 w-5 text-white" />,
      title: "Browse Products",
      desc: "Explore Windows, Office, Server, Antivirus",
      to: "/products",
      gradient: "from-brand to-brand-light",
    },
    {
      icon: <Key className="h-5 w-5 text-white" />,
      title: "My License Keys",
      desc: "View and copy your purchased keys",
      to: "/user/keys",
      gradient: "from-success to-emerald-500",
    },
    {
      icon: <MapPin className="h-5 w-5 text-white" />,
      title: "Manage Addresses",
      desc: "Add or edit your delivery addresses",
      to: "/user/addresses",
      gradient: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome header */}
      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center text-xl font-extrabold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy truncate">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm text-muted mt-1">
              Here's a quick look at your account
            </p>
          </div>
          <Link
            to="/user/profile"
            className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline"
          >
            <User size={14} /> Edit Profile
          </Link>
        </div>
      </Reveal>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <Link
              to={s.to}
              className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-cardHover hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${s.gradient}`}
              >
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-navy">{s.value}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Quick actions */}
      <Reveal>
        <div>
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((a) => (
              <Link
                key={a.title}
                to={a.to}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-brand/30 hover:shadow-cardHover transition-all flex items-start gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${a.gradient} group-hover:scale-110 transition-transform`}
                >
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-navy text-sm flex items-center gap-1">
                    {a.title}
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-brand"
                    />
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {a.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Split: recent orders + account summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-navy">Recent Orders</h2>
              <Link
                to="/user/orders"
                className="text-[11px] text-brand font-semibold hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-muted text-sm">
                <PackageX className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-semibold">No orders yet</p>
                <Link
                  to="/products"
                  className="text-brand hover:underline font-semibold mt-2 inline-block"
                >
                  Start shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    to={`/user/orders/${o.id}`}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-3 hover:border-brand/30 hover:bg-soft transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-navy text-sm">
                        {o.orderNumber}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" • "}
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
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
        </Reveal>

        {/* Account summary */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-navy mb-4">
              Account Summary
            </h2>

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-extrabold">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-navy text-sm truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-muted truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <SummaryRow label="Total Orders" value={orders.length} />
              <SummaryRow
                label="Successful Orders"
                value={successOrders.length}
              />
              <SummaryRow label="License Keys" value={totalKeys} />
              <SummaryRow label="Downloads" value={downloads.length} />
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <Link
                to="/user/profile"
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-brand border-2 border-brand hover:bg-brand hover:text-white rounded-xl py-2.5 transition-colors"
              >
                <Sparkles size={14} /> Account Settings
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-navy">{value}</span>
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
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}
    >
      {status}
    </span>
  );
}
