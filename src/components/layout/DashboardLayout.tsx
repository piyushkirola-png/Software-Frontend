import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}