import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {
  const [applications, setApplications] = useState([]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Dashboard</h1>
    </div>
  );
}

export default StudentDashboard;

