import { useState } from "react";
import { TrendingUp, FileText, Loader2, Download } from "lucide-react";
import { useSalesReport, useGstReport } from "../../../api/queries/useAdmin";

export default function AdminReports() {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [tab, setTab] = useState<"sales" | "gst">("sales");

  const { data: sales, isLoading: salesLoading } = useSalesReport(fromDate, toDate);
  const { data: gst, isLoading: gstLoading } = useGstReport(fromDate, toDate);

  const exportCsv = () => {
    if (tab === "sales" && sales) {
      const rows = [
        ["Date", "Orders", "Revenue"],
        ...sales.dailyBreakdown.map((d) => [
          d.date,
          d.orders.toString(),
          d.revenue.toFixed(2),
        ]),
      ];
      downloadCsv(rows, `sales-${fromDate}-to-${toDate}.csv`);
    } else if (tab === "gst" && gst) {
      const rows = [
        ["Invoice #", "Date", "Buyer", "State", "Taxable", "CGST", "SGST", "IGST", "Total"],
        // Add invoice lines if available
      ];
      downloadCsv(rows, `gst-${fromDate}-to-${toDate}.csv`);
    }
  };

  const downloadCsv = (rows: string[][], filename: string) => {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy">Reports</h1>
        <p className="text-sm text-muted mt-1">Sales and GST reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-navy uppercase">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-navy uppercase">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={exportCsv}
          className="ml-auto flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-2 flex gap-2">
        <button
          onClick={() => setTab("sales")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "sales" ? "bg-brand text-white" : "text-navy hover:bg-soft"
          }`}
        >
          <TrendingUp size={14} /> Sales Report
        </button>
        <button
          onClick={() => setTab("gst")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "gst" ? "bg-brand text-white" : "text-navy hover:bg-soft"
          }`}
        >
          <FileText size={14} /> GST Report
        </button>
      </div>

      {/* Sales report */}
      {tab === "sales" && (
        <>
          {salesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : sales ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Orders" value={sales.totalOrders} />
                <StatCard
                  label="Revenue"
                  value={`₹${sales.totalRevenue.toFixed(0)}`}
                  color="text-success"
                />
                <StatCard
                  label="Discount"
                  value={`₹${sales.totalDiscount.toFixed(0)}`}
                  color="text-brand"
                />
                <StatCard
                  label="Tax"
                  value={`₹${sales.totalTax.toFixed(0)}`}
                  color="text-orange-600"
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h2 className="font-bold text-navy text-sm">Daily Breakdown</h2>
                </div>
                {sales.dailyBreakdown.length === 0 ? (
                  <div className="text-center py-10 text-muted text-sm">
                    No sales in this range
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-soft">
                        <tr className="text-left text-xs text-muted uppercase">
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-right">Orders</th>
                          <th className="px-4 py-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.dailyBreakdown.map((d) => (
                          <tr
                            key={d.date}
                            className="border-t border-gray-100 hover:bg-soft"
                          >
                            <td className="px-4 py-3 text-navy font-semibold text-xs">
                              {new Date(d.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-xs">
                              {d.orders}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-navy">
                              ₹{d.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* GST report */}
      {tab === "gst" && (
        <>
          {gstLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : gst ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Invoices" value={gst.totalInvoices} />
                <StatCard
                  label="Taxable Value"
                  value={`₹${gst.totalTaxableValue.toFixed(0)}`}
                />
                <StatCard
                  label="Total Tax"
                  value={`₹${gst.totalTax.toFixed(0)}`}
                  color="text-orange-600"
                />
                <StatCard
                  label="Invoice Value"
                  value={`₹${gst.totalInvoiceValue.toFixed(0)}`}
                  color="text-success"
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-bold text-navy text-sm mb-4">Tax Breakdown</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-soft rounded-lg">
                    <div className="text-xs text-muted mb-1">CGST</div>
                    <div className="font-bold text-navy text-lg">
                      ₹{gst.totalCgst.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-soft rounded-lg">
                    <div className="text-xs text-muted mb-1">SGST</div>
                    <div className="font-bold text-navy text-lg">
                      ₹{gst.totalSgst.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-soft rounded-lg">
                    <div className="text-xs text-muted mb-1">IGST</div>
                    <div className="font-bold text-navy text-lg">
                      ₹{gst.totalIgst.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="text-xs text-muted uppercase">{label}</div>
      <div className={`text-2xl font-extrabold mt-1 ${color || "text-navy"}`}>
        {value}
      </div>
    </div>
  );
}