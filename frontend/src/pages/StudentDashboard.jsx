import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  //Stores students placement
  const [placement, setPlacement] = useState(null);

    // store form inputs for weekly log
const [formData, setFormData] = useState({
  placement: "",
  week_number: "",
  tasks: "",
  challenges: "",
  attendance_days: 5,
});
  
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
    const res = await API.get("internships/logs/", {
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

    const studentPlacement = res.data.find(
      (p) => p.student === parseInt(localStorage.getItem("user_id"))
    );

    setPlacement(studentPlacement);
  } catch (error) {
    console.log(error);
  }
};


  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Dashboard</h1>

      <h2>My Applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app.id}>
            <p>Organization: {app.organization}</p>
            <p>Status: {app.status}</p>
          </div>
        ))
      )}

      <h2>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p>No logs yet</p>
      ) : (
        logs.map((log) => (
          <div key={log.id}>
            <p>Week: {log.week_number}</p>
            <p>Tasks: {log.tasks}</p>
          </div>
        ))
      )}

      <h2>My Evaluations</h2>
      {evaluations.length === 0 ? (
        <p>No evaluations yet</p>
      ) : (
        evaluations.map((ev) => (
          <div key={ev.id}>
            <p>Score: {ev.score}</p>
            <p>Comments: {ev.comments}</p>
            <p>Final Grade: {ev.final_grade || "Not finalized"}</p>
          </div>
        ))
      )}
      <h2>Available Organizations</h2>
      {organizations.length === 0 ? (
        <p>No organizations available</p>
      ) : (
                organizations.map((org) => (
          <div key={org.id} style={{ border: "1px solid purple", margin: "10px", padding: "10px" }}
          >
            <p><strong>Name:</strong> {org.name}</p>
            <p><strong>Location:</strong> {org.location}</p>
            <button onClick={() => applyToOrganization(org.id)}>
              Apply
            </button>
          </div>
        ))
      )}
    </div>
  ); 
}
export default StudentDashboard;