import { useState } from "react";
import API from "../api";

function ForgotPassword() {

  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await API.post(
        "accounts/password-reset/",
        {
          identifier,
        }
      );

      setMessage(res.data.message);

    } catch (error) {

      setMessage(
        error.response?.data?.detail ||
        "Failed to send reset link"
      );
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Forgot Password?</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Registration Number or Email"
          value={identifier}
          onChange={(e) =>
            setIdentifier(e.target.value)
          }
          required
        />

        <br /><br />

        <button type="submit">
          Send Reset Link
        </button>

      </form>

      <p>{message}</p>
    </div>
  );
}

export default ForgotPassword;