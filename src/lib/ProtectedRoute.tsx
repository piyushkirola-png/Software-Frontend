import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthContext } from "./AuthContext";

type Role = "USER" | "ADMIN";

interface Props {
  children: ReactNode;
  roles?: Role[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role as Role)) {
    // Logged in but wrong role → send them to their own dashboard
    const home = user.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
