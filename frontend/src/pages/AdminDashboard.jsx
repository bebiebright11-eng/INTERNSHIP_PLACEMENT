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

const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/");
      setPlacements(res.data);
    } catch (error) {
      console.log(error);
    }
  };

const fetchSupervisors = async () => {
    try {
      const res = await API.get("accounts/users/");
      setSupervisors(res.data);
    } catch (error) {
      console.log(error);
    }
  };  

useEffect(() => {
  fetchApplications();
  fetchPlacements();
  fetchSupervisors();
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

            {app.status === "pending" && (
      <>
        <button onClick={() => updateStatus(app.id, "approved")}>
          Approve
        </button>

        <button onClick={() => updateStatus(app.id, "rejected")}>
          Reject
        </button>
      </>
    )}
          </div>
         ))
       )}

      <h2>Placements</h2>

    {placements.length === 0 ? (
      <p>No placements yet</p>
    ) : (
      placements.map((p) => (
        <div key={p.id}>
          <p><strong>Student:</strong> {p.student}</p>
          <p><strong>Organization:</strong> {p.organization}</p>

          <select id={`workplace-${p.id}`}>
            <option>Select Workplace Supervisor</option>
            {supervisors
              .filter((u) => u.role === "workplace")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
          </select>


        </div>
      ))
    )}

    </div>    
  );
}

export default AdminDashboard;