import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();  
  
  return (
    <div style={{ padding: "40px" }}>
      <h2>LOGIN</h2>
    </div>
  );
}

export default Login;
