import { Outlet } from "react-router-dom";
import AdminSidebar from "../sidebar/AdminSidebar";
import DashboardLayout from "./DashboardLayout";

export default function AdminLayout() {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <Outlet />
    </DashboardLayout>
  );
}
