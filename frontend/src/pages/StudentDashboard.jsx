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
    </div>
  );
}

export default StudentDashboard;

