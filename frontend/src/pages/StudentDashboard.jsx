import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {
  // Adding a menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("home");

  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  // NEW: Store student's placement
  const [placement, setPlacement] = useState(null);

  // NEW: store form inputs for weekly log
  const [formData, setFormData] = useState({
    week_number: "",
    tasks: "",
    challenges: "",
    attendance_days: 5,
  });

  const menuItemStyle = {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    marginBottom: "5px",
    transition: "0.2s",
  };

  const cardStyle = {
  flex: "1",
  minWidth: "120px",   // reduced from 150+
  maxWidth: "120px",   // prevents cards from stretching too big
  background: "#ebc6eb",  // lighter background
  padding: "10px",     // reduced padding
  borderRadius: "8px",
  border: "1px solid #e97407",
  boxShadow: "0px 1px 4px hsla(0, 66%, 75%, 0.08)", // softer shadow
  textAlign: "center",
  fontSize: "14px"     // smaller text
};

  useEffect(() => {
    fetchApplications();
    fetchLogs();
    fetchEvaluations();
    fetchOrganizations();
    fetchPlacement();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("internships/applications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setApplications(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get("supervision/weeklylogs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLogs(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const res = await API.get("supervision/evaluations/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvaluations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("internships/organizations/");
      setOrganizations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const applyToOrganization = async (orgId) => {
    try {
      await API.post(
        "internships/applications/",
        { organization: orgId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Application submitted!");
      fetchApplications();
    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to apply");
    }
  };

  const fetchPlacement = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const myPlacement = res.data.find(
        (p) => p.student === parseInt(localStorage.getItem("user_id"))
      );
      setPlacement(myPlacement || null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitLog = async (e) => {
    e.preventDefault();
    try {
      await API.post(
        "supervision/weeklylogs/",
        {
          ...formData,
          placement: placement?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Weekly log submitted!");
      setFormData({
        week_number: "",
        tasks: "",
        challenges: "",
        attendance_days: 5,
      });
      fetchLogs();
    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to submit log");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
        INTERNSHIP  PLACEMENT  SYSTEM (ILES)
      </h1>

      <h2 style={{textAlign: "center", marginBottom: "5px" }}>Student Dashboard</h2>
      <p style={{textAlign: "center", fontWeight: "bold", marginTop: "0px" }}>Welcome, Student</p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            fontSize: "22px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        <span
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu
        </span>
      </div>

      {/* --- MENU SECTION FIXED --- */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            marginTop: "10px",
            background: "white",
            border: "1px solid #f35f5f",
            padding: "10px",
            width: "250px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            zIndex: 999,
          }}
        >
          <div style={menuItemStyle} onClick={() => setActiveView("home")}>
            🏠 Home
          </div>
          <div style={menuItemStyle} onClick={() => setActiveView("organizations")}>
            🏢 Organizations
          </div>
          <div style={menuItemStyle} onClick={() => setActiveView("applications")}>
            📝 My Applications
          </div>
          <div style={menuItemStyle} onClick={() => setActiveView("evaluations")}>
            📊 My Evaluations
          </div>
          <div style={menuItemStyle} onClick={() => setActiveView("logs")}>
            📘 Weekly Logs
          </div>
        </div>
      )}


        {activeView === "home" && (
          <>

  <div style={{
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
  flexWrap: "wrap",
}}>

  <div style={cardStyle}>
    <h4 style={{ margin: "5px 0" }}>📘 Logs</h4>
    <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0" }}>
       {logs.length}
    </p>
  </div>

  <div style={cardStyle}>
    <h4 style={{ margin: "5px 0" }}>✅Approved</h4>
    <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0" }}>
       {applications.length}
    </p>
  </div>

  <div style={cardStyle}>
    <h4 style={{ margin: "5px 0" }}>📝 Applications</h4>
    <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0" }}>
       <p>{applications.filter(a=>a.status==="approved").length}</p>
    </p>
  </div>

  <div style={cardStyle}>
    <h4 style={{ margin: "5px 0" }}>📊 Evaluations</h4>
    <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
       {evaluations.length}
    </p>
  </div>
  </div>


  
      {/* PLACEMENT STATUS SECTION */}
      <div style={{
        border: "2px solid #ee9714",
        padding: "15px",
        marginBottom: "25px",
        borderRadius: "10px",
        backgroundColor: "#fff8e1"  // soft highlight
   }}>
       <h2 style={{ textAlign: "center", marginTop: "0" }}>📍 My Placement</h2>   
        {placement ? (
          <>
            <p style={{textAlign: "center"}}><strong>Organization:</strong> {placement.organization_name || placement.organization}</p>
            <p style={{textAlign: "center"}}><strong>Status:</strong> {placement.status}</p>
            <p style={{textAlign: "center"}}><strong>Start Date:</strong> {placement.start_date || "Not set"}</p>
            <p style={{textAlign: "center"}}><strong>End Date:</strong> {placement.end_date || "Not set"}</p>
          </>
        ) : (
          <p style={{textAlign: "center"}}>You have not been placed yet.</p>
        )}
      </div>

      <hr />

      {/* WEEKLY LOGS FORM */}
      <h2 style={{textAlign: "center"}}>Add Weekly Log</h2>
      <form onSubmit={submitLog} style={{ textAlign: "center", border: "1px solid gray", padding: "10px", marginBottom: "20px" }}>
        <input
          type="number"
          name="week_number"
          placeholder="Week Number"
          value={formData.week_number}
          onChange={handleChange}
          required
        />
        <br /><br />
        <textarea
          name="tasks"
          placeholder="Tasks done"
          value={formData.tasks}
          onChange={handleChange}
          required
        />
        <br /><br />
        <textarea
          name="challenges"
          placeholder="Challenges faced"
          value={formData.challenges}
          onChange={handleChange}
        />
        <br /><br />
        <input
          type="number"
          name="attendance_days"
          value={formData.attendance_days}
          onChange={handleChange}
        />
        <br /><br />
        <button type="submit">Submit Log</button>
      </form>

      <hr />

      {/* MY WEEKLY LOGS LIST */}
      <h2 style={{textAlign: "center"}}>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p style={{textAlign: "center"}}>No logs yet</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
            <p style={{textAlign: "center"}}>Week: {log.week_number}</p>
            <p style={{textAlign: "center"}}>Organization: {log.organization_name}</p>
            <p style={{textAlign: "center"}}>Tasks: {log.tasks}</p>
            <p style={{textAlign: "center"}}> Status: 
  <span style={{
    color: log.status === "reviewed" ? "green" : "orange",
    fontWeight: "bold"
  }}>
    {log.status === "reviewed" ? "Reviewed ✅" : "Pending ⏳"}
  </span></p>
          </div>
        ))
      )}

            <div style={{
  marginTop: "30px",
  padding: "15px",
  backgroundColor: "#f9f9f9",
  borderLeft: "5px solid #007bff",
  borderRadius: "6px"
}}>
  <h3>Important Notes</h3>

  <p>• At least <strong>8 weekly logs</strong> should be submitted for this placement.</p>

  <p>• This placement will be evaluated based on <strong>evaluation criteria</strong> including performance, punctuality, and professionalism.</p>

  <p>• Ensure all logs are submitted on time and accurately reflect your weekly activities.</p>
</div>

       </>
      )}

      {activeView === "weekly logs" && (
  <>

            {/* MY WEEKLY LOGS LIST */}
      <h2 style={{textAlign: "center"}}>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p style={{textAlign: "center"}}>No logs yet</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
            <p style={{textAlign: "center"}}>Week: {log.week_number}</p>
            <p style={{textAlign: "center"}}>Organization: {log.organization_name}</p>
            <p style={{textAlign: "center"}}>Tasks: {log.tasks}</p>
            <p style={{textAlign: "center"}}>Status: {log.status}</p>
          </div>
        ))
      )}
     </>
  )}

{activeView === "applications" && (
  <>
            {/* APPLICATIONS */}
      <h2 style={{textAlign: "center"}}>My Applications</h2>
      {applications.length === 0 ? (
        <p style={{textAlign: "center"}}>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} style={{ border: "1px solid blue", margin: "10px", padding: "10px" }}>
            <p style={{textAlign: "center"}}><strong>Organization:</strong> {app.organization_name || app.organization}</p>
            <p style={{textAlign: "center"}}><strong>Status:</strong> {app.status}</p>
          </div>
        ))
      )}
        </>
)} 

