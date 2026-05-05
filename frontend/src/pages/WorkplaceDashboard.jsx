import { useEffect, useState } from "react";
import API from "../api";

function WorkplaceDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]); // Added missing state
  const [scores, setScores] = useState({});
  const [activeEvaluation, setActiveEvaluation] = useState(null);
  const [comments, setComments] = useState({});
  const [submittedEvaluations, setSubmittedEvaluations] = useState({});
  const [savedEvaluations, setSavedEvaluations] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [activePage, setActivePage] = useState("home");

  // 1. Fetch Placements
  // 🔹 Fetch students assigned to this workplace supervisor
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("PLACEMENTS DATA:", res.data);

      // filter only workplace supervisor students
      const filtered = res.data.filter(
        (p) => p.workplace_supervisor === parseInt(localStorage.getItem("user_id"))
      );

      console.log("FILTERED:", filtered);

      setPlacements(filtered);
    } catch (error) {
      console.log("PLACEMENT ERROR:", error);
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

      console.log("CRITERIA:", res.data);

      setCriteria(res.data.filter(c => c.is_active)); // Only fetch active criterias
    } catch (error) {
      console.log("CRITERIA ERROR:", error);
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

     // ✅ SAVE LOCALLY
    setSavedEvaluations((prev) => ({
      ...prev,
      [placementId]: {
        scores: scores[placementId],
        comments: comments[placementId],
      },
    }));

// mark as submitted
setSubmittedEvaluations((prev) => ({
  ...prev,
  [placementId]: true,
})); 

  // close the form
setActiveEvaluation(null);

alert("Evaluation submitted successfully!");
    } catch (error) {
      if (
  error.response?.data?.non_field_errors &&
  error.response.data.non_field_errors[0].includes("unique")
) {
  alert("Already submitted. You can edit next.");

  setSubmittedEvaluations((prev) => ({
    ...prev,
    [placementId]: true,
  }));
   return;
}
    }
  };


  return (
   <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>

  {/* 🔷 HEADER */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    backgroundColor: "#2c3e50",
    color: "#fff"
  }}>
    <div>
      <h2 style={{ margin: 0 }}>Dashboard</h2>
      <small>Welcome User</small>
    </div>

    <button
      onClick={() => setShowMenu(!showMenu)}
      style={{
        fontSize: "20px",
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer"
      }}
    >
      ☰
    </button>
  </div>

  {/* 🔷 CONTENT */}
  <div style={{ padding: "20px" }}></div>

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
{!submittedEvaluations[p.id] ? (
  <button onClick={() => setActiveEvaluation(p.id)}>
    Add Evaluation
  </button>
) : (
  <>
    <p style={{ color: "green", fontWeight: "bold" }}>
      ✅ Evaluation Submitted
    </p>
  

    <button
  onClick={() => {
    setSubmittedEvaluations((prev) => ({
      ...prev,
      [p.id]: false,
    }));

    // ✅ LOAD PREVIOUS DATA
    const saved = savedEvaluations[p.id];
    if (saved) {
      setScores((prev) => ({
        ...prev,
        [p.id]: saved.scores,
      }));

      setComments((prev) => ({
        ...prev,
        [p.id]: saved.comments,
      }));
    }

    setActiveEvaluation(p.id);
  }}
>
  Edit Evaluation
</button>
  </>
)}




              {/* ✅ SHOW FORM ONLY WHEN CLICKED */}
              {activeEvaluation === p.id && !submittedEvaluations[p.id] &&(
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
                              value={scores[p.id]?.[c.id] || ""}
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