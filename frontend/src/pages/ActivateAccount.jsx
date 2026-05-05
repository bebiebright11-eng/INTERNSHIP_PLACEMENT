import { useState } from "react";

function ActivateAccount() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ padding: "40px" }}>
      <h2>Activate Account</h2>

      <form>
        <input
          type="text"
          placeholder="Enter Registration Number or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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