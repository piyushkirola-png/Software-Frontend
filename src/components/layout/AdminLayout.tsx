import { Outlet } from "react-router-dom";
import AdminSidebar from "../sidebar/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-soft flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}