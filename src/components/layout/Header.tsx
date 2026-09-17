import { Search, User, ShoppingCart, Phone, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../lib/AuthContext";
import { useCartCount } from "../../api/queries/useCart";
import CartDrawer from "../cart/CartDrawer";

const navItems = [
  { label: "WINDOWS", to: "/products/category/windows", icon: "/variant/window1.png" },
  { label: "OFFICE", to: "/products/category/office", icon: "/variant/office.png" },
  { label: "WINDOWS SERVER", to: "/products/category/windows-server", icon: "/variant/window2.png" },
  { label: "ANTIVIRUS", to: "/products/category/antivirus", icon: "/variant/antivirus.png" },
  { label: "ABOUT US", to: "/about-us", icon: "/variant/aboutus.png" },
  { label: "CONTACT US", to: "/contact-us", icon: "/variant/mail.png" },
];

export default function Header() {
  const nav = useNavigate();
  const { isAuthenticated, user, logout } = useAuthContext();

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";

  const { data: cartCount = 0 } = useCartCount();

  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/assets/logo.png" alt="Software Universe" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <div className="font-extrabold text-navy text-lg tracking-tight">SOFTWARE</div>
              <div className="text-[10px] tracking-[0.28em] text-muted font-semibold">UNIVERSE</div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  nav(`/products?q=${encodeURIComponent(q)}`);
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {/* Secure checkout badge */}
          <div className="hidden lg:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <ShieldCheck size={16} className="text-success" />
            <span className="text-[10px] font-bold text-muted leading-tight">SECURE<br />CHECKOUT</span>
          </div>

          {/* Phone */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white">
              <Phone size={16} />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] text-muted font-semibold">SALES & SUPPORT</div>
              <div className="text-sm font-bold text-navy">+91 9911611207</div>
            </div>
          </div>

          {/* User */}
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-brand"
              >
                <User size={18} />
                <span className="hidden md:inline">{user?.name?.split(" ")[0] || "Account"}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs text-muted">Signed in as</div>
                    <div className="text-sm font-semibold text-navy truncate">{user?.email}</div>
                  </div>
                  <Link
                    to={dashboardHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-navy hover:bg-soft"
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm font-semibold text-navy hover:text-brand"
            >
              <User size={18} /> LOGIN
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1 text-sm font-semibold text-navy hover:text-brand"
          >
            <ShoppingCart size={18} />
            <span className="hidden md:inline">CART</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 md:-right-3 bg-brand text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 py-3 text-sm font-semibold text-navy">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-2 hover:text-brand transition-colors"
              >
                <img src={item.icon} alt="" className="w-5 h-5 object-contain" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}