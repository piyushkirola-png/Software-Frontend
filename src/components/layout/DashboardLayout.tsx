import type { ReactNode } from "react";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function DashboardLayout({
  sidebar,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-soft">
      {sidebar}

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
