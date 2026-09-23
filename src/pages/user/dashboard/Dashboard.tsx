import { Link } from "react-router-dom";
import {
  IndianRupee,
  Package,
  Key,
  Download,
  Loader2,
  PackageX,
  AlertCircle,
  Calendar,
  ArrowRight,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyOrders } from "../../../api/queries/useOrders";
import { useMyDownloads } from "../../../api/queries/useDownloads";
import { useAuthContext } from "../../../lib/AuthContext";
import userService from "../../../api/services/userService";

// ============ HELPERS ============
function fmtCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

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
        <p className="text-xs text-muted mb-4">Please try again in a moment.</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
        >
          Retry
        </button>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const avatarSrc = userService.absoluteAvatarUrl(user?.avatarUrl);

  // ============ KPI CARDS ============
  const cards = [
    {
      label: "Total Orders",
      value: orders.length.toLocaleString("en-IN"),
      hint: "All your purchases",
      icon: <ShoppingBag className="h-4 w-4 text-white" />,
      gradient: "from-brand to-brand-light",
    },
    {
      label: "License Keys",
      value: totalKeys.toLocaleString("en-IN"),
      hint: "Keys ready to activate",
      icon: <Key className="h-4 w-4 text-white" />,
      gradient: "from-success to-emerald-500",
    },
    {
      label: "Downloads",
      value: downloads.length.toLocaleString("en-IN"),
      hint: "Files you own",
      icon: <Download className="h-4 w-4 text-white" />,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      label: "Total Spent",
      value: fmtCurrency(totalSpent),
      hint: "Lifetime purchases",
      icon: <IndianRupee className="h-4 w-4 text-white" />,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted mt-1 text-sm">
            Here's an overview of your account
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-brand/30 bg-gradient-to-r from-brand/5 to-brand-light/10">
            <Calendar className="h-4 w-4 text-brand" />
            <span className="text-sm font-semibold text-brand">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* ===== Avatar (Astro-style) ===== */}
          <Link
            to="/user/profile"
            className="h-10 w-10 rounded-full overflow-hidden border-2 border-brand/40 bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shrink-0 hover:border-brand transition-all"
            title="Your Profile"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || "User"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.05}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-cardHover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                  {c.label}
                </span>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${c.gradient}`}
                >
                  {c.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-navy">{c.value}</div>
              <div className="text-xs text-muted mt-1">{c.hint}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ============ ROW: Recent Orders + Account Summary ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <Receipt className="h-4 w-4 text-brand" />
                Recent Orders
              </h2>
              <Link
                to="/user/orders"
                className="text-[11px] text-brand font-semibold hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="flex items-center justify-center text-center h-[280px]">
                <div>
                  <PackageX className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-muted font-semibold">
                    No orders yet
                  </p>
                  <Link
                    to="/products"
                    className="text-brand hover:underline font-semibold text-xs mt-2 inline-block"
                  >
                    Start shopping →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 6).map((o) => (
                  <Link
                    key={o.id}
                    to={`/user/orders/${o.id}`}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-3 hover:border-brand/30 hover:bg-soft transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-navy text-xs font-mono">
                        {o.orderNumber}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" • "}
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="font-bold text-navy text-xs">
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

        {/* Account Summary */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full">
            <h2 className="text-sm font-bold text-navy mb-4">
              Account Summary
            </h2>

            <div className="space-y-3 text-sm">
              <SummaryRow label="Total Orders" value={orders.length} />
              <SummaryRow
                label="Successful Orders"
                value={successOrders.length}
              />
              <SummaryRow label="License Keys" value={totalKeys} />
              <SummaryRow label="Downloads" value={downloads.length} />
              <SummaryRow label="Total Spent" value={fmtCurrency(totalSpent)} />
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <Link
                to="/user/profile"
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-brand border-2 border-brand hover:bg-brand hover:text-white rounded-xl py-2.5 transition-colors"
              >
                Account Settings
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// ============ SUB COMPONENTS ============
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
