import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();  

  const handleLogin = async (e) => {
   if (e) e.preventDefault();

   try{
    const res = await API.post("accounts/login/", {
      username: username,
      password: password,
    });
   }

};

  
  return (
    <div style={{ padding: "40px" }}>
      <h6>Login</h6>
    </div>
  );
}

export default Login;
