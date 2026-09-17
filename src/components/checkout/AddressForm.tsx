import { useState, FormEvent } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Address, AddressRequest } from "../../types/address";

interface Props {
  initial?: Address | null;
  onSubmit: (data: AddressRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function AddressForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<AddressRequest>({
    fullName: initial?.fullName || "",
    phone: initial?.phone || "",
    addressLine1: initial?.addressLine1 || "",
    addressLine2: initial?.addressLine2 || "",
    city: initial?.city || "",
    state: initial?.state || "",
    pincode: initial?.pincode || "",
    country: initial?.country || "India",
    isDefault: initial?.isDefault || false,
  });

  const [error, setError] = useState("");

  const update = (k: keyof AddressRequest, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) return setError("Full name is required");
    if (!form.phone.trim()) return setError("Phone is required");
    if (!form.addressLine1.trim()) return setError("Address is required");
    if (!form.city.trim()) return setError("City is required");
    if (!form.state.trim()) return setError("State is required");
    if (!form.pincode.trim()) return setError("Pincode is required");

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Full Name"
        value={form.fullName}
        onChange={(e) => update("fullName", e.target.value)}
        placeholder="John Doe"
      />
      <Input
        label="Phone"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        placeholder="+91 9911611207"
      />
      <Input
        label="Address Line 1"
        value={form.addressLine1}
        onChange={(e) => update("addressLine1", e.target.value)}
        placeholder="House / Flat / Building"
      />
      <Input
        label="Address Line 2 (optional)"
        value={form.addressLine2}
        onChange={(e) => update("addressLine2", e.target.value)}
        placeholder="Area / Landmark"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        />
        <Input
          label="State"
          value={form.state}
          onChange={(e) => update("state", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Pincode"
          value={form.pincode}
          onChange={(e) => update("pincode", e.target.value)}
        />
        <Input
          label="Country"
          value={form.country || "India"}
          onChange={(e) => update("country", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!form.isDefault}
          onChange={(e) => update("isDefault", e.target.checked)}
        />
        Set as default address
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} fullWidth>
          Save Address
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}