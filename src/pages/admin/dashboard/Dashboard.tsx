import { Link } from "react-router-dom";
import {
  IndianRupee,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  Loader2,
  BarChart3,
  AlertCircle,
  Calendar,
  Tag,
  PieChart as PieIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import Reveal from "../../../components/animations/Reveal";
import {
  useDashboardStats,
  useSalesReport,
} from "../../../api/queries/useAdmin";
import { useAuthContext } from "../../../lib/AuthContext";
import userService from "../../../api/services/userService";

type StatusItem = {
  name: string;
  value: number;
  status: string;
};

type CategoryItem = {
  label: string;
  value: number;
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#10B981",
  PENDING: "#F59E0B",
  FAILED: "#EF4444",
};

const CATEGORY_COLORS = [
  "#1E6FD9",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

function fmtCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function fmtShortCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) {
    const k = n / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `₹${n}`;
}

function fmtStatusLabel(s: string) {
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function fmtDayLabel(dateStr: string) {
  try {
    const today = new Date();
    const parts = dateStr.split("-").map(Number);
    let d: Date;
    if (parts.length === 3) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else if (parts.length === 2) {
      d = new Date(today.getFullYear(), parts[0] - 1, parts[1]);
    } else {
      return dateStr;
    }
    return d.toLocaleDateString("en-US", { weekday: "short" });
  } catch {
    return dateStr;
  }
}

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();
  const { user } = useAuthContext();
  const avatarSrc = userService.absoluteAvatarUrl(user?.avatarUrl);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const { data: salesReport } = useSalesReport(thirtyDaysAgo, today);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
        <h2 className="text-base font-bold text-navy mb-1">
          Couldn't load dashboard stats
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

  const cards = [
    {
      label: "Total Revenue",
      value: fmtCurrency(stats.totalRevenue),
      hint: "Lifetime earnings",
      icon: <IndianRupee className="h-4 w-4 text-white" />,
      gradient: "from-success to-emerald-500",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString("en-IN"),
      hint: "All orders attempts",
      icon: <ShoppingBag className="h-4 w-4 text-white" />,
      gradient: "from-brand to-brand-light",
    },
    {
      label: "Users",
      value: stats.totalUsers.toLocaleString("en-IN"),
      hint: "Registered users",
      icon: <Users className="h-4 w-4 text-white" />,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      label: "Products",
      value: stats.totalProducts.toLocaleString("en-IN"),
      hint: "All products",
      icon: <Package className="h-4 w-4 text-white" />,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const fullTrend =
    salesReport?.dailyBreakdown?.map((d) => {
      const raw = d.date;
      return {
        date: raw,
        day: fmtDayLabel(raw),
        revenue: Number(d.revenue),
        orders: d.orders,
      };
    }) || [];

  const revenueTrend = fullTrend.length > 7 ? fullTrend.slice(-7) : fullTrend;
  const maxRev = Math.max(...revenueTrend.map((d) => d.revenue), 100);

  const statusData: StatusItem[] = [
    { name: "Success", value: stats.successOrders, status: "SUCCESS" },
    { name: "Pending", value: stats.pendingOrders, status: "PENDING" },
    { name: "Failed", value: stats.failedOrders, status: "FAILED" },
  ].filter((d: StatusItem) => d.value > 0);

  const categoryData: CategoryItem[] = (stats.revenueByCategory ?? []).map(
    (d) => ({
      label: d.categoryName || "Other",
      value: Number(d.revenue ?? 0),
    }),
  );

  const maxCategory = Math.max(...categoryData.map((d) => d.value), 100);

  const topProducts = (stats.topSellingProducts ?? []).map((p) => ({
    label: p.productTitle,
    value: Number(p.unitsSold ?? 0),
    revenue: Number(p.revenue ?? 0),
  }));

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-muted mt-1 text-sm">
            Here's an overview of your platform
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
            to="/admin/profile"
            className="h-10 w-10 rounded-full overflow-hidden border-2 border-brand/40 bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shrink-0 hover:border-brand transition-all"
            title="Your Profile"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || "Admin"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
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

      {/* ROW: Revenue Overview + Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Overview */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                Revenue Overview
              </h2>
              <p className="text-[11px] text-muted mt-0.5">Last 7 days</p>
            </div>

            <div style={{ width: "100%", height: 260 }}>
              {revenueTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <TrendingUp className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                    <p className="text-sm text-muted font-semibold">
                      No sales in the last 7 days
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      Revenue will appear once orders come in
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer>
                  <LineChart
                    data={revenueTrend}
                    margin={{ top: 10, right: 10, bottom: 24, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E9F2" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#6B7A90" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Day",
                        position: "insideBottom",
                        offset: -6,
                        style: { fontSize: 11, fill: "#6B7A90" },
                      }}
                    />
                    <YAxis
                      domain={[0, maxRev]}
                      tick={{ fontSize: 11, fill: "#6B7A90" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmtShortCurrency(v)}
                      label={{
                        value: "Revenue (₹)",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          fontSize: 11,
                          fill: "#6B7A90",
                          textAnchor: "middle",
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #E3E9F2",
                      }}
                      formatter={(value: any) => [
                        fmtCurrency(Number(value)),
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1E6FD9"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#1E6FD9" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Reveal>

        {/* Orders by Status */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-brand" />
                Orders by Status
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                All time distribution
              </p>
            </div>

            {statusData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-center">
                <div>
                  <ShoppingBag className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-muted font-semibold">
                    No orders yet
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    Orders will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {statusData.map((entry: StatusItem) => (
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
                      formatter={(value: any, _n: any, p: any) => [
                        value,
                        fmtStatusLabel(p?.payload?.status ?? ""),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* ROW: Revenue by Category + Top 5 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Product Category */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand" />
                Revenue by Product Categories
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                Which product users buy most
              </p>
            </div>

            {categoryData.length === 0 ||
              categoryData.every((d: CategoryItem) => d.value === 0) ? (
              <div className="h-[320px] flex items-center justify-center text-center">
                <div>
                  <BarChart3 className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-muted font-semibold">
                    No category sales yet
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    Revenue will appear once customers start buying
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={categoryData}
                    margin={{ top: 10, right: 10, bottom: 24, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E9F2" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#6B7A90" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Category",
                        position: "insideBottom",
                        offset: -6,
                        style: { fontSize: 11, fill: "#6B7A90" },
                      }}
                    />
                    <YAxis
                      domain={[0, maxCategory]}
                      tick={{ fontSize: 11, fill: "#6B7A90" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmtShortCurrency(v)}
                      label={{
                        value: "Revenue (₹)",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          fontSize: 11,
                          fill: "#6B7A90",
                          textAnchor: "middle",
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #E3E9F2",
                      }}
                      formatter={(value: any) => [
                        fmtCurrency(Number(value)),
                        "Revenue",
                      ]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
                      {categoryData.map((_: CategoryItem, idx: number) => (
                        <Cell
                          key={idx}
                          fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Reveal>

        {/* Top 5 Selling Products */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand" />
                Top 5 Selling Products
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                Best sellers by units sold
              </p>
            </div>

            {topProducts.length === 0 ||
              topProducts.every((p) => p.value === 0) ? (
              <div className="h-[320px] flex items-center justify-center text-center">
                <div>
                  <BarChart3 className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-muted font-semibold">
                    No products sold yet
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    Your best sellers will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 30, bottom: 24, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E9F2" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6B7A90" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Units Sold",
                        position: "insideBottom",
                        offset: -6,
                        style: { fontSize: 11, fill: "#6B7A90" },
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={({ x, y, payload }: any) => {
                        const label: string = payload.value || "";
                        const truncated =
                          label.length > 20
                            ? label.slice(0, 20) + "…"
                            : label;
                        return (
                          <text
                            x={x}
                            y={y}
                            dy={4}
                            textAnchor="end"
                            fill="#6B7A90"
                            fontSize={11}
                          >
                            {truncated}
                          </text>
                        );
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={150}
                      label={{
                        value: "Product",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          fontSize: 11,
                          fill: "#6B7A90",
                          textAnchor: "middle",
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #E3E9F2",
                      }}
                      formatter={(value: any, _n: any, p: any) => [
                        `${value} units • ${fmtCurrency(p?.payload?.revenue ?? 0)}`,
                        "Sold",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={28}
                    >
                      {topProducts.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}