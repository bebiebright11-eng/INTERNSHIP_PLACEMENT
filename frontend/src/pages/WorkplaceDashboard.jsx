import { useEffect, useState } from "react";
import API from "../api";

function WorkplaceDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [activeEvaluation, setActiveEvaluation] = useState(null);
  const [comments, setComments] = useState({});
  const [submittedEvaluations, setSubmittedEvaluations] = useState({});
  const [savedEvaluations, setSavedEvaluations] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [selectedPlacement, setSelectedPlacement] = useState(null);


  const assignedCount = placements.length;
  const evaluatedCount = Object.keys(submittedEvaluations).length;
  const pendingCount = assignedCount - evaluatedCount;

  // 🔹 Fetch placements
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const filtered = res.data.filter(
        (p) =>
          p.workplace_supervisor ===
          parseInt(localStorage.getItem("user_id"))
      );

      setPlacements(filtered);
    } catch (error) {
      console.log("PLACEMENT ERROR:", error);
    }
  };

  // 🔹 Fetch criteria
  const fetchCriteria = async () => {
    try {
      const res = await API.get("supervision/criteria/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCriteria(res.data.filter((c) => c.is_active));
    } catch (error) {
      console.log("CRITERIA ERROR:", error);
    }
  };

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
  }, []);

  // 🔹 Handle score input
  const handleScoreChange = (placementId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [placementId]: {
        ...prev[placementId],
        [criteriaId]: parseInt(value) || 0,
      },
    }));
  };

  // 🔹 Submit evaluation
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
        comments: comments[placementId] || "",
        score: 0, // backend calculates real score
        criteria_scores: criteriaScores,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("Evaluation submitted and saved to database!");

    setSubmittedEvaluations((prev) => ({
      ...prev,
      [placementId]: true,
    }));

    setActiveEvaluation(null);

  } catch (error) {
    console.log("FULL ERROR:", error);
    console.log("RESPONSE:", error.response);
    console.log("DATA:", error.response?.data);
  }
};

  const renderStudents = () => {
  return (
    <div>
      <h2>My Students</h2>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {placements.map((p) => {
              const isEvaluated = !!submittedEvaluations[p.id];

              return (
                <tr key={p.id}>
                  <td>{p.student_name}</td>
                  <td>{p.organization_name}</td>
                  <td>{isEvaluated ? "Evaluated" : "Pending"}</td>
                  <td>
                    {isEvaluated ? (
                      <button onClick={() => setSelectedPlacement(p)}>
                        View
                      </button>
                    ) : (
                      <button onClick={() => setActiveEvaluation(p.id)}>
                        Evaluate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};


  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      
      {/* 🔷 HEADER */}
      <div style={{ padding: "15px", backgroundColor: "#2c3e50", color: "#fff" }}>
        <h1 style={{ margin: 0 }}>Workplace Supervisor Dashboard</h1>
      </div>

      {/* 🔷 WELCOME */}
      <div style={{ padding: "10px 15px", backgroundColor: "#34495e", color: "#fff" }}>
        <small>Welcome User</small>
      </div>

      {/* 🔷 MENU BUTTON */}
      <div style={{ padding: "10px 15px" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            fontSize: "26px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☰Menu
        </button>
      </div>

      <div style={{ display: "flex" }}>
        
        {/* 🔷 MAIN CONTENT */}
        <div style={{ flex: 1, padding: "20px" }}>

          {activePage === "home" && (
            <div>

              {/* 🔷 SUMMARY CARDS */}
              <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                <div style={{ flex: 1, padding: "15px", background: "#df7cf8c9" }}>
                  <h3>Assigned Students</h3>
                  <h2>{assignedCount}</h2>
                </div>

                <div style={{ flex: 1, padding: "15px", background: "#da81e6" }}>
                  <h3>Evaluated</h3>
                  <h2>{evaluatedCount}</h2>
                </div>

                <div style={{ flex: 1, padding: "15px", background: "#e478e7" }}>
                  <h3>Pending</h3>
                  <h2>{pendingCount}</h2>
                </div>
              </div>

              {/* 🔷 STUDENTS LIST */}
              {placements.length === 0 ? (
                <p>No students assigned</p>
              ) : (
                <div>
                  <h4>Student Evaluations</h4>

                  {placements.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        border: "1px solid #ccc",
                        margin: "10px 0",
                        padding: "15px",
                        borderRadius: "8px",
                      }}
                    >
                      <h3>{p.student_name}</h3>
                      <p><strong>Organization:</strong> {p.organization_name}</p>

                      {!submittedEvaluations[p.id] ? (
                        <button onClick={() => setActiveEvaluation(p.id)}>
                          Add Evaluation
                        </button>
                      ) : (
                        <>
                          <p style={{ color: "green" }}>✅ Evaluation Submitted</p>

                          {/* 🔷 EDIT BUTTON */}
                          <button
                            onClick={() => {
                              setSubmittedEvaluations((prev) => ({
                                ...prev,
                                [p.id]: false,
                              }));

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

                      {/* 🔴 IMPORTANT: FORM MUST BE INSIDE MAP (THIS FIXES YOUR CRASH) */}
                      {activeEvaluation === p.id && !submittedEvaluations[p.id] && (
                        <div style={{ marginTop: "10px" }}>
                          
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

              {/* 🔷 NOTES */}
              <div style={{ marginTop: "30px" }}>
                <h4>Important Notes</h4>
                <textarea
                  defaultValue="Only assigned students should be evaluated."
                  style={{ width: "100%", height: "100px" }}
                />
              </div>
            </div>
          )}
          {activePage === "students" && (
  <div style={{ padding: "20px" }}>
    {renderStudents()}
  </div>
)}

        </div>

        {/* 🔷 SIDEBAR */}
        {showMenu && (
          <div
            style={{
              width: "200px",
              backgroundColor: "#34495e",
              color: "#fff",
              padding: "15px",
            }}
          >
            <p onClick={() => setActivePage("home")}>Home</p>
            <p onClick={() => setActivePage("students")}>My Students</p>
            <p onClick={() => setActivePage("evaluations")}>My Evaluations</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkplaceDashboard;