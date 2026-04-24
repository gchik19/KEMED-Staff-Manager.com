/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./pages/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { StaffList } from "./pages/StaffList";
import { StaffForm } from "./pages/StaffForm";
import { Users } from "./pages/Users";
import { Schools } from "./pages/Schools";

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={user.role === "HEAD_TEACHER" ? "/staff" : "/dashboard"} replace />} />
        {user.role !== "HEAD_TEACHER" && <Route path="dashboard" element={<Dashboard />} />}
        <Route path="staff" element={<StaffList />} />
        <Route path="staff/new" element={<StaffForm />} />
        <Route path="staff/edit/:id" element={<StaffForm />} />
        {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && <Route path="schools" element={<Schools />} />}
        {user.role === "SUPER_ADMIN" && <Route path="users" element={<Users />} />}
        <Route path="*" element={<Navigate to={user.role === "HEAD_TEACHER" ? "/staff" : "/dashboard"} replace />} />
      </Route>
    </Routes>
  );
}
