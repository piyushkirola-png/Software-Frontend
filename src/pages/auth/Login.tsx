import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../lib/AuthContext";
import { getErrorMessage } from "../../lib/api-client";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuthContext();

  const redirectTo = (loc.state as { from?: string })?.from || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required", { duration: 3000 });
      return;
    }
    setLoading(true);
    const t = toast.loading("Signing in…", { duration: 3000 });
    try {
      const res = await login({ email, password });
      toast.success("Logged in successfully!", {
        id: t,
        duration: 2500,
      });

      const target =
        redirectTo ||
        (res.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard");

      // Small delay so the success toast is visible before navigation
      setTimeout(() => {
        nav(target, { replace: true });
      }, 700);
    } catch (err) {
      toast.error(getErrorMessage(err), { id: t, duration: 3000 });
      setLoading(false);
    }
  };

  return (
    <div className="bg-soft min-h-[70vh] py-14">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy">
            My account
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-navy mt-4 mb-6">
            Login
          </h2>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">
                Username or email address{" "}
                <span className="text-red-500">*</span>
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
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-md transition"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Log in
              </button>
            </div>

            <div>
              <Link
                to="/lost-password"
                className="text-sm text-brand hover:underline"
              >
                Lost your password?
              </Link>
            </div>
          </form>

          <p className="mt-10 text-sm text-muted">
            New here?{" "}
            <Link
              to="/signup"
              className="text-brand font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
