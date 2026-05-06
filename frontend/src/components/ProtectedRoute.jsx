import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/" />;
  }

  //  Logged in but wrong role
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" />;
  }

  // Allowed
  return children;
}

export default ProtectedRoute;