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

    localStorage.setItem("token", res.data.access);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("user_id", res.data.user_id); 

    alert("SUCCESS: Logged in as " + res.data.role);

    const role = res.data.role.toLowerCase();
    if (role === "student") {
      navigate("/student");
    } else if (role === "admin") {
      navigate("/admin");
    } else if (role === "workplace") {
      navigate("/workplace");
    } else if (role === "academic") {
      navigate("/academic");
    } else {
      alert("Unknown role: " + role);
    }
   
    console.log(res.data);

   } catch (error) {
     if (error.response) {
       alert("DJANGO ERROR: " + JSON.stringify(error.response.data));
     } else {
       alert("NETWORK ERROR: 1. Restart Vite terminal. 2. Ensure Django is running.");
     }
     console.log(error);
   }
    
  }; 




  
  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>
    </div>
  );
}

export default Login;