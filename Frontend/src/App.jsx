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
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import { ProtectedRoute } from "./components";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound/NotFound";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Users from "./pages/users/UsersList/Users";
import AddUser from "./pages/users/AddUserPage/AddUser";
import EditUser from "./pages/users/EditUserPage/EditUser";
import UserDetails from "./pages/users/UserDetailsPage/UserDetails";
import Setup from "./pages/Setup/Setup";

function App() {
  return (
    <Router>
      <AuthProvider>
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
              <ProtectedRoute>
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

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
