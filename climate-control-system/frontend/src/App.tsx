import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { AuthUser } from "./types";

const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage }))
);
const EnergyPage = lazy(() =>
  import("./pages/EnergyPage").then((module) => ({ default: module.EnergyPage }))
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((module) => ({ default: module.LandingPage }))
);
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((module) => ({ default: module.ContactPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((module) => ({ default: module.RegisterPage }))
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ResetPasswordPage").then((module) => ({ default: module.ResetPasswordPage }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage }))
);

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: AuthUser["role"][] }) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { accessToken } = useAuth();
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => {
    const storedTheme = (localStorage.getItem("theme") || "dark") as "dark" | "light";
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-sm text-subtle">
          Loading dashboard...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/energy"
          element={
            <PrivateRoute>
              <EnergyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
