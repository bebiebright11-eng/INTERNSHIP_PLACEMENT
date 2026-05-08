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
  const [evaluations, setEvaluations] = useState([]);

  const firstName = localStorage.getItem("first_name");
  const lastName = localStorage.getItem("last_name");

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

  const fetchEvaluations = async () => {
  try {
    const res = await API.get("supervision/evaluations/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // workplace evaluations only
    const workplaceEvaluations = res.data.filter(
      (ev) => ev.supervisor_type === "workplace"
    );

    setEvaluations(workplaceEvaluations);

    // mark submitted evaluations
    const submitted = {};

    workplaceEvaluations.forEach((ev) => {
      submitted[ev.placement] = true;
    });

    setSubmittedEvaluations(submitted);

  } catch (error) {
    console.log("EVALUATIONS ERROR:", error);
  }
};

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
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

    // check if evaluation already exists
    const existingEvaluation = evaluations.find(
      (ev) => ev.placement === placementId
    );

    const payload = {
      placement: placementId,
      supervisor_type: "workplace",
      comments: comments[placementId] || "",
      score: 0,
      criteria_scores: criteriaScores,
    };

    if (existingEvaluation) {

      // UPDATE existing evaluation
      await API.put(
        `supervision/evaluations/${existingEvaluation.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Evaluation updated successfully ✅");

    } else {

      // CREATE new evaluation
      await API.post(
        "supervision/evaluations/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Evaluation submitted successfully ✅");
    }

    fetchEvaluations();

    setActiveEvaluation(null);

  } catch (error) {

    console.log("FULL ERROR:", error);

    console.log("RESPONSE:", error.response);

    console.log("DATA:", error.response?.data);

    alert(JSON.stringify(error.response?.data));
  }
};

  // --- Styles ---

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

 const renderStudents = () => {
  return (
    <div>
      <h2>My Students</h2>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        <table style={{ width: "100%" }}>
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
                <>
                  <tr key={p.id}>
                    <td>{p.student_name}</td>
                    <td>{p.organization_name}</td>

                    <td>
                      {isEvaluated ? "Evaluated" : "Pending"}
                    </td>

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
                  {selectedPlacement?.id === p.id && (
  <tr>
    <td colSpan="4">

      <div
        style={{
          background: "#f9f9f9",
          padding: "15px",
          marginTop: "10px",
          borderRadius: "8px",
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

                            <table style={{ width: "100%" }}>
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
                                          handleScoreChange(
                                            p.id,
                                            c.id,
                                            e.target.value
                                          )
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
                              style={{
                                width: "100%",
                                marginTop: "10px",
                              }}
                            />

                            <button
                              onClick={() => submitEvaluation(p.id)}
                              style={{ marginTop: "10px" }}
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
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {evaluated.map((p) => (
              <tr key={p.id}>
                <td>{p.student_name}</td>
                <td>{p.organization_name}</td>
                <td>Evaluated</td>

                <td>
                  <button onClick={() => setSelectedPlacement(p)}>
                    View Evaluation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* VIEW DETAILS SECTION */}
      {selectedPlacement && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f4f4f4",
          borderRadius: "8px"
        }}>
          <h3>Evaluation Details</h3>

          <p>
            <strong>Comments:</strong>{" "}
            {savedEvaluations[selectedPlacement.id]?.comments || "No comments"}
          </p>

          <h4>Scores</h4>

          <ul>
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