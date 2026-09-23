import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthContext } from "../../../lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Check,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useUserProfile } from "../../../api/queries/useUser";
import {
  useUpdateProfile,
  useUploadAvatar,
} from "../../../api/mutations/userMutations";
import userService from "../../../api/services/userService";
import type { User } from "../../../types/user";
import type { UpdateProfileRequest } from "../../../api/services/userService";
import Button from "../../../components/ui/Button";

export default function AdminProfile() {
  const { setUser, refreshProfile } = useAuthContext();
  const { data, isLoading, isError, refetch } = useUserProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
        <h2 className="text-base font-bold text-navy mb-1">
          Couldn't load your profile
        </h2>
        <p className="text-xs text-muted mb-4">Please try again in a moment.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">
            My Profile
          </h1>
          <p className="text-muted mt-1 text-sm">Your account information</p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold transition shadow-md shadow-brand/25 hover:shadow-lg"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Profile
        </button>
      </div>

      <ViewMode profile={data} />

      <EditAdminModal
        open={editOpen}
        profile={data}
        onClose={() => setEditOpen(false)}
        onSuccess={async () => {
          setEditOpen(false);
          await refetch();
          await refreshProfile();
          setToast("Profile updated successfully!");
        }}
      />

      {/* Toast */}
      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-white border border-success/20 shadow-xl rounded-lg px-3.5 py-2.5 max-w-xs"
            >
              <div className="p-1 rounded bg-success/10">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-xs font-medium text-navy">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

function ViewMode({ profile }: { profile: User }) {
  const avatarSrc = userService.absoluteAvatarUrl(profile.avatarUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = avatarSrc && !imgFailed;

  const fields = [
    { icon: UserIcon, label: "Full Name", value: profile.name },
    { icon: Mail, label: "Email", value: profile.email },
    { icon: ShieldCheck, label: "Role", value: profile.role },
    { icon: Phone, label: "Phone", value: profile.phone || "—" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div className="relative h-24 bg-gradient-to-br from-brand to-brand-light" />

      <div className="px-5 lg:px-6 pb-6">
        {/* Avatar + name */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
          <div className="relative h-24 w-24 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden shrink-0">
            {showImage ? (
              <img
                src={avatarSrc}
                alt={profile.name}
                className="h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-3xl font-bold">
                {profile.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
          </div>
          <div className="pb-1">
            <h2 className="text-lg lg:text-xl font-bold text-navy">
              {profile.name}
            </h2>
            <p className="text-xs text-muted">{profile.email}</p>
          </div>
        </div>

        {/* Fields — 2 columns */}
        <div className="grid sm:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div
              key={f.label}
              className="bg-soft rounded-lg p-3 border border-gray-100"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <f.icon className="h-3 w-3 text-muted" />
                <span className="text-[11px] text-muted uppercase tracking-wide">
                  {f.label}
                </span>
              </div>
              <div className="text-xs font-semibold text-navy truncate">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditAdminModal({
  open,
  profile,
  onClose,
  onSuccess,
}: {
  open: boolean;
  profile: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadAvatar();

  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm({
        name: profile.name,
        phone: profile.phone || "",
      });
      setPendingAvatarFile(null);
      setAvatarPreview(userService.absoluteAvatarUrl(profile.avatarUrl));
      setError(null);
      setConfirmOpen(false);
    }
  }, [open, profile]);

  const onField =
    (key: keyof UpdateProfileRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setError("Only PNG, JPG, or WEBP images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setError(null);
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (pendingAvatarFile) {
        await uploadMutation.mutateAsync(pendingAvatarFile);
        setPendingAvatarFile(null);
      }
      await updateMutation.mutateAsync(form);
      setConfirmOpen(false);
      onSuccess();
    } catch (err: any) {
      setConfirmOpen(false);
      setError(err?.response?.data?.message || "Update failed");
    }
  };

  const saving = updateMutation.isPending || uploadMutation.isPending;

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={onClose}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                  <h2 className="text-base font-bold text-navy">
                    Edit Admin Profile
                  </h2>
                  <p className="text-[11px] text-muted mt-0.5">
                    Update your name, phone, or avatar
                  </p>
                </div>

                {/* Body */}
                <form
                  onSubmit={handleRequestSubmit}
                  className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
                  id="admin-edit-form"
                >
                  {error && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          form.name?.[0]?.toUpperCase() || "A"
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handlePickFile}
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
                        aria-label="Change avatar"
                      >
                        <Camera className="h-3 w-3 text-navy" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-navy">
                        Profile picture
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        PNG, JPG or WEBP. Max 5 MB.
                        {pendingAvatarFile && (
                          <span className="block text-brand font-medium mt-0.5">
                            Will upload on save
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name ?? ""}
                      onChange={onField("name")}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      required
                    />
                  </div>

                  {/* Email — readonly */}
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email ?? ""}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg bg-soft border border-gray-200 text-sm text-muted cursor-not-allowed"
                    />
                    <p className="text-[10px] text-muted mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone ?? ""}
                      onChange={onField("phone")}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </form>

                {/* Footer */}
                <div className="flex gap-2.5 px-5 py-3.5 border-t border-gray-100 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 border border-gray-200 text-navy text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="admin-edit-form"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold disabled:opacity-60 transition shadow-md shadow-brand/25"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Update Profile
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Nested Confirm */}
      {createPortal(
        <AnimatePresence>
          {confirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
              onClick={() => setConfirmOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-brand/10">
                    <AlertTriangle className="h-4 w-4 text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-navy">Save changes?</h3>
                </div>
                <p className="text-xs text-muted mb-5">
                  Your profile will be updated with the new information.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-semibold disabled:opacity-60 transition"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
