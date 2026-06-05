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
const [selectedPlacement, setSelectedPlacement] = useState(null);
const [evaluations, setEvaluations] = useState([]);
const assignedCount = placements.length;
const evaluatedCount = Object.keys(submittedEvaluations).length;
const pendingCount = assignedCount - evaluatedCount;

const firstName = localStorage.getItem("first_name");

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
      const res = await API.get("supervision/criteria/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCriteria(res.data);
    } catch (error) {
      console.error("Error fetching criteria:", error);
    }
  };

  
   const fetchEvaluations = async () => {

  try {

    const res = await API.get(
      "supervision/evaluations/",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // ONLY workplace evaluations
    const workplaceEvaluations = res.data.filter(
      (ev) => ev.supervisor_type === "workplace"
    );

    setEvaluations(workplaceEvaluations);

    // 🔹 Track submitted evaluations
    const submitted = {};

    // 🔹 Store saved evaluation details
    const saved = {};

    workplaceEvaluations.forEach((ev) => {

      submitted[ev.placement] = true;

      // convert criteria_scores array into object
      const scoreMap = {};

      ev.criteria_scores.forEach((item) => {


      console.log(
  "EVALUATION FULL:",
  JSON.stringify(ev, null, 2)
);

        scoreMap[item.criteria] = item.score;

      });

      saved[ev.placement] = {

        id: ev.id,

        comments: ev.comments,

        scores: scoreMap,

      };

    });

    setSubmittedEvaluations(submitted);

    // 🔥 THIS WAS MISSING
    setSavedEvaluations(saved);

  } catch (error) {

    console.log("EVALUATIONS ERROR:", error);

  }
};

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
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

      console.log(
  "SAVED EVALUATION:",
  savedEvaluations[placementId]
);

console.log(
  "EVALUATION ID:",
  savedEvaluations[placementId]?.id
);
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

      console.log(
  JSON.stringify(
    {
      placement: placementId,
      supervisor_type: "workplace",
      comments: comments[placementId] || "",
      criteria_scores: criteriaScores,
    },
    null,
    2
  )
);
   const evaluationId = savedEvaluations[placementId]?.id;

const payload = {
  placement: placementId,
  supervisor_type: "workplace",
  score: 0,
  comments: comments[placementId] || "",
  criteria_scores: criteriaScores,
};

if (evaluationId) {
  await API.put(
    `supervision/evaluations/${evaluationId}/`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  alert("Evaluation updated successfully!");
} else {
  await API.post(
    "supervision/evaluations/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  alert("Evaluation submitted successfully!");
}

fetchEvaluations();
setActiveEvaluation(null);
 
    }catch (error) {

  console.log("FULL ERROR:", error);

  console.log("ERROR RESPONSE:", error.response);

  console.log("ERROR DATA:", error.response?.data);

  alert(
    JSON.stringify(
      error.response?.data || error.message,
      null,
      2
    )
  );

} 
  };


  const editButtonStyle = {
  background: "linear-gradient(135deg,#fd7e14,#f59f00)",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
};

  const primaryButton = {
  background: "linear-gradient(135deg,#198754,#20c997)",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};



  const menuButtonStyle = {
  backgroundColor: "#198754",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

const dropdownStyle = {
  position: "absolute",
  top: "60px",
  right: "0",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
  width: "220px",
  padding: "10px",
  zIndex: 1000,
};

const dropdownItemStyle = {
  padding: "12px",
  cursor: "pointer",
  borderRadius: "8px",
  marginBottom: "5px",
  fontWeight: "bold",
  color: "#198754",
  backgroundColor: "#f8f9fa",
};


  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    minWidth: "220px",
    flex: "1",
  };

  const cardTitleStyle = {
    color: "#666",
    marginBottom: "10px",
  };

  const cardNumberStyle = {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#198754",
  };


  const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  tableLayout: "fixed",
};

const thStyle = {
  backgroundColor: "#198754",
  color: "white",
  padding: "14px",
  textAlign: "left",
  fontSize: "15px",
  verticalAlign: "middle",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #eee",
  fontSize: "15px",
  color: "#333",
};

