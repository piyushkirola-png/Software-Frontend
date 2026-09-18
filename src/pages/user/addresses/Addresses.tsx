import { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import AddressForm from "../../../components/checkout/AddressForm";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { addressService } from "../../../api/services/addressService";
import { Address, AddressRequest } from "../../../types/address";
import { getErrorMessage } from "../../../lib/api-client";

export default function Addresses() {
  const { showToast } = useAuthContext();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
    setError(false);
    try {
      setAddresses(await addressService.getAll());
    } catch (e) {
      setError(true);
      showToast(getErrorMessage(e));
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
        showToast("Address updated");
      } else {
        await addressService.create(data);
        showToast("Address added");
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e) {
      showToast(getErrorMessage(e));
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
          showToast("Address deleted");
          await load();
        } catch (e) {
          showToast(getErrorMessage(e));
        }
      },
    });
  };

  const setDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      showToast("Default address updated");
      await load();
    } catch (e) {
      showToast(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            My Addresses
          </h1>
          <p className="text-muted mt-1 text-sm">
            {addresses.length} address{addresses.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">Failed to load addresses</p>
          <button
            onClick={load}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && addresses.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No addresses yet
          </h2>
          <p className="text-sm text-muted">
            Add your first address to continue.
          </p>
        </div>
      )}

      {!loading && addresses.length > 0 && (
        <Reveal>
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`bg-white border-2 rounded-2xl p-4 transition ${
                  a.isDefault
                    ? "border-success/40 bg-success/5"
                    : "border-gray-100 hover:border-brand/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-navy text-sm flex items-center gap-2 flex-wrap">
                    {a.fullName}
                    {a.isDefault && (
                      <span className="text-[10px] bg-success text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
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
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditing(a);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1 text-xs text-navy hover:text-brand font-semibold transition"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  {!a.isDefault && (
                    <button
                      onClick={() => setDefault(a.id)}
                      className="flex items-center gap-1 text-xs text-navy hover:text-success font-semibold transition"
                    >
                      <CheckCircle size={12} /> Set Default
                    </button>
                  )}
                  <button
                    onClick={() => remove(a.id)}
                    className="flex items-center gap-1 text-xs text-danger hover:text-red-700 font-semibold ml-auto transition"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Edit Address" : "Add New Address"}
        maxWidth="max-w-lg"
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
        onCancel={() =>
          setConfirmState({ open: false, title: "", message: "" })
        }
        onConfirm={async () => {
          const action = confirmState.action;
          setConfirmState({ open: false, title: "", message: "" });
          await action?.();
        }}
      />
    </div>
  );
}