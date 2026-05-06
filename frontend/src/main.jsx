import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ActivateAccount from "./pages/ActivateAccount";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import WorkplaceDashboard from "./pages/WorkplaceDashboard";
import AcademicDashboard from "./pages/AcademicDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/workplace" element={<ProtectedRoute><WorkplaceDashboard /></ProtectedRoute>} />
      <Route path="/academic" element={<ProtectedRoute><AcademicDashboard /></ProtectedRoute>} />
    </Routes>
  </BrowserRouter>
);


