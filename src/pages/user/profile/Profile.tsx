import { Loader2 } from "lucide-react";
import { useUserProfile } from "../../../api/queries/useUser";

export default function Profile() {
  const { data: profile, isLoading } = useUserProfile();

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h1 className="text-2xl font-extrabold text-navy mb-6">Profile</h1>
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-xs text-muted">Name</div>
          <div className="font-semibold text-navy">{profile.name}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Email</div>
          <div className="font-semibold text-navy">{profile.email}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Phone</div>
          <div className="font-semibold text-navy">{profile.phone || "—"}</div>
        </div>
      </div>
    </div>
  );
}