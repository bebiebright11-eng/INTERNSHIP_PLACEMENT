import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  return (
    <div style={{ padding: "20px" }}>
      <h1>Academic Supervisor Dashboard</h1>
    </div>
  );
}

export default AcademicDashboard;