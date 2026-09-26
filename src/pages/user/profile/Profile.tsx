import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  Home,
  Building2,
  Globe2,
  Hash,
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
import { useAuthContext } from "../../../lib/AuthContext";
import { getErrorMessage } from "../../../lib/api-client";
import type { User, Gender } from "../../../types/user";
import Button from "../../../components/ui/Button";
import PhoneInput from "../../../components/ui/PhoneInput";
import { DEFAULT_COUNTRY, resolveCountry } from "../../../utils/countries";
import CountrySelect from "../../../components/ui/CountrySelect";
import {
  lookupPostcode,
  isPostcodeComplete,
} from "../../../utils/pincode";

export default function Profile() {
  const { showToast, setUser } = useAuthContext();
  const { data, isLoading, isError, refetch } = useUserProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1500);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Profile</h1>
          <p className="text-muted mt-1 text-sm">
            Manage your personal information
          </p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition-all"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Profile
        </button>
      </div>

      <ViewMode profile={data} />

      <EditProfileModal
        open={editOpen}
        profile={data}
        onClose={() => setEditOpen(false)}
        onSuccess={(updated) => {
          setEditOpen(false);
          setUser(updated);
          refetch();
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
              className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-white border border-emerald-200 shadow-xl rounded-lg px-3.5 py-2.5 max-w-xs"
            >
              <div className="p-1 rounded bg-emerald-100">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
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

/* ============ VIEW MODE ============ */
function ViewMode({ profile }: { profile: User }) {
  const avatarSrc = userService.absoluteAvatarUrl(profile.avatarUrl);
  const [imgFailed, setImgFailed] = useState(false);

  const fields = [
    { icon: UserIcon, label: "Full Name", value: profile.name },
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Phone, label: "Phone", value: profile.phone || "—" },
    { icon: UserIcon, label: "Gender", value: profile.gender || "—" },
    {
      icon: Home,
      label: "Current Address",
      value: profile.currentAddress || "—",
    },
    { icon: Building2, label: "City", value: profile.city || "—" },
    { icon: Globe2, label: "State", value: profile.state || "—" },
    { icon: Globe2, label: "Country", value: profile.country || "—" },
    { icon: Hash, label: "Pincode", value: profile.pincode || "—" },
  ];

  const showImage = avatarSrc && !imgFailed;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="relative h-24 bg-gradient-to-br from-brand to-brand-dark">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="px-5 lg:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
          <div className="relative h-24 w-24 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden shrink-0">
            {showImage ? (
              <img
                src={avatarSrc ?? undefined}
                alt={profile.name}
                className="h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-3xl font-bold">
                {profile.name?.[0]?.toUpperCase() || "U"}
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fields.map((f) => (
            <div
              key={f.label}
              className="bg-soft rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <f.icon className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs text-muted uppercase tracking-wide">
                  {f.label}
                </span>
              </div>
              <div className="text-sm font-semibold text-navy truncate">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ EDIT MODAL ============ */
function EditProfileModal({
  open,
  profile,
  onClose,
  onSuccess,
}: {
  open: boolean;
  profile: User;
  onClose: () => void;
  onSuccess: (updated: User) => void;
}) {
  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadAvatar();

  const [form, setForm] = useState<any>({});
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastLookupRef = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    const resolved = resolveCountry(profile.country);
    setForm({
      name: profile.name,
      phone: profile.phone || "",
      gender: (profile.gender as Gender) || "",
      currentAddress: profile.currentAddress || "",
      city: profile.city || "",
      state: profile.state || "",
      country: resolved.name,
      pincode: profile.pincode || "",
    });
    setPendingAvatarFile(null);
    setAvatarPreview(userService.absoluteAvatarUrl(profile.avatarUrl));
    setError(null);
    setPincodeMessage(null);
    setConfirmOpen(false);
    lastLookupRef.current = "";
  }, [open, profile]);

  const onField =
    (key: string) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) =>
        setForm((f: any) => ({ ...f, [key]: e.target.value }));

  const handlePincodeLookup = async (pincode: string, countryName: string) => {
    const country = resolveCountry(countryName);
    if (!isPostcodeComplete(country.code, pincode)) return;

    const key = `${country.code}:${pincode}`;
    if (lastLookupRef.current === key) return;
    lastLookupRef.current = key;

    setPincodeLoading(true);
    setPincodeMessage(null);
    try {
      const result = await lookupPostcode(country.code, pincode);
      if (result) {
        setForm((f: any) => ({
          ...f,
          city: result.city || f.city,
          state: result.state || f.state,
        }));
        setPincodeMessage(null);
      } else {
        setPincodeMessage("Couldn't find this postcode");
      }
    } catch {
      setPincodeMessage("Lookup failed. Please enter manually.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, "");
    setForm((f: any) => ({ ...f, pincode: val }));
    setPincodeMessage(null);

    const country = resolveCountry(form.country);
    if (isPostcodeComplete(country.code, val)) {
      handlePincodeLookup(val, form.country);
    }
  };

  const handlePincodeBlur = () => {
    const country = resolveCountry(form.country);
    if (form.pincode) {
      handlePincodeLookup(form.pincode, country.name);
    }
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
      const updated = await updateMutation.mutateAsync(form);
      setConfirmOpen(false);
      onSuccess(updated);
    } catch (err: any) {
      setConfirmOpen(false);
      setError(getErrorMessage(err) || "Update failed");
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
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
              onClick={onClose}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                  <h2 className="text-base font-bold text-navy">
                    Edit Your Profile
                  </h2>
                  <p className="text-[11px] text-muted mt-0.5">
                    Update your information and save changes
                  </p>
                </div>

                {/* Body */}
                <form
                  onSubmit={handleRequestSubmit}
                  className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5 scrollbar-hide"
                  id="edit-profile-form"
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
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          form.name?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handlePickFile}
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-soft transition"
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

                  {/* Row 1: Name, Country, Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={form.name ?? ""}
                        onChange={onField("name")}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand"
                        required
                      />
                    </div>
                    <CountrySelect
                      label="Country"
                      value={form.country ?? DEFAULT_COUNTRY.name}
                      onChange={(name) =>
                        setForm((f: any) => ({ ...f, country: name }))
                      }
                    />
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-3 py-2 rounded-lg bg-soft border border-gray-200 text-sm text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone, Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PhoneInput
                      countryCode={resolveCountry(form.country).code}
                      value={form.phone ?? ""}
                      onChange={(v) => setForm((f: any) => ({ ...f, phone: v }))}
                      label="Phone Number"
                    />
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">
                        Gender
                      </label>
                      <select
                        value={form.gender ?? ""}
                        onChange={onField("gender")}
                        className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand"
                      >
                        <option value="">Select</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Current Address */}
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Current Address
                    </label>
                    <textarea
                      rows={2}
                      value={form.currentAddress ?? ""}
                      onChange={onField("currentAddress")}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand resize-none"
                    />
                  </div>

                  {/* Row 3: Pincode, City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">
                        Pincode
                        {pincodeLoading && (
                          <Loader2 className="inline-block ml-1 h-3 w-3 animate-spin text-brand" />
                        )}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.pincode ?? ""}
                        onChange={handlePincodeChange}
                        onBlur={handlePincodeBlur}
                        placeholder="e.g. 121003"
                        maxLength={10}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand"
                      />
                      {pincodeMessage && (
                        <p className="mt-1 text-[11px] text-danger">
                          {pincodeMessage}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city ?? ""}
                        onChange={onField("city")}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state ?? ""}
                        onChange={onField("state")}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-navy focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </form>

                {/* Footer */}
                <div className="flex gap-2.5 px-5 py-3.5 border-t border-gray-100 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2.5 border border-gray-200 text-navy text-xs font-semibold hover:border-gray-300 hover:bg-soft transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-profile-form"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold disabled:opacity-60 transition"
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

      {/* Confirm — PORTAL */}
      {createPortal(
        <ConfirmDialog
          open={confirmOpen}
          saving={saving}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSave}
        />,
        document.body,
      )}
    </>
  );
}

function ConfirmDialog({
  open,
  saving,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
                onClick={onCancel}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 border border-gray-200 text-navy text-xs font-semibold hover:border-gray-300 hover:bg-soft disabled:opacity-60 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
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
    </AnimatePresence>
  );
}