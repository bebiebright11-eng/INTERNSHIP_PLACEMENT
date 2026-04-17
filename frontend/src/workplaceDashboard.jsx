import { useEffect, useState } from "react";
import API from "../api";


function WorkplaceDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Workplace Supervisor Dashboard</h1>
    </div>
  );
}

export default WorkplaceDashboard;
const [placements, setPlacements] = useState([]);

const fetchPlacements = async () => {
  try {
    const res = await API.get("internships/placements/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const filtered = res.data.filter(
  (p) => p.workplace_supervisor === parseInt(localStorage.getItem("user_id"))
);

setPlacements(filtered);

  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchPlacements();
}, []);
