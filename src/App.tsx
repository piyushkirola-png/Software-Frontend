import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./lib/AuthContext";
import ProtectedRoute from "./lib/ProtectedRoute";
import ScrollToTop from "./components/layout/ScrollToTop";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import LostPassword from "./pages/auth/LostPassword";
import ProductListing from "./pages/products/ProductListing";
import CategoryListing from "./pages/products/CategoryListing";
import ProductDetail from "./pages/products/ProductDetail";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";

// Public layout
import PublicLayout from "./components/layout/PublicLayout";
import About from "./pages/legal/About";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import ShippingDelivery from "./pages/legal/ShippingDelivery";
import CancellationRefund from "./pages/legal/CancellationRefund";
import Contact from "./pages/legal/Contact";

// User pages
import UserLayout from "./components/layout/UserLayout";
import UserDashboard from "./pages/user/dashboard/Dashboard";
import UserOrders from "./pages/user/orders/Orders";
import OrderDetail from "./pages/user/orders/OrderDetail";
import LicenseKeys from "./pages/user/keys/LicenseKeys";
import Downloads from "./pages/user/downloads/Downloads";
import Profile from "./pages/user/profile/Profile";
import UpdatePassword from "./pages/user/profile/UpdatePassword";

// Admin pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/Dashboard";
import AdminCategories from "./pages/admin/categories/Categories";
import AdminProducts from "./pages/admin/products/Products";
import AdminCoupons from "./pages/admin/coupons/Coupons";
import AdminOrders from "./pages/admin/orders/Orders";
import AdminKeys from "./pages/admin/keys/Keys";
import AdminUsers from "./pages/admin/users/Users";
import AdminReviews from "./pages/admin/reviews/Reviews";
import AdminPayments from "./pages/admin/payments/Payments";
import AdminProfile from "./pages/admin/profile/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Toaster
            position="bottom-right"
            containerStyle={{
              bottom: 24,
              right: 24,
              zIndex: 99999,
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: "#0B1F3A",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                padding: "12px 16px",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(11,31,58,0.25)",
              },
              success: {
                iconTheme: { primary: "#10B981", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#fff" },
              },
            }}
          />
          <Routes>
            {/* Home — has its own layout built in */}
            <Route path="/" element={<Home />} />

            {/* Public layout — everything with Header + Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/category/:slug" element={<CategoryListing />} />
              <Route path="/product/:slug" element={<ProductDetail />} />

              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/checkout/success/:orderNumber"
                element={<OrderSuccess />}
              />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/lost-password" element={<LostPassword />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/terms-condition" element={<Terms />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/shipping-delivery" element={<ShippingDelivery />} />
              <Route path="/cancellation-refund" element={<CancellationRefund />} />
              <Route path="/contact-us" element={<Contact />} />
            </Route>

            {/* User */}
            <Route
              path="/user"
              element={
                <ProtectedRoute roles={["USER"]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/user/dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="orders" element={<UserOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="keys" element={<LicenseKeys />} />
              <Route path="downloads" element={<Downloads />} />
              <Route path="profile" element={<Profile />} />
              <Route path="password" element={<UpdatePassword />} />
            </Route>

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="keys" element={<AdminKeys />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}