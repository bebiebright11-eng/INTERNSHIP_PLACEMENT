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

return (
  <div style={{ padding: "20px" }}>
    <h1>Workplace Supervisor Dashboard</h1>

    {placements.length === 0 ? (
      <p>No students assigned</p>
    ) : (
      placements.map((p) => (
        <div key={p.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
          <h3>Student: {p.student}</h3>
          <p>Organization: {p.organization}</p>
        </div>
      ))
    )}
  </div>
);
const fetchCriteria = async () => {
  try {
    const res = await API.get("supervision/evaluationcriteria/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setCriteria(res.data);
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchPlacements();
  fetchCriteria();
}, []);
<h4>Evaluation</h4>

{placements.map((p) => (
  <div key={p.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
    <h3>Student: {p.student}</h3>
    
    {/* Loop for criteria inputs */}
    {criteria.map((c) => (
      <div key={c.id}>
        <label>
          {c.name} (Max: {c.max_score})
        </label>
        <input
          type="number"
          min="0"
          max={c.max_score}
          onChange={(e) => handleScoreChange(p.id, c.id, e.target.value)}
        />
      </div>
    ))}

    {/* The button goes HERE: Outside the criteria map, but inside the placement div */}
    <button onClick={() => submitAllEvaluations(p.id)} style={{ marginTop: "10px" }}>
      Submit Evaluation
    </button>
  </div>
))}
  
const [scores, setScores] = useState({});
const handleScoreChange = (placementId, criteriaId, value) => {
  setScores((prev) => ({
    ...prev,
    [placementId]: {
      ...prev[placementId],
      [criteriaId]: parseInt(value),
    },
  }));
};
const submitEvaluation = async (placementId) => {
  try {
    const criteriaScores = Object.entries(scores[placementId] || {}).map(
      ([criteriaId, score]) => ({
        criteria: parseInt(criteriaId),
        score: score,
      })
    );

    await API.post(
      "supervision/evaluations/",
      {
        placement: placementId,
        supervisor_type: "workplace",
        comments: "Workplace evaluation submitted",
        criteria_scores: criteriaScores,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("Evaluation submitted!");
  } catch (error) {
    console.log(error.response?.data);
    alert("Failed to submit evaluation");
  }
};
