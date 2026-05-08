import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function ResetPassword() {

  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const res = await API.post(
        `accounts/password-reset-confirm/${uid}/${token}/`,
        {
          password: password,
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 2500);

    } catch (error) {

      setError("Password reset failed");

    }
  };

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <img
          src="/logo.png"
          alt="Logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>
          Reset Password
        </h1>

        <p style={styles.subtitle}>
          Enter your new password
        </p>

        {message && (
          <div style={styles.successBox}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
          >
            Reset Password
          </button>

        </form>

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
    width: "110px",
    marginBottom: "20px",
  },

  title: {
    color: "#198754",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#555",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#198754",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },

  successBox: {
    backgroundColor: "#d1e7dd",
    color: "#0f5132",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  errorBox: {
    backgroundColor: "#f8d7da",
    color: "#842029",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
};

export default ResetPassword;