import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { notify } from "../../../components/ui/toast";
import { userService } from "../../../api/services/userService";
import { useUserProfile } from "../../../api/queries/useUser";
import { useAuthContext } from "../../../lib/AuthContext";
import { getErrorMessage } from "../../../lib/api-client";

export default function AccountDetails() {
  const { data: profile, isLoading, refetch } = useUserProfile();
  const { setUser } = useAuthContext();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name, phone });
      setUser(updated);
      refetch();
      notify.success("Profile updated successfully");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
      <h1 className="text-2xl font-extrabold text-navy mb-6">
        Account Details
      </h1>

      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-bold">
          {profile?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="font-bold text-navy">{profile?.name}</div>
          <div className="text-sm text-muted">{profile?.email}</div>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email (read-only)"
          value={profile?.email || ""}
          disabled
          className="bg-gray-50"
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 9911611207"
        />
      </div>

      <div className="mt-6 max-w-md">
        <Button onClick={save} loading={saving}>
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </div>
  );
}