const actionButtonStyle = {
  backgroundColor: "#198754",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const detailsCardStyle = {
  marginTop: "20px",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

 const renderStudents = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#198754", marginBottom: "20px" }}>Evaluate Students Here</h1>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>Organization</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {placements.map((p) => {
              const isEvaluated = !!submittedEvaluations[p.id];

              return (
                <>
                  <tr key={p.id}>
                    <td style={tdStyle}>{p.student_name}</td>
                    <td style={tdStyle}>{p.organization_name}</td>

                    <td style={tdStyle}>
                     <span
                       style={{
                        backgroundColor:
                          isEvaluated
                            ? "#d1e7dd"
                            : "#fff3cd",
                      color:
                        isEvaluated
                            ? "#0f5132"
                            : "#856404",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {isEvaluated ? "Evaluated" : "Pending"}
                  </span>
                </td>

                    <td style={tdStyle}>
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
                  {selectedPlacement?.id === p.id && (
  <tr>
    <td colSpan="4">

      <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "25px",
        marginBottom: "20px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        borderLeft: "6px solid #198754",
      }}
      >
        <h4>Evaluation Details</h4>

        <p>
          <strong>Comments:</strong>{" "}
          {savedEvaluations[p.id]?.comments || "No comments"}
        </p>

        <h5>Scores:</h5>

        <ul>
          {Object.entries(
            savedEvaluations[p.id]?.scores || {}
          ).map(([criteriaId, score]) => {
            const criterion = criteria.find(
              (c) => c.id === parseInt(criteriaId)
            );

            return (
              <li key={criteriaId}>
                {criterion?.name}: {score}
              </li>
            );
          })}
        </ul>

      </div>

    </td>
  </tr>
)}

                  {activeEvaluation === p.id &&
                    !submittedEvaluations[p.id] && (
                      <tr>
                        <td colSpan="4">

                          <div style={{ marginTop: "10px" }}>

                            <table style={tableStyle}>
                              <thead>
                                <tr>
                                  <th style={thStyle}>Criteria</th>
                                  <th style={thStyle}>Max Score</th>
                                  <th style={thStyle}>Awarded</th>
                                  
                                </tr>
                              </thead>

                              <tbody>
                                {criteria.map((c) => (
                                  <tr key={c.id}>
                                    <td style={tdStyle}>{c.name}</td>
                                    <td style={tdStyle}>{c.max_score}</td>

                                    <td>
                                      <input
                                        type="number"
                                        min="0"
                                        max={c.max_score}
                                        value={scores[p.id]?.[c.id] || ""}
                                        onChange={(e) =>
                                        handleScoreChange(p.id, c.id, e.target.value)
                                        }
                                        style={{
                                          width: "80px",
                                          padding: "10px",
                                          borderRadius: "8px",
                                          border: "1px solid #ddd",
                                          fontSize: "15px",
                                          textAlign: "center",
                                        }}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <textarea
                              rows="5"
                              placeholder="Enter supervisor comments..."
                              value={comments[p.id] || ""}
                              onChange={(e) =>
                                setComments((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "15px",
                                marginTop: "15px",
                                borderRadius: "12px",
                                border: "1px solid #ddd",
                                fontSize: "15px",
                                resize: "vertical",
                                }}
                              />

                            <button
                              onClick={() => submitEvaluation(p.id)}
                              style={{
                                marginTop: "15px",
                                background:
                                  "linear-gradient(135deg,#198754,#20c997)",
                                color: "white",
                                border: "none",
                                padding: "12px 25px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              Submit Evaluation
                            </button>

                          </div>

                        </td>
                      </tr>
                    )}
                </>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const renderEvaluations = () => {
  const evaluated = placements.filter(
    (p) => submittedEvaluations[p.id]
  );

  return (
    <div>
      <h2>My Evaluations</h2>

      {evaluated.length === 0 ? (
        <p>No evaluations submitted yet</p>
      ) : (
        <table style={tableStyle}>
        <thead>
  <tr>
    <th style={thStyle}>Student</th>
    <th style={thStyle}>Score / 60</th>
    <th style={thStyle}>Action</th>
  </tr>
</thead>

          <tbody>
  {evaluated.map((p) => {

    const totalScore = Object.values(
      savedEvaluations[p.id]?.scores || {}
    ).reduce((sum, score) => sum + score, 0);

    return (
    <tr key={p.id}>

  <td style={tdStyle}>
    {p.student_name}
  </td>

  <td style={tdStyle}>
    <strong>{totalScore} / 60</strong>
  </td>

  <td style={tdStyle}>
    <button
      style={actionButtonStyle}
      onClick={() => setSelectedPlacement(p)}
    >
      View Evaluation
    </button>
  </td>

</tr>
    );

  })}
</tbody>
        </table>
      )}

      {/* VIEW DETAILS SECTION */}
      {selectedPlacement && (
          <div style={detailsCardStyle}>
          <h3>Evaluation Details</h3>

          <p>
            <strong>Comments:</strong>{" "}
            {savedEvaluations[selectedPlacement.id]?.comments || "No comments"}
          </p>

          <h4>Scores</h4>

          <ul style={{ lineHeight: "2", paddingLeft: "20px" }}>
            {Object.entries(
              savedEvaluations[selectedPlacement.id]?.scores || {}
            ).map(([criteriaId, score]) => {
              const c = criteria.find(
                (x) => x.id === parseInt(criteriaId)
              );

              return (
                <li key={criteriaId}>
                  {c?.name}: {score}
                </li>
              );
            })}
          </ul>

        </div>
      )}
    </div>
  );
};


return (
  <div
    style={{
      padding: "30px",
      backgroundColor: "#f4f6f9",
      minHeight: "100vh",
      fontFamily: "Arial",
    }}
  >

    {/* HEADER */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    position: "relative",
  }}
>
  <div>
    <h1
      style={{
        margin: 0,
        color: "#198754",
        fontSize: "38px",
        fontWeight: "bold",
      }}
    >
      INTERNSHIP PLACEMENT SYSTEM (ILES)
    </h1>

    <h2
      style={{
        color: "#198754",
        marginTop: "10px",
        marginBottom: "5px",
      }}
    >
      Workplace Supervisor Dashboard
    </h2>

    <p
      style={{
        color: "#666",
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "0px",
      }}
    >
      Welcome, {firstName || "Supervisor"} 👋
    </p>
  </div>

  {/* MENU */}
  <div style={{ position: "relative" }}>
    <button
      style={menuButtonStyle}
      onClick={() => setShowMenu(!showMenu)}
    >
      ☰ Menu
    </button>

    {showMenu && (
      <div style={dropdownStyle}>
        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActivePage("home");
            setShowMenu(false);
          }}
        >
          Home
        </div>

        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActivePage("students");
            setShowMenu(false);
          }}
        >
          My Students
        </div>

        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActivePage("evaluations");
            setShowMenu(false);
          }}
        >
          My Evaluations
        </div>
      </div>
    )}
  </div>
</div>
      <div style={{ display: "flex" }}>
        
        {/* 🔷 MAIN CONTENT */}
        <div style={{ flex: 1, padding: "20px" }}>


  {/* SUMMARY CARDS */}
  <div
    style={{
      display: "flex",
      gap: "20px",
      marginBottom: "25px",
      flexWrap: "wrap",
    }}
  >

    <div
      style={{
        flex: 1,
        minWidth: "220px",
        background:
          "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        color: "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>
        Assigned Students
      </h3>

      <h1 style={{ margin: 0 }}>
        {assignedCount}
      </h1>
    </div>

    <div
      style={{
        flex: 1,
        minWidth: "220px",
        background:
          "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        color: "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>
        Evaluated
      </h3>

      <h1 style={{ margin: 0 }}>
        {evaluatedCount}
      </h1>
    </div>

    <div
      style={{
        flex: 1,
        minWidth: "220px",
        background:
          "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
        color: "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>
        Pending
      </h3>

      <h1 style={{ margin: 0 }}>
        {pendingCount}
      </h1>
    </div>

  </div>

          {activePage === "home" && (
            <div>

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
                        background: "#fff",
                        borderRadius: "18px",
                        padding: "25px",
                        marginBottom: "20px",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                        borderLeft: "6px solid #198754",
                      }}
                    >
                      <h3 style={{marginBottom: "10px",color: "#198754",fontSize: "24px",}}>
                       {p.student_name}
                      </h3>
                      <p style={{color: "#555",marginBottom: "20px",fontSize: "16px"}}>
                      <strong>Organization:</strong> {p.organization_name}
                      </p>

                      {!submittedEvaluations[p.id] ? (
                        <button 
                        style={primaryButton}
                        onClick={() => setActiveEvaluation(p.id)}
                        >
                          Add Evaluation
                        </button>
                      ) : (
                        <>
                          <p 
                            style={{
                              display: "inline-block",
                              backgroundColor: "#d1e7dd",
                              color: "#0f5132",
                              padding: "10px 16px",
                              borderRadius: "20px",
                              fontWeight: "bold",
                              marginBottom: "15px",
                            }}
                          >✅ Evaluation Submitted
                          </p>

                          {/* 🔷 EDIT BUTTON */}
                          <button
                             style={editButtonStyle}
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

                      {/* IMPORTANT: FORM MUST BE INSIDE MAP (THIS FIXES YOUR CRASH) */}
                      {activeEvaluation === p.id && !submittedEvaluations[p.id] && (
                        <div style={{ marginTop: "10px" }}>
                          
                          <table style={tableStyle}>
                            <thead>
                              <tr>
                                <th style={thStyle}>Criteria</th>
                                <th style={thStyle}>Maximum Marks</th>
                                <th style={thStyle}>Awarded Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {criteria.map((c) => (
                                <tr key={c.id}>
                                  <td style={tdStyle}>{c.name}</td>
                                  <td style={tdStyle}><strong>{c.max_score}</strong></td>
                                  <td style={tdStyle}>
                                    <input
                                      type="number"
                                      min="0"
                                      max={c.max_score}
                                      value={scores[p.id]?.[c.id] || ""}
                                      onChange={(e) =>
                                        handleScoreChange(p.id, c.id, e.target.value)
                                      }
                                        style={{
                                          width: "90px",
                                          padding: "10px",
                                          borderRadius: "10px",
                                          border: "1px solid #ced4da",
                                          textAlign: "center",
                                          fontWeight: "bold",
                                          fontSize: "15px",
                                        }}
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
                            style={{
                              width: "100%",
                              padding: "15px",
                              marginTop: "20px",
                              borderRadius: "12px",
                              border: "1px solid #ddd",
                              fontSize: "15px",
                              resize: "vertical",
                              backgroundColor: "#fafafa",
                            }}

                          />

                          <button
                            onClick={() => submitEvaluation(p.id)}
                            style={{
                              marginTop: "20px",
                              background:
                                "linear-gradient(135deg,#198754,#20c997)",
                              color: "white",
                              border: "none",
                              padding: "12px 25px",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              fontSize: "15px",
                            }}
                          >
                            Submit Evaluation
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

{/* 🔷 IMPORTANT NOTES */}
<div
  style={{
    marginTop: "30px",
    backgroundColor: "#fff3cd",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #ffe69c",
    lineHeight: "1.8",
  }}
>
  <h4
    style={{
      color: "#856404",
      marginBottom: "15px",
    }}
  >
    Important Notes
  </h4>

  <ul style={{ paddingLeft: "20px", color: "#333" }}>
    <li>
      Student evaluations should be conducted towards the end of the
      internship period, after sufficient observation of the student's
      conduct, professional behaviour, communication skills, teamwork,
      punctuality, and overall performance at the workplace.
    </li>

    <li style={{ marginTop: "10px" }}>
      Ensure that the marks awarded for each evaluation criterion
      accurately reflect the student's actual performance, level of
      participation, and demonstrated abilities during the internship.
    </li>

    <li style={{ marginTop: "10px" }}>
      Evaluate students objectively and fairly. Scores should be based
      on observed evidence and workplace performance rather than personal
      relationships, assumptions, or favoritism.
    </li>

    <li style={{ marginTop: "10px" }}>
      Carefully review each criterion before assigning marks and ensure
      that the scores awarded are within the maximum marks specified for
      each evaluation criterion.
    </li>
  </ul>
</div>
            </div>
          )}
          {activePage === "students" && (
  <div style={{ padding: "20px" }}>
    {renderStudents()}
  </div>
)}
{activePage === "evaluations" && (
  <div style={{ padding: "20px" }}>
    {renderEvaluations()}
  </div>
)}

        </div>
      </div>
    </div>
  );
}

export default WorkplaceDashboard;