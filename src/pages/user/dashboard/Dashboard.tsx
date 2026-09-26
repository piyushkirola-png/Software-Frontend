import { Link } from "react-router-dom";
import {
  IndianRupee,
  Key,
  Download,
  Loader2,
  PackageX,
  AlertCircle,
  Calendar,
  ArrowRight,
  ShoppingBag,
  Receipt,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Reveal from "../../../components/animations/Reveal";
import { useMyOrders } from "../../../api/queries/useOrders";
import { useAuthContext } from "../../../lib/AuthContext";
import userService from "../../../api/services/userService";

function fmtCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function fmtShortCurrency(n: number) {
  if (n >= 1000) {
    const k = n / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `₹${n}`;
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#10B981",
  PENDING: "#F59E0B",
  FAILED: "#EF4444",
};

export default function UserDashboard() {
  const { user } = useAuthContext();
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();

  const successOrders = orders.filter((o) => o.status === "SUCCESS");
  const totalSpent = successOrders.reduce((sum, o) => sum + o.total, 0);
  const totalKeys = successOrders.reduce(
    (sum, o) =>
      sum +
      o.items.reduce((c, i) => {
        if (i.licenseKeys && i.licenseKeys.length > 0)
          return c + i.licenseKeys.length;
        return c + (i.licenseKey ? 1 : 0);
      }, 0),
    0,
  );
  const totalDownloads = successOrders.reduce(
    (sum, o) => sum + o.items.length,
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

  // KPI CARDS
  const cards = [
    {
      label: "Total Spent",
      value: fmtCurrency(totalSpent),
      hint: "Lifetime purchases",
      icon: <IndianRupee className="h-4 w-4 text-white" />,
      gradient: "from-orange-500 to-amber-500",
    },
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
      value: totalDownloads.toLocaleString("en-IN"),
      hint: "Files you own",
      icon: <Download className="h-4 w-4 text-white" />,
      gradient: "from-purple-500 to-indigo-500",
    },
  ];

  // ORDER STATUS PIE
  const statusData = [
    {
      name: "Success",
      value: orders.filter((o) => o.status === "SUCCESS").length,
      status: "SUCCESS",
    },
    {
      name: "Pending",
      value: orders.filter((o) => o.status === "PENDING").length,
      status: "PENDING",
    },
    {
      name: "Failed",
      value: orders.filter((o) => o.status === "FAILED").length,
      status: "FAILED",
    },
  ].filter((d) => d.value > 0);

  // SPENDING TREND (last 6 months)
  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    monthMap.set(key, 0);
  }
  successOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) || 0) + o.total);
    }
  });
  const spendingTrend = Array.from(monthMap.entries()).map(
    ([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(0)),
    }),
  );
  const maxSpend = Math.max(...spendingTrend.map((d) => d.amount), 100);

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

      {/* ============ ROW 2: Recent Orders (60%) + Account Summary (40%) ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Reveal className="lg:col-span-3">
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
                {orders.slice(0, 5).map((o) => (
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

        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full">
            <h2 className="text-base font-bold text-navy mb-5">
              Account Summary
            </h2>

            <div className="space-y-4 text-base">
              <SummaryRow label="Total Orders" value={orders.length} />
              <SummaryRow
                label="Successful Orders"
                value={successOrders.length}
              />
              <SummaryRow label="License Keys" value={totalKeys} />
              <SummaryRow label="Downloads" value={totalDownloads} />
              <SummaryRow label="Total Spent" value={fmtCurrency(totalSpent)} />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                to="/user/profile"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-brand border-2 border-brand hover:bg-brand hover:text-white rounded-xl py-3 transition-colors"
              >
                Account Settings
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ============ ROW 3: Spending Trend (60%) + Pie (40%) ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Reveal className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                Spending Trend
              </h2>
              <p className="text-[11px] text-muted mt-0.5">Last 6 months</p>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart
                  data={spendingTrend}
                  margin={{ top: 20, right: 10, bottom: 10, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E9F2" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#6B7A90" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, maxSpend]}
                    tick={{ fontSize: 11, fill: "#6B7A90" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtShortCurrency(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #E3E9F2",
                    }}
                    formatter={(value: any) => [
                      fmtCurrency(Number(value)),
                      "Spent",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#1E6FD9"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                    label={{
                      position: "top",
                      formatter: (v: any) => fmtShortCurrency(Number(v)),
                      style: { fontSize: 11, fill: "#0B1F3A", fontWeight: 600 },
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-brand" />
                Order Status
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                Distribution of your orders
              </p>
            </div>

            {statusData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-center">
                <div>
                  <ShoppingBag className="h-8 w-8 text-ink-300 mx-auto mb-2" />
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
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #E3E9F2",
                      }}
                      formatter={(value: any, name: any) => [value, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      layout="horizontal"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
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
      <span className="font-bold text-navy text-base">{value}</span>
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