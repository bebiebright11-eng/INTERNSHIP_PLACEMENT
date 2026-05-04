import { useEffect, useState } from "react";
import API from "../api";

function WorkplaceDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]); // Added missing state
  const [scores, setScores] = useState({});
  const [activeEvaluation, setActiveEvaluation] = useState(null);
  const [comments, setComments] = useState({});
  const [submittedEvaluations, setSubmittedEvaluations] = useState({});

  // 1. Fetch Placements
  // 🔹 Fetch students assigned to this workplace supervisor
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // filter only workplace supervisor students
      const filtered = res.data.filter(
        (p) => p.workplace_supervisor === parseInt(localStorage.getItem("user_id"))
      );

      setPlacements(filtered);
    } catch (error) {
      console.log(error);
    }
  };



  // 2. Fetch Criteria

  const fetchCriteria = async () => {
    try {
      const res = await API.get("supervision/criteria/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCriteria(res.data.filter(c => c.is_active)); // Only fetch active criterias
    } catch (error) {
      console.log(error);
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
      setSubmittedEvaluations((prev) => ({
  ...prev,
  [placementId]: true,
}));
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
              <h3>Student: {p.student_name}</h3>
              <p><strong>Organization:</strong> {p.organization_name}</p>
              {/* ✅ BUTTON */}
              <button onClick={() => setActiveEvaluation(p.id)}>
  Add Evaluation
              </button>

              {/* ✅ SHOW FORM ONLY WHEN CLICKED */}
              {activeEvaluation === p.id && (
                <div style={{ marginTop: "10px" }}>

                  {/* TABLE */}
                  <table style={{ width: "100%", marginTop: "10px" }}>
                    <thead>
                      <tr>
                        <th>Criteria</th>
                        <th>Max</th>
                        <th>Score</th>
                      </tr>
                    </thead>

                    <tbody>
                      {criteria.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.max_score}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={c.max_score}
                              onChange={(e) =>
                                handleScoreChange(p.id, c.id, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                 {/* COMMENTS */}
                  <textarea
                    placeholder="Write comments..."
                    value={comments[p.id] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    rows="4"
                    style={{ width: "100%", marginTop: "10px" }}
                  />

                  {/* FINAL SUBMIT */}
                  <button
                    onClick={() => submitEvaluation(p.id)}
                    style={{ marginTop: "10px" }}
                  >
                    Submit Evaluation
                  </button>

                </div>
              )}  
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkplaceDashboard;