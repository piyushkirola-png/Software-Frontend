import { Loader2 } from "lucide-react";
import { useUserProfile } from "../../../api/queries/useUser";

export default function AdminProfile() {
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
      <h1 className="text-2xl font-extrabold text-navy mb-6">Admin Profile</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-bold">
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-navy text-lg">{profile.name}</div>
          <div className="text-sm text-muted">{profile.email}</div>
          <div className="text-xs text-brand font-bold uppercase mt-1">
            {profile.role}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted">
        To update your profile, use the user dashboard at{" "}
        <a href="/my-account/profile" className="text-brand hover:underline">
          /my-account/profile
        </a>
      </div>
    </div>
  );
}