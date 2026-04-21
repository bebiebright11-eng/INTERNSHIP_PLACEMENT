import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);

  const fetchPlacements = async () => {
  try {
    const res = await API.get("internships/placements/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setPlacements(res.data);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    fetchPlacements();
  }, []);


  return (
    <div style={{ padding: "20px" }}>
      <h1>Academic Supervisor Dashboard</h1>
    </div>
  );
}

export default AcademicDashboard;