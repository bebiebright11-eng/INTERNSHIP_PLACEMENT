import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
  fetchApplications();
  fetchLogs();
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


  </div>
);
}

export default StudentDashboard;





