import { useEffect, useState } from "react";
import { Loader2, Save, User, Mail, Phone, AlertCircle } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { userService } from "../../../api/services/userService";
import { useUserProfile } from "../../../api/queries/useUser";
import { getErrorMessage } from "../../../lib/api-client";

export default function AccountDetails() {
  const { showToast, setUser } = useAuthContext();
  const { data: profile, isLoading, isError, refetch } = useUserProfile();

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
      showToast("Profile updated successfully");
    } catch (e) {
      showToast(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
        <p className="text-sm text-navy mb-3">Failed to load profile</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
        >
          Retry
        </button>
      </div>
    );
  }

  const initials = profile.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">
          Account Details
        </h1>
        <p className="text-muted mt-1 text-sm">
          Manage your personal information
        </p>
      </div>

      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="relative h-24 bg-gradient-to-br from-brand to-brand-dark">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="px-5 lg:px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
              <div className="h-24 w-24 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden shrink-0">
                <div className="h-full w-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-3xl font-bold">
                  {initials}
                </div>
              </div>
              <div className="pb-1">
                <h2 className="text-lg lg:text-xl font-bold text-navy">
                  {profile.name}
                </h2>
                <p className="text-xs text-muted">{profile.email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                  <User className="inline h-3 w-3 mr-1" /> Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                  <Mail className="inline h-3 w-3 mr-1" /> Email
                </label>
                <input
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-soft text-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                  <Phone className="inline h-3 w-3 mr-1" /> Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9911611207"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>

              <div className="pt-2">
                <Button onClick={save} loading={saving}>
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}