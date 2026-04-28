import { useEffect, useState } from "react";
import API from "../api";

function WorkplaceDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]); // Added missing state
  const [scores, setScores] = useState({});

  // 1. Fetch Placements
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const userId = parseInt(localStorage.getItem("user_id"));
      const filtered = res.data.filter((p) => p.workplace_supervisor === userId);
      setPlacements(filtered);
    } catch (error) {
      console.error("Error fetching placements:", error);
    }
  };

  // 2. Fetch Criteria
  const fetchCriteria = async () => {
    try {
      const res = await API.get("supervision/evaluationcriteria/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCriteria(res.data);
    } catch (error) {
      console.error("Error fetching criteria:", error);
    }
  };

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
  }, []);

  // 3. Handle Score Changes
  const handleScoreChange = (placementId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [placementId]: {
        ...prev[placementId],
        [criteriaId]: parseInt(value) || 0,
      },
    }));
  };

  // 4. Submit Evaluation
  const submitEvaluation = async (placementId) => {
    try {
      const criteriaScores = Object.entries(scores[placementId] || {}).map(
        ([criteriaId, score]) => ({
          criteria: parseInt(criteriaId),
          score: score,
        })
      );

      if (criteriaScores.length === 0) {
        alert("Please enter scores before submitting.");
        return;
      }

      await API.post(
        "supervision/evaluations/",
        {
          placement: placementId,
          supervisor_type: "workplace",
          comments: "Workplace evaluation submitted",
          criteria_scores: criteriaScores,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Evaluation submitted successfully!");
    } catch (error) {
      console.error("BACKEND ERROR:", error.response?.data);
      alert("Failed to submit: " + JSON.stringify(error.response?.data));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Workplace Supervisor Dashboard</h1>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        <div>
          <h4>Student Evaluations</h4>
          {placements.map((p) => (
            <div key={p.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}>
              <h3>Student: {p.student}</h3>
              <p><strong>Organization:</strong> {p.organization}</p>

              <div style={{ background: "#f9f9f9", padding: "10px", marginTop: "10px" }}>
                {criteria.map((c) => (
                  <div key={c.id} style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block" }}>
                      {c.name} (Max: {c.max_score})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={c.max_score}
                      placeholder="Enter score"
                      onChange={(e) => handleScoreChange(p.id, c.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => submitEvaluation(p.id)} 
                style={{ marginTop: "15px", padding: "8px 16px", cursor: "pointer" }}
              >
                Submit Evaluation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkplaceDashboard;