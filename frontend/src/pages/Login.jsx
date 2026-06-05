import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const res = await API.post("accounts/login/", {
        username,
        password,
      });

      localStorage.setItem(
        "user_id",
        res.data.user?.id || res.data.id || res.data.user_id
      );

      localStorage.setItem("role", res.data.role);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("first_name", res.data.first_name);
      localStorage.setItem("last_name", res.data.last_name);

      const role = (res.data.role || "").toLowerCase();

      if (role === "student") {
        toast.success("Logged in successfully 👋");
        navigate("/student");

      } else if (role === "admin") {

        toast.success("Logged in successfully 👋");

        navigate("/admin");

      } else if (role === "workplace") {
        toast.success("Logged in successfully 👋");
        navigate("/workplace");

      } else if (role === "academic") {
        toast.success("Logged in successfully 👋");
        navigate("/academic");

      } else {
        toast.error("Unknown user role");
      }

    } catch (error) {

      if (error.response) {
        setError("Invalid credentials or account not activated");

      } else {
        setError("Network error. Please try again.");
      }

    }

    setLoading(false);
  };

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        {/* LOGO */}
        <img
          src="/logo.png"
          alt="MAKERERE UNIVERSITY"
          style={styles.logo}
        />

        {/* TITLE */}
        <h1 style={styles.mainTitle}>
          Internship Placement System
        </h1>

        <p style={styles.subtitle}>
          Student & Supervisor Portal
        </p>

        <h2 style={styles.loginTitle}>
          Login To Your Account
        </h2>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Registration Number / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Logging in..." : "SIGN IN"}
          </button>

        </form>

        <div style={styles.linksContainer}>

          <p
            style={styles.link}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>

          <p>
            Don't have an account?{" "}
            <span
              style={styles.activateLink}
              onClick={() => navigate("/activate")}
            >
              Activate here
            </span>
          </p>

        </div>

      </div>

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f3f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },

  card: {
    width: "400px",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
  },

  logo: {
    width: "120px",
    marginBottom: "15px",
  },

  mainTitle: {
    color: "#198754",
    marginBottom: "5px",
    fontSize: "30px",
  },

  subtitle: {
    color: "#555",
    marginBottom: "25px",
    fontWeight: "bold",
  },

  loginTitle: {
    marginBottom: "20px",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "18px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#198754",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  linksContainer: {
    marginTop: "20px",
  },

  link: {
    color: "#198754",
    cursor: "pointer",
    marginBottom: "12px",
    fontWeight: "bold",
  },

  activateLink: {
    color: "blue",
    cursor: "pointer",
    fontWeight: "bold",
  },

  errorBox: {
    backgroundColor: "#f8d7da",
    color: "#842029",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
};

export default Login;