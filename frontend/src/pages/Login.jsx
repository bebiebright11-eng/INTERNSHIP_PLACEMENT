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

    console.log("FULL RESPONSE:", res.data);
    console.log("ACCESS FIELD:", res.data.access);
    console.log("TOKEN FIELD:", res.data.token);

    localStorage.setItem("access", res.data.access);
    

    console.log("STORED:", localStorage.getItem("access"));
    

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
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
<button type="submit">Login</button>

<p>
  Don't have an account?{" "}
  <span 
    onClick={() => navigate("/activate")} 
    style={{ color: "blue", cursor: "pointer" }}
  >
    Activate here
  </span>
</p>
</form>
    </div>
  );
}

export default Login;
