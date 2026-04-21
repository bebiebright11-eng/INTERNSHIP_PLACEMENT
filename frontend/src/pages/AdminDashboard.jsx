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


useEffect(() => {
  fetchApplications();
}, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}

export default AdminDashboard;