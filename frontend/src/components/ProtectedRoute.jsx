import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  //  Not logged in → go to login
  if (!token) {
    return <Navigate to="/" />;
  }

  // ✅ Logged in → allow access
  return children;
}

export default ProtectedRoute;