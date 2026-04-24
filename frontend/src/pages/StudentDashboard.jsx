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
        Internship Placement System (ILES)
      </h1>

      <h2 style={{ marginBottom: "5px" }}>Student Dashboard</h2>
      <p style={{ fontWeight: "bold", marginTop: "0px" }}>Welcome, Student</p>

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
            border: "1px solid #ccc",
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
      {/* PLACEMENT STATUS SECTION */}
      <div
        style={{
          border: "2px solid orange",
          padding: "10px",
          marginBottom: "20px",
          marginTop: "20px",
        }}
      >
        <h2>My Placement</h2>
        {placement ? (
          <>
            <p><strong>Organization:</strong> {placement.organization_name || placement.organization}</p>
            <p><strong>Status:</strong> {placement.status}</p>
            <p><strong>Start Date:</strong> {placement.start_date || "Not set"}</p>
            <p><strong>End Date:</strong> {placement.end_date || "Not set"}</p>
          </>
        ) : (
          <p>You have not been placed yet.</p>
        )}
      </div>

      <hr />

      {/* APPLICATIONS */}
      <h2>My Applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet or still loading...</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} style={{ border: "1px solid blue", margin: "10px", padding: "10px" }}>
            <p><strong>Organization:</strong> {app.organization_name || app.organization}</p>
            <p><strong>Status:</strong> {app.status}</p>
          </div>
        ))
      )}

      {/* WEEKLY LOGS FORM */}
      <h2>Add Weekly Log</h2>
      <form onSubmit={submitLog} style={{ border: "1px solid gray", padding: "10px", marginBottom: "20px" }}>
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
        <button type="submit" disabled={!placement}>
          Submit Log
        </button>
      </form>

      <hr />

      {/* MY WEEKLY LOGS LIST */}
      <h2>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p>No logs yet</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
            <p>Week: {log.week_number}</p>
            <p>Organization: {log.organization_name}</p>
            <p>Tasks: {log.tasks}</p>
            <p>Status: {log.status}</p>
          </div>
        ))
      )}

       </>
      )}

{activeView === "applications" && (
  <>
            {/* APPLICATIONS */}
      <h2>My Applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} style={{ border: "1px solid blue", margin: "10px", padding: "10px" }}>
            <p><strong>Organization:</strong> {app.organization_name || app.organization}</p>
            <p><strong>Status:</strong> {app.status}</p>
          </div>
        ))
      )}
        </>
)} 

{activeView === "evaluations" && (
  <>

      {/* EVALUATIONS */}
      <h2>My Evaluations</h2>
      {evaluations.length === 0 ? (
        <p>No evaluations yet</p>
      ) : (
        evaluations.map((ev) => (
          <div key={ev.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
            <p>Supervisor: {ev.supervisor_name} ({ev.supervisor_type})</p>
            <p>Score: {ev.score}</p>
            <p>Comments: {ev.comments}</p>
            <p>Final Grade: {ev.final_grade || "Not finalised"}</p>
          </div>
        ))
      )}
      </>
)} 

      <hr />


  {activeView === "organizations" && (
    <>
      {/* ORGANIZATIONS */}
      <h2>Available Organizations</h2>
      {organizations.length === 0 ? (
        <p>No organizations available</p>
      ) : (
        organizations.map((org) => (
          <div key={org.id} style={{ border: "1px solid purple", margin: "10px", padding: "10px" }}>
            <p><strong>Name:</strong> {org.name}</p>
            <p><strong>Location:</strong> {org.location}</p>
            {placement ? (
              <button disabled style={{ backgroundColor: "gray", cursor: "not-allowed" }}>Already Placed</button>
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