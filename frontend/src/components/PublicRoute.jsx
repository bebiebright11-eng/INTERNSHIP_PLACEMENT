import { Navigate, useLocation } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // ✅ If user is already logged in AND trying to access other public pages
  // (like /activate), then redirect
  if (token && role && location.pathname !== "/") {
    if (role === "student") return <Navigate to="/student" />;
    if (role === "admin") return <Navigate to="/admin" />;
    if (role === "workplace") return <Navigate to="/workplace" />;
    if (role === "academic") return <Navigate to="/academic" />;
  }

  // ✅ ALWAYS allow access to "/"
  return children;
}

export default PublicRoute;