{activeView === "evaluations" && (
  <>

      {/* EVALUATIONS */}
      <h2 style={{textAlign: "center"}}>My Evaluations</h2>
      {evaluations.length === 0 ? (
        <p style={{textAlign: "center"}}>No evaluations yet</p>
      ) : (
        evaluations.map((ev) => (
          <div key={ev.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
            <p style={{textAlign: "center"}}>Supervisor: {ev.supervisor_name} ({ev.supervisor_type})</p>
            <p style={{textAlign: "center"}}>Score: {ev.score}</p>
            <p style={{textAlign: "center"}}>Comments: {ev.comments}</p>
            <p style={{textAlign: "center"}}>Final Grade: {ev.final_grade || "Not finalised"}</p>
          </div>
        ))
      )}
      </>
)} 

      <hr />


  {activeView === "organizations" && (
    <>
      {/* ORGANIZATIONS */}
      <h2 style={{textAlign: "center"}}>Available Organizations</h2>
      {organizations.length === 0 ? (
        <p style={{textAlign: "center"}}>No organizations available</p>
      ) : (
        organizations.map((org) => (
          <div key={org.id} style={{ border: "1px solid purple", margin: "10px", padding: "10px" }}>
            <p style={{textAlign: "center"}}><strong>Name:</strong> {org.name}</p>
            <p style={{textAlign: "center"}}><strong>Location:</strong> {org.location}</p>
            {placement ? (
              <button disabled style={{backgroundColor: "pink" }}>Already Placed</button>
            ) : (
              <button onClick={() => applyToOrganization(org.id)}>Apply</button>
            )}
          </div>
        ))
      )}
     </>
)} 
    </div>
  );
}

export default StudentDashboard;