import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function ResetPassword() {

  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      await API.post(
        `accounts/reset-password-confirm/${uid}/${token}/`,
        {
          password: password
        }
      );

      setMessage("Password reset successful");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {

      setError("Invalid or expired reset link");

    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h2>Reset Password</h2>

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">
          Reset Password
        </button>

      </form>

    </div>
  );
}

export default ResetPassword;