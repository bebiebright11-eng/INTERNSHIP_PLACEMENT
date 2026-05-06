import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  //  If already logged in → redirect to dashboard
  if (token && role) {
    if (role === "student") return <Navigate to="/student" />;
    if (role === "admin") return <Navigate to="/admin" />;
    if (role === "workplace") return <Navigate to="/workplace" />;
    if (role === "academic") return <Navigate to="/academic" />;
  }

  //  Not logged in → allow access
  return children;
}

export default PublicRoute;