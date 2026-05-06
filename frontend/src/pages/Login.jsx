import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  

  const handleLogin = async (e) => {
   if (e) e.preventDefault();
   setLoading(true);
   setError("");

   try{
    const res = await API.post("accounts/login/", {
      username: username,
      password: password,
    });
    console.log(res.data); 

    console.log("FULL RESPONSE:", res.data);
    console.log("ACCESS FIELD:", res.data.access);
  
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("token", res.data.access);
    localStorage.setItem("first_name", res.data.first_name);
    localStorage.setItem("last_name", res.data.last_name);



    const role = res.data.role.toLowerCase();
    if (role === "student") {
      setLoading(false);
      navigate("/student");
    } else if (role === "admin") {
      setLoading(false);
      navigate("/admin");
    } else if (role === "workplace") {
      setLoading(false);
      navigate("/workplace");
    } else if (role === "academic") {
      setLoading(false);
      navigate("/academic");
    } else {
      alert("Unknown role: " + role);
    }
   
    console.log(res.data);

   } catch (error) {
     if (error.response) {
       setError("Invalid credentials or account not activated");
     } else {
       setError("Network error. Please try again.");
     }
     setLoading(false);
   }
    
  }; 


  
  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>
{error && (
  <p style={{ color: "red" }}>
    {error}
  </p>
)}
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
<button type="submit" disabled={loading}>
  {loading ? "Logging in..." : "Login"}
</button>

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
