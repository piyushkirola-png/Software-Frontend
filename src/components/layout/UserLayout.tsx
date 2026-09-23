import { Outlet } from "react-router-dom";
import UserSidebar from "../sidebar/UserSidebar";
import DashboardLayout from "./DashboardLayout";

export default function UserLayout() {
  return (
    <DashboardLayout sidebar={<UserSidebar />}>
      <Outlet />
    </DashboardLayout>
  );
}
