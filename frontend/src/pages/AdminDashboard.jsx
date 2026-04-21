import {useEffect, useState} from "react";
import API from "../api";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);


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

const updateStatus = async (id, status) => {
    try {
      await API.patch(
        `internships/applications/${id}/`,
        { status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Updated successfully!");
      fetchApplications(); // refresh data

    } catch (error) {
      console.log(error);
    }
  };


useEffect(() => {
  fetchApplications();
}, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Applications</h2>

      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app.id}>
            <p><strong>Student:</strong> {app.student}</p>
            <p><strong>Organization:</strong> {app.organization}</p>
            <p><strong>Status:</strong> {app.status}</p>
          </div>
         ))
       )}

    </div>    
  );
}

export default AdminDashboard;