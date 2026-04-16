import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  useEffect(() => {
  fetchApplications();
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
  </div>
);
}

export default StudentDashboard;





