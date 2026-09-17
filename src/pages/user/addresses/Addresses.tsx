import { useEffect, useState } from "react";
import { Plus, MapPin, Pencil, Trash2, CheckCircle, Loader2 } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import AddressForm from "../../../components/checkout/AddressForm";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import { addressService } from "../../../api/services/addressService";
import { Address, AddressRequest } from "../../../types/address";
import { getErrorMessage } from "../../../lib/api-client";

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const load = async () => {
    setLoading(true);
    try {
      setAddresses(await addressService.getAll());
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (data: AddressRequest) => {
    setSaving(true);
    try {
      if (editing) {
        await addressService.update(editing.id, data);
        notify.success("Address updated");
      } else {
        await addressService.create(data);
        notify.success("Address added");
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: number) => {
    setConfirmState({
      open: true,
      title: "Delete address?",
      message: "This action cannot be undone.",
      danger: true,
      action: async () => {
        try {
          await addressService.delete(id);
          notify.success("Address deleted");
          await load();
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const setDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      notify.success("Default address updated");
      await load();
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-navy">My Addresses</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          <Plus size={14} /> Add Address
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      )}

      {!loading && addresses.length === 0 && (
        <div className="text-center py-12 text-muted">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No addresses yet</p>
          <p className="text-sm mt-1">Add your first address to continue</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`border rounded-lg p-4 ${
              a.isDefault ? "border-success bg-success/5" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-bold text-navy text-sm flex items-center gap-2">
                {a.fullName}
                {a.isDefault && (
                  <span className="text-[10px] bg-success text-white px-2 py-0.5 rounded font-semibold">
                    Default
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted mb-3">{a.phone}</div>
            <div className="text-xs text-muted leading-relaxed mb-4">
              {a.addressLine1}
              {a.addressLine2 ? `, ${a.addressLine2}` : ""},<br />
              {a.city}, {a.state} - {a.pincode}
              <br />
              {a.country}
            </div>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setEditing(a);
                  setShowForm(true);
                }}
                className="flex items-center gap-1 text-xs text-navy hover:text-brand font-semibold"
              >
                <Pencil size={12} /> Edit
              </button>
              {!a.isDefault && (
                <button
                  onClick={() => setDefault(a.id)}
                  className="flex items-center gap-1 text-xs text-navy hover:text-success font-semibold"
                >
                  <CheckCircle size={12} /> Set Default
                </button>
              )}
              <button
                onClick={() => remove(a.id)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold ml-auto"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Edit Address" : "Add New Address"}
      >
        <AddressForm
          initial={editing}
          onSubmit={save}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          loading={saving}
        />
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