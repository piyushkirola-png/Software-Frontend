import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../api/services/authService";
import { getErrorMessage } from "../../lib/api-client";

type Step = "email" | "otp" | "reset";

export default function LostPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required");
    setLoading(true);
    const t = toast.loading("Sending code…");
    try {
      await authService.sendOtp({ email });
      toast.success("A one-time code (OTP) has been sent to your email.", {
        id: t,
      });
      setStep("otp");
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("OTP code is required");
    setLoading(true);
    const t = toast.loading("Verifying code…");
    try {
      await authService.verifyOtp({ email, code });
      toast.success("Code verified. Set your new password.", { id: t });
      setStep("reset");
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    setLoading(true);
    const t = toast.loading("Resetting password…");
    try {
      await authService.resetPassword({ email, code, newPassword: password });
      toast.success("Password reset successful. You can now log in.", {
        id: t,
      });
      setStep("email");
      setCode("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-soft min-h-[70vh] py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-md">
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy">
            My account
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-navy mt-4 mb-4">
            Lost your password?
          </h2>

          <p className="text-sm text-muted mb-6">
            {step === "email" &&
              "Please enter your username or email address. You will receive a one-time code (OTP) via email to create a new password."}
            {step === "otp" && (
              <>
                Enter the one-time code sent to{" "}
                <b className="text-navy">{email}</b>.
              </>
            )}
            {step === "reset" && "Choose a new password for your account."}
          </p>

          {step === "email" && (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-navy mb-1.5">
                  Username or email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-md transition"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  Reset password
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-navy mb-1.5">
                  One-time code (OTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand tracking-widest"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-md transition"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  Verify code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                  }}
                  className="text-sm text-brand hover:underline"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-navy mb-1.5">
                  New password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-navy mb-1.5">
                  Confirm new password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-md transition"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  Reset password
                </button>
              </div>
            </form>
          )}

          <p className="mt-10 text-sm text-muted">
            Remembered it?{" "}
            <Link
              to="/login"
              className="text-brand font-semibold hover:underline"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
