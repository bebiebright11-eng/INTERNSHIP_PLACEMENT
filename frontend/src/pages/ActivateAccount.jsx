import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function ActivateAccount() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleActivate = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    try {

      const res = await API.post(
        "accounts/activate/",
        {
          username: username,
          password: password,
          first_name: firstName,
          last_name: lastName
        }
      );

      setMessage("Account activated successfully");

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (error) {

      if (error.response) {

        setError(
          error.response.data.error ||
          "Activation failed"
        );

      } else {

        setError("Network error");

      }
    }
  };

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <img
          src="/logo.png"
          alt="University Logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>
          Activate Account
        </h1>

        <p style={styles.subtitle}>
          Activate your internship account
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

        <form onSubmit={handleActivate}>

          <input
            type="text"
            placeholder="Registration Number / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
          >
            Activate Account
          </button>

        </form>

        <p style={styles.loginText}>
          Already activated?{" "}

          <span
            style={styles.loginLink}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>

        </p>

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
    marginBottom: "18px",
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
    marginTop: "5px",
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

  loginText: {
    marginTop: "20px",
    color: "#555",
  },

  loginLink: {
    color: "#198754",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default ActivateAccount;