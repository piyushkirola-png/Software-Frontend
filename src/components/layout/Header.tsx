import {
  Search,
  User,
  ShoppingCart,
  Phone,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../lib/AuthContext";
import { useCartCount } from "../../api/queries/useCart";

const navItems = [
  {
    label: "WINDOWS",
    to: "/products/category/windows",
    icon: "/variant/window1.png",
  },
  {
    label: "OFFICE",
    to: "/products/category/office",
    icon: "/variant/office.png",
  },
  {
    label: "WINDOWS SERVER",
    to: "/products/category/windows-server",
    icon: "/variant/window2.png",
  },
  {
    label: "ANTIVIRUS",
    to: "/products/category/antivirus",
    icon: "/variant/antivirus.png",
  },
  { label: "ABOUT US", to: "/about-us", icon: "/variant/aboutus.png" },
  { label: "CONTACT US", to: "/contact-us", icon: "/variant/mail.png" },
];

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const { data: cartCount = 0 } = useCartCount();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <>
      <header
        className={`bg-white sticky top-0 z-40 transition-shadow ${
          scrolled ? "shadow-card" : "border-b border-gray-100"
        }`}
      >
        {/* Top row */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-soft flex items-center justify-center shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-navy" />
          </button>

          {/* Logo — left */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/assets/logo.png"
              alt="Softora"
              className="h-11 w-auto object-contain"
            />
            <div className="leading-tight hidden sm:block">
              <div className="font-extrabold text-navy text-xl tracking-tight">
                Softora
              </div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-[460px] relative min-w-0 ml-8 lg:ml-16">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search for products..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  nav(`/products?q=${encodeURIComponent(q)}`);
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>

          <div className="flex-1 hidden lg:block" />

          {/* Secure Checkout pill */}
          <div className="hidden xl:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 shrink-0">
            <ShieldCheck size={16} className="text-success" />
            <span className="text-[10px] font-bold text-muted leading-tight">
              SECURE
              <br />
              CHECKOUT
            </span>
          </div>

          {/* Sales & Support */}
          <div className="hidden lg:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 shrink-0 transition-all hover:border-blue-500 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white">
              <Phone size={16} />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] text-muted font-semibold">
                SALES &amp; SUPPORT
              </div>
              <div className="text-sm font-bold text-navy">+91 9911611207</div>
            </div>
          </div>

          {/* User */}
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative shrink-0">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand transition-colors"
              >
                <User size={18} />
                <span className="hidden md:inline">
                  {user?.name?.split(" ")[0] || "ACCOUNT"}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white border border-gray-100 rounded-xl shadow-cardHover py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs text-muted">Signed in as</div>
                    <div className="text-sm font-semibold text-navy truncate">
                      {user?.email}
                    </div>
                  </div>
                  <Link
                    to={dashboardHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy hover:bg-soft"
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand shrink-0 transition-colors"
            >
              <User size={18} />
              <span className="hidden md:inline">LOGIN</span>
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand shrink-0 transition-colors"
          >
            <ShoppingCart size={18} />
            <span className="hidden md:inline">CART</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 md:-right-3 bg-brand text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 py-3 text-sm font-semibold text-navy">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="relative flex items-center gap-2 hover:text-brand transition-colors group py-1"
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-5 h-5 object-contain"
                />
                {item.label}
                <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img
                  src="/assets/logo.png"
                  alt="Softora"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-soft flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={18} className="text-navy" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-soft text-sm font-semibold text-navy"
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-100 p-4">
              {isAuthenticated ? (
                <>
                  <div className="text-xs text-muted mb-1">Signed in as</div>
                  <div className="text-sm font-semibold text-navy truncate mb-3">
                    {user?.email}
                  </div>
                  <Link
                    to={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-bold py-3 rounded-xl mb-2"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 text-sm font-bold py-3 rounded-xl"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-bold py-3 rounded-xl"
                >
                  <User size={16} /> Login / Sign up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
