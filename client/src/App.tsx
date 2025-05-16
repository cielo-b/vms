import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useAppSelector } from "./hooks/hooks";
import { selectIsAuthenticated } from "./features/auth/auth.slice";
import type { JSX } from "react";
import Login from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import NotFoundPage from "./pages/Notfound";
import DashboardPage from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import CustomerParkingPage from "./pages/customer/ParkingPage";
import CustomerVehiclesPage from "./pages/customer/CustomerVehicles";
import CustomerBookingsPage from "./pages/customer/CustomerBookings";
import CustomerReceiptsPage from "./pages/customer/CustomerReceipts";
import { ERole } from "./enums/ERole";
import AdminParkingPage from "./pages/admin/AdminParkings";
import AdminBookingsPage from "./pages/admin/AdminBookings";
import AdminParkingRequestsPage from "./pages/admin/AdminParkingRequests";
import AdminExitRequestsPage from "./pages/admin/AdminExitRequests";
import AdminReceiptsPage from "./pages/admin/AdminReceipts";
import AdminVehiclesPage from "./pages/admin/AdminVehicle";

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Auth route component (for login/register when already authenticated)
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          JSON.parse(localStorage.getItem("user") || "{}").role == ERole.ADMIN
            ? "/dashboard/admin/parking"
            : "/dashboard/customer/parking"
        }
        replace
      />
    );
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route
          path="/"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          }
        />

        <Route
          path="/dashboard/customer/parking"
          element={
            <ProtectedRoute>
              <CustomerParkingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/customer/vehicles"
          element={
            <ProtectedRoute>
              <CustomerVehiclesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/customer/bookings"
          element={
            <ProtectedRoute>
              <CustomerBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/customer/receipts"
          element={
            <ProtectedRoute>
              <CustomerReceiptsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/parking"
          element={
            <ProtectedRoute>
              <AdminParkingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/vehicles"
          element={
            <ProtectedRoute>
              <AdminVehiclesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/bookings"
          element={
            <ProtectedRoute>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/parking-requests"
          element={
            <ProtectedRoute>
              <AdminParkingRequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/exit-requests"
          element={
            <ProtectedRoute>
              <AdminExitRequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/receipts"
          element={
            <ProtectedRoute>
              <AdminReceiptsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
