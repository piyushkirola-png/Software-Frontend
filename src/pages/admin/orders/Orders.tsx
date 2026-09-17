import { useState } from "react";
import { Search, Loader2, Mail, PackageX } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import { useAdminOrders } from "../../../api/queries/useAdmin";
import {
  useUpdateOrderStatus,
  useResendOrderEmail,
} from "../../../api/mutations/adminMutations";
import { Order } from "../../../types/order";
import { getErrorMessage } from "../../../lib/api-client";

export default function AdminOrders() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading } = useAdminOrders(
    page,
    20,
    status || undefined,
    search || undefined
  );

  const updateStatus = useUpdateOrderStatus();
  const resend = useResendOrderEmail();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const changeStatus = (id: number, newStatus: string) => {
    setConfirmState({
      open: true,
      title: `Mark order as ${newStatus}?`,
      message:
        newStatus === "SUCCESS"
          ? "Keys will be marked SOLD. This action is usually irreversible."
          : "Reserved keys will be released back to AVAILABLE.",
      danger: newStatus === "FAILED",
      action: async () => {
        try {
          await updateStatus.mutateAsync({ id, status: newStatus });
          notify.success(`Order marked ${newStatus}`);
          setSelected(null);
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const resendEmail = async (id: number) => {
    try {
      await resend.mutateAsync(id);
      notify.success("Email sent successfully");
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy">Orders</h1>
        <p className="text-sm text-muted mt-1">{data?.totalElements || 0} orders</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, email, name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft">
                <tr className="text-left text-xs text-muted uppercase">
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-soft">
                    <td className="px-4 py-3 font-mono font-bold text-xs text-navy">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-navy">
                        {o.customerName}
                      </div>
                      <div className="text-[11px] text-muted">{o.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{o.items.length}</td>
                    <td className="px-4 py-3 font-bold text-navy">
                      ₹{o.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {o.status === "SUCCESS" && (
                          <button
                            onClick={() => resendEmail(o.id)}
                            className="w-8 h-8 rounded hover:bg-brand/10 text-brand flex items-center justify-center"
                            title="Resend Email"
                          >
                            <Mail size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelected(o)}
                          className="text-xs text-brand font-semibold hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted px-3">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Order ${selected.orderNumber}` : ""}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted">Customer</div>
                <div className="font-semibold text-navy">
                  {selected.customerName}
                </div>
                <div className="text-xs text-muted">{selected.customerEmail}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Status</div>
                <Badge
                  color={
                    selected.status === "SUCCESS"
                      ? "green"
                      : selected.status === "FAILED"
                      ? "red"
                      : "yellow"
                  }
                >
                  {selected.status}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted">Subtotal</div>
                <div className="font-semibold">₹{selected.subtotal.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Total</div>
                <div className="font-bold text-navy text-lg">
                  ₹{selected.total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs font-bold text-navy uppercase mb-2">
                Items
              </div>
              {selected.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-navy line-clamp-1">
                      {item.productTitle}
                    </div>
                    {item.variantName && (
                      <div className="text-[11px] text-muted">
                        {item.variantName}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-navy">
                    ₹{item.lineTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {selected.status === "PENDING" && (
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-bold text-navy uppercase mb-2">
                  Manually update status
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => changeStatus(selected.id, "SUCCESS")}
                  >
                    Mark SUCCESS
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => changeStatus(selected.id, "FAILED")}
                  >
                    Mark FAILED
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
        onCancel={() => setConfirmState({ open: false, title: "", message: "" })}
        onConfirm={async () => {
          const action = confirmState.action;
          setConfirmState({ open: false, title: "", message: "" });
          await action?.();
        }}
      />
    </div>
  );
}