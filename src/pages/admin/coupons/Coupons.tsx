import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import { useAdminCoupons } from "../../../api/queries/useAdmin";
import {
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponActive,
} from "../../../api/mutations/adminMutations";
import { CouponRequest, Coupon } from "../../../api/services/adminService";
import { getErrorMessage } from "../../../lib/api-client";

const EMPTY: CouponRequest = {
  code: "",
  type: "PERCENT",
  value: 10,
  minOrderAmount: 0,
  perUserLimit: 1,
  isActive: true,
};

export default function AdminCoupons() {
  const { data, isLoading } = useAdminCoupons();
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const del = useDeleteCoupon();
  const toggle = useToggleCouponActive();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponRequest>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const coupons = data?.content || [];

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description,
      type: c.type as "PERCENT" | "FLAT",
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      perUserLimit: c.perUserLimit,
      startsAt: c.startsAt,
      expiresAt: c.expiresAt,
      isActive: c.isActive,
    });
    setError("");
    setModalOpen(true);
  };

  const save = async () => {
    setError("");
    if (!form.code.trim()) return setError("Code is required");
    if (!form.value || form.value <= 0) return setError("Value must be > 0");

    setSaving(true);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: form });
        notify.success("Coupon updated");
      } else {
        await create.mutateAsync(form);
        notify.success("Coupon created");
      }
      setModalOpen(false);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => {
    setConfirmState({
      open: true,
      title: "Delete coupon?",
      message: "This action cannot be undone.",
      danger: true,
      action: async () => {
        try {
          await del.mutateAsync(id);
          notify.success("Coupon deleted");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const handleToggle = async (id: number) => {
    try {
      await toggle.mutateAsync(id);
      notify.success("Coupon status updated");
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const update_ = (k: keyof CouponRequest, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy">Coupons</h1>
          <p className="text-sm text-muted mt-1">{data?.totalElements || 0} coupons</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Coupon
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No coupons yet</p>
            <p className="text-sm mt-1">Create your first coupon code</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft">
                <tr className="text-left text-xs text-muted uppercase">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Min Order</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-soft">
                    <td className="px-4 py-3 font-mono font-bold text-navy text-xs">
                      {c.code}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="blue">{c.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-navy">
                      {c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      ₹{c.minOrderAmount || 0}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {c.usedCount}/{c.usageLimit || "∞"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(c.id)}>
                        <Badge color={c.isActive ? "green" : "gray"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 rounded hover:bg-brand/10 text-brand flex items-center justify-center"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(c.id)}
                          className="w-8 h-8 rounded hover:bg-red-50 text-red-500 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Coupon" : "Add Coupon"}
      >
        <div className="space-y-4">
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => update_("code", e.target.value.toUpperCase())}
            placeholder="SAVE10"
          />
          <Input
            label="Description"
            value={form.description || ""}
            onChange={(e) => update_("description", e.target.value)}
            placeholder="10% off on all products"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => update_("type", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
              >
                <option value="PERCENT">Percent (%)</option>
                <option value="FLAT">Flat (₹)</option>
              </select>
            </div>
            <Input
              label="Value"
              type="number"
              value={form.value}
              onChange={(e) => update_("value", Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Order (₹)"
              type="number"
              value={form.minOrderAmount ?? 0}
              onChange={(e) => update_("minOrderAmount", Number(e.target.value))}
            />
            <Input
              label="Max Discount (₹)"
              type="number"
              value={form.maxDiscount ?? ""}
              onChange={(e) =>
                update_("maxDiscount", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Usage Limit"
              type="number"
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                update_("usageLimit", e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <Input
              label="Per User Limit"
              type="number"
              value={form.perUserLimit ?? 1}
              onChange={(e) => update_("perUserLimit", Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => update_("isActive", e.target.checked)}
            />
            Active
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button onClick={save} loading={saving} fullWidth>
              {editing ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
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