import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../lib/AuthContext";
import { getErrorMessage } from "../../lib/api-client";

type Step = "form" | "otp";

export default function SignUp() {
  const nav = useNavigate();
  const { register, verifySignup } = useAuthContext();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(120); // 2 min
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Countdown for resend ──
  useEffect(() => {
    if (step !== "otp") return;
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  // ── OTP input handler ──
  const handleOtpChange = (idx: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const next = [...otp];
      next[idx] = "";
      setOtp(next);
      return;
    }
    const next = [...otp];
    // Paste support — if multiple digits, distribute
    for (let i = 0; i < digits.length && idx + i < 6; i++) {
      next[idx + i] = digits[i];
    }
    setOtp(next);
    const focusIdx = Math.min(5, idx + digits.length);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── Step 1: submit signup ──
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return toast.error("Enter a valid 10-digit Indian mobile number");
    }

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    const t = toast.loading("Creating your accountâ€¦");
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: "+91 " + phone,
      });
      toast.success("OTP sent to your email", { id: t });
      setStep("otp");
      setResendIn(120);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter the 6-digit code");

    setLoading(true);
    const t = toast.loading("Verifyingâ€¦");
    try {
      const res = await verifySignup(email.trim(), code);
      toast.success(`Welcome to Software Universe, ${res.name}!`, { id: t });
      const target =
        res.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      setTimeout(() => nav(target, { replace: true }), 50);
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const onResend = async () => {
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: "+91 " + phone,
      });
      toast.success("A new code was sent to your email");
      setResendIn(120);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="bg-soft min-h-[70vh] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Mail size={12} /> VERIFY EMAIL
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-navy">
              Verify your email
            </h1>
            <p className="text-sm text-muted mt-3 mb-8">
              We sent a 6-digit code to{" "}
              <b className="text-navy">{email}</b>. Enter it below to complete
              your registration.
            </p>

            <form onSubmit={onVerifyOtp} className="space-y-6">
              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-navy border border-gray-300 rounded-md focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                  />
                ))}
              </div>

              <div className="text-sm text-muted">
                {resendIn > 0 ? (
                  <>
                    Resend code in{" "}
                    <b className="text-navy">
                      {Math.floor(resendIn / 60)}:
                      {String(resendIn % 60).padStart(2, "0")}
                    </b>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={loading}
                    className="text-brand font-semibold hover:underline disabled:opacity-60"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-md transition"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  Verify & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft min-h-[70vh] py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-md">
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy">
            My account
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-navy mt-4 mb-6">
            Register
          </h2>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">
                Email address <span className="text-red-500">*</span>
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
              <label className="block text-sm font-bold text-navy mb-1.5">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm font-semibold text-navy">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setPhone(digits);
                  }}
                  autoComplete="tel"
                  placeholder="9911611207"
                  maxLength={10}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-r-md text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <p className="text-[11px] text-muted mt-1">
                10-digit Indian mobile number
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">
                Password <span className="text-red-500">*</span>
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
                Confirm password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
              />
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              Your personal data will be used to support your experience
              throughout this website, to manage access to your account, and for
              other purposes described in our{" "}
              <Link to="/privacy-policy" className="text-brand hover:underline">
                privacy policy
              </Link>
              .
            </p>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-md transition"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Register
              </button>
            </div>
          </form>

          <p className="mt-10 text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}