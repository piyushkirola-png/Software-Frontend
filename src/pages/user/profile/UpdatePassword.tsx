import { useState } from "react";
import {
  Lock,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { userService } from "../../../api/services/userService";
import { getErrorMessage } from "../../../lib/api-client";

export default function UpdatePassword() {
  const { showToast } = useAuthContext();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!current || !newPass || !confirm) {
      setError("Please fill all fields");
      return;
    }
    if (newPass.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPass !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (newPass === current) {
      setError("New password must be different from current");
      return;
    }

    setSaving(true);
    try {
      await userService.changePassword({
        currentPassword: current,
        newPassword: newPass,
      });
      showToast("Password updated successfully");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      {/* ============ HEADER ============ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">
          Update Password
        </h1>
        <p className="text-muted mt-1 text-sm">
          Keep your account secure with a strong password
        </p>
      </div>

      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">
                Change Your Password
              </h2>
              <p className="text-[11px] text-muted">
                You'll stay logged in after updating
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              setShow={setShowCurrent}
              placeholder="Enter your current password"
            />
            <PasswordField
              label="New Password"
              value={newPass}
              onChange={setNewPass}
              show={showNew}
              setShow={setShowNew}
              placeholder="At least 6 characters"
            />
            <PasswordField
              label="Confirm New Password"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Re-enter new password"
            />

            {/* Info note */}
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted">
                Must be at least 6 characters. Avoid common words or reused
                passwords.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button type="submit" loading={saving} fullWidth>
              <Save size={16} /> Update Password
            </Button>
          </form>
        </div>
      </Reveal>
    </div>
  );
}

// ============ SUB COMPONENT ============
function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
