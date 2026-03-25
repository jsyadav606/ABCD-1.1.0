/**
 * App Router
 * 
 * Logics:
 * - Routing:
 *   Public routes for login/register/404; protected routes wrap pages in ProtectedRoute and MainLayout.
 * - Auth Context:
 *   AuthProvider wraps entire route tree to provide user/session state.
 * - Navigation:
 *   Root redirects to /dashboard.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import ScanningProvider from "./components/BarcodeScanner/ScanningProvider.jsx";
import MainLayout from "./layouts/MainLayout";
import { ProtectedRoute } from "./components";
import Loading from "./components/Loading/Loading.jsx";

// Pages: lazy loaded for faster first paint on slow networks
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const Users = lazy(() => import("./pages/users/UsersList/Users"));
const AddUser = lazy(() => import("./pages/users/AddUserPage/AddUser"));
const EditUser = lazy(() => import("./pages/users/EditUserPage/EditUser"));
const UserDetails = lazy(() => import("./pages/users/UserDetailsPage/UserDetails"));
const Setup = lazy(() => import("./pages/Setup/Setup"));
// @ts-ignore
const AssetPage = lazy(() => import("./pages/Assets/asset"));
// @ts-ignore
const AddItemPage = lazy(() => import("./pages/Assets/AddItem"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScanningProvider>
        <Suspense fallback={<Loading fullScreen text="Loading..." />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* Root redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute 
// @ts-ignore
              children={undefined} requiredPermission={undefined}>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission="users:users_list:view">
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/add"
            element={
              <ProtectedRoute requiredPermission="users:users_list:add">
                <MainLayout>
                  <AddUser />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute requiredPermission="users:users_list:edit">
                <MainLayout>
                  <EditUser />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-detail/:id"
            element={
              <ProtectedRoute requiredPermission="users:users_list:view">
                <MainLayout>
                  <UserDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/setup"
            element={
              <ProtectedRoute requiredPermission="setup:access">
                <MainLayout>
                  <Setup />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <
// @ts-ignore
              ProtectedRoute>
                <MainLayout>
                  <AssetPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/add"
            element={
              <
// @ts-ignore
              ProtectedRoute>
                <MainLayout>
                  <AddItemPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/add/:type"
            element={
              <
// @ts-ignore
              ProtectedRoute>
                <MainLayout>
                  <AddItemPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </ScanningProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
