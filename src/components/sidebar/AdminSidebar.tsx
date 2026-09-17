import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft } from "lucide-react";
import { ADMIN_NAV } from "../../lib/navigation";
import { useAuthContext } from "../../lib/AuthContext";

export default function AdminSidebar() {
  const { user, logout } = useAuthContext();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <aside className="bg-navy text-gray-300 w-64 min-h-screen flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Software Universe"
            className="h-9 w-auto object-contain brightness-0 invert"
          />
          <div className="leading-tight">
            <div className="font-extrabold text-white text-sm">ADMIN</div>
            <div className="text-[9px] tracking-[0.2em] text-gray-400">PANEL</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white text-xs truncate">
            {user?.name || "Admin"}
          </div>
          <div className="text-[10px] text-gray-400 truncate">
            {user?.email}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
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
      <div className="border-t border-white/10 p-3 space-y-0.5">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Back to Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}