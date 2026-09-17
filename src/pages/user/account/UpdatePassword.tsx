import { useState } from "react";
import { Save, Lock } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { notify } from "../../../components/ui/toast";
import { userService } from "../../../api/services/userService";
import { getErrorMessage } from "../../../lib/api-client";

export default function UpdatePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!current || !newPass) return notify.error("All fields are required");
    if (newPass.length < 6)
      return notify.error("New password must be at least 6 characters");
    if (newPass !== confirm) return notify.error("Passwords do not match");

    setSaving(true);
    try {
      await userService.changePassword({
        currentPassword: current,
        newPassword: newPass,
      });
      notify.success("Password updated successfully");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
      <h1 className="text-2xl font-extrabold text-navy mb-6 flex items-center gap-2">
        <Lock size={20} /> Update Password
      </h1>

      <div className="space-y-4 max-w-md">
        <Input
          label="Current Password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Input
          label="New Password"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <div className="mt-6 max-w-md">
        <Button onClick={submit} loading={saving}>
          <Save size={16} /> Update Password
        </Button>
      </div>
    </div>
  );
}