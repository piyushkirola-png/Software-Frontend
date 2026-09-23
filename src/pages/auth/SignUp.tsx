import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../lib/AuthContext";
import { getErrorMessage } from "../../lib/api-client";

export default function SignUp() {
  const nav = useNavigate();
  const { register } = useAuthContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    const t = toast.loading("Creating your account…");
    try {
      const res = await register({
        name,
        email,
        password,
        phone: phone || undefined,
      });
      toast.success("Account created successfully! Welcome to Softora.", {
        id: t,
      });
      const target =
        res.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      nav(target, { replace: true });
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
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
              />
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
