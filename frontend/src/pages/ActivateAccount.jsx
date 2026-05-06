import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function ActivateAccount() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();



  const handleActivate = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("accounts/activate/", {
      username: username,
      password: password,
      first_name: firstName,
      last_name: lastName
    });

    alert("Account activated successfully");

    navigate("/login");

  } catch (error) {
    if (error.response) {
      alert(JSON.stringify(error.response.data));
    } else {
      alert("Network error");
    }
  }
};

  return (
    <div style={{ padding: "40px" }}>
      <h2>Activate Account</h2>

      <form onSubmit={handleActivate}>
        <input
          type="text"
          placeholder="Enter Reg.No or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Activate</button>
      </form>
    </div>
  );
}

export default ActivateAccount;