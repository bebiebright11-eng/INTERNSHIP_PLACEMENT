import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import PublicRoute from "./components/PublicRoute";
import ActivateAccount from "./pages/ActivateAccount";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import WorkplaceDashboard from "./pages/WorkplaceDashboard";
import AcademicDashboard from "./pages/AcademicDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<PublicRoute><ActivateAccount /></PublicRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/workplace" element={<ProtectedRoute allowedRole="workplace"><WorkplaceDashboard /></ProtectedRoute>} />
      <Route path="/academic" element={<ProtectedRoute allowedRole="academic"><AcademicDashboard /></ProtectedRoute>} />
    </Routes>
  </BrowserRouter>
);


