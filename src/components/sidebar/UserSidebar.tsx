import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Menu, X } from "lucide-react";
import { USER_NAV } from "../../lib/navigation";
import { useAuthContext } from "../../lib/AuthContext";

export default function UserSidebar() {
  const { user, logout } = useAuthContext();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Software Universe"
            className="h-9 w-auto object-contain"
          />
          <div className="leading-tight">
            <div className="font-extrabold text-navy text-sm">SOFTWARE</div>
            <div className="text-[9px] tracking-[0.2em] text-muted">
              UNIVERSE
            </div>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-navy text-xs truncate">
            {user?.name || "User"}
          </div>
          <div className="text-[10px] text-muted truncate">{user?.email}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {USER_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/user/dashboard"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-navy hover:bg-soft"
                }`
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 space-y-0.5">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-navy hover:bg-soft transition"
        >
          <ArrowLeft size={16} />
          Back to Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Software Universe"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-soft"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-navy" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-gray-100 min-h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-soft"
              aria-label="Close menu"
            >
              <X size={18} className="text-navy" />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}