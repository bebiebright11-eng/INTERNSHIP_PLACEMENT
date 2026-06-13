import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Footer from "../components/Footer";
import DashboardHeader from "../components/DashboardHeader";


function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scores, setScores] = useState({});
  const [logs, setLogs] = useState({});

  const [editingPlacement, setEditingPlacement] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showWorkplaceEval, setShowWorkplaceEval] = useState(null);
  const [showWeeklyLogs, setShowWeeklyLogs] = useState(null);
  const [showFinalEvaluation, setShowFinalEvaluation] = useState(null);
  const navigate = useNavigate();
  const firstName = localStorage.getItem("first_name");
  const lastName = localStorage.getItem("last_name");
  
  const token = localStorage.getItem("token");

const authHeader = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
  const handleLogout = () => {
  localStorage.clear();
  toast.success("Logged out successfully 👋");
  navigate("/");
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
    left: "0",
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


  const marksInputStyle = {
  width: "120px",
  padding: "14px",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center",
  border: "2px solid #198754",
  borderRadius: "12px",
  outline: "none",
  backgroundColor: "#f8fff9",
  color: "#198754",
  boxShadow: "0 3px 10px rgba(25,135,84,0.15)",
};

  const submitButtonStyle = {
  background: "linear-gradient(135deg,#198754,#20c997)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

  const editButtonStyle = {
  background: "linear-gradient(135deg,#fd7e14,#f59f00)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

  // --- Data Fetching Functions ---

  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", authHeader);

     

      setPlacements(res.data);
    } catch (error) {
      toast.error("Failed to load placements ❌");
    }
  };

  const fetchCriteria = async () => {
    try {
      const res = await API.get("internships/placements/", authHeader);

      setCriteria(res.data);
    } catch (error) {
       
  toast.error("Failed to load criteria ❌");
     
}
  };

  const fetchEvaluations = async () => {
    try {
      const res = await API.get("supervision/evaluations/", authHeader);

      
      setEvaluations(res.data);
    } catch (error) {
      toast.error("Failed to load evaluations ❌");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get("supervision/weeklylogs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const grouped = {};

      res.data.forEach((log) => {
        if (!grouped[log.placement]) {
          grouped[log.placement] = [];
        }
        grouped[log.placement].push(log);
      });

      setLogs(grouped);
    } catch (error) {
      toast.error("Failed to load weekly logs ❌");
    }
  };

  // --- Event Handlers ---

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
      const academicScore = scores[placementId] || 0;

      const academicEval = evaluations.find(
        (ev) =>
          ev.placement === placementId &&
          ev.supervisor_type === "academic"
      );

      if (academicScore > 20) {
        toast.error("Academic marks cannot exceed 20 ❌");
        return;
      }

      if (editingPlacement === placementId && academicEval?.id) {
        await API.put(
          `supervision/evaluations/${academicEval.id}/`,
          {
            placement: placementId,
            supervisor_type: "academic",
            score: academicScore,
            comments: "Academic final evaluation",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        await API.post(
          "supervision/evaluations/",
          {
            placement: placementId,
            supervisor_type: "academic",
            score: academicScore,
            comments: "Academic final evaluation",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      toast.success("Final evaluation submitted successfully ✅");

      fetchEvaluations();
      setEditingPlacement(null);
    } catch (error) {
  console.log("FULL ERROR:", error);
  console.log("STATUS:", error.response?.status);
  console.log("ERROR DATA:", error.response?.data);

  toast.error(
    error.response?.data?.detail ||
    error.response?.data?.error ||
    "Failed to submit evaluation"
  );
}
  };

  // --- Lifecycle ---

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
    fetchLogs();
  }, []);

  // --- Main Render ---

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
<DashboardHeader
  dashboardTitle="Academic Supervisor Dashboard"
  firstName={firstName}
/>

{/* MENU */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "30px",
  }}
>
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
          Evaluations
        </div>

        <div
          style={{
            ...dropdownItemStyle,
            color: "#dc3545",
          }}
          onClick={handleLogout}
        >
         🚪 Logout
        </div>
      </div>
    )}
  </div>
</div>
  


      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Assigned Students</h3>
          <p style={cardNumberStyle}>{placements.length}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Evaluated Students</h3>
          <p style={cardNumberStyle}>
            {
              evaluations.filter(
                (ev) => ev.supervisor_type === "academic"
              ).length
            }
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Pending Students</h3>
          <p style={cardNumberStyle}>
            {placements.length -
              evaluations.filter(
                (ev) => ev.supervisor_type === "academic"
              ).length}
          </p>
        </div>
      </div>

      {activePage === "home" && (
        <div>
          <h2
            style={{
              color: "#198754",
              marginBottom: "20px",
            }}
          >
            Assigned Students
          </h2>

          {placements.length === 0 ? (
            <p>No students assigned</p>
          ) : (
            placements.map((p) => {
              const studentLogs = logs[p.id] || [];
              const logCount = studentLogs.length;

              const countedLogs = Math.min(logCount, 8);
              const logScore = countedLogs * 2.5;

              const workplaceEval = evaluations.find(
                (ev) =>
                  ev.placement === p.id &&
                  ev.supervisor_type === "workplace"
              );

              const academicEval = evaluations.find(
                (ev) =>
                  ev.placement === p.id &&
                  ev.supervisor_type === "academic"
              );

              const workplaceScore = workplaceEval?.score || 0;

              const academicScore =
                academicEval?.score || scores[p.id] || 0;

              const finalScore =
                academicEval?.final_grade ||
                workplaceScore + logScore + academicScore;

              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "15px",
                    padding: "20px",
                    marginBottom: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3>Student: {p.student_name}</h3>
                  <p>Organization: {p.organization_name}</p>

                  {academicEval ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#d1e7dd",
                          color: "#0f5132",
                          padding: "10px 15px",
                          borderRadius: "20px",
                          fontWeight: "bold",
                       }}
                      >
                        ✅ Evaluated
                      </span>

                      <button
                        onClick={() =>
                          setExpandedStudent(
                            expandedStudent === p.id ? null : p.id
                          )
                        }
                        style={editButtonStyle}
                      >
                        Edit Evaluation
                      </button>
                    </div>
                  ) : (
                    <button
                    onClick={() =>
                      setExpandedStudent(
                        expandedStudent === p.id ? null : p.id
                      )
                    }
                    style={{
                      backgroundColor: "#198754",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginTop: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Evaluate Student
                  </button>
                )}

                  {expandedStudent === p.id && (
                    <div style={{ marginTop: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "20px",
                        }}
                      >
                      
                      <button
  onClick={() => {
    setShowWorkplaceEval(
      showWorkplaceEval === p.id ? null : p.id
    );

    setShowWeeklyLogs(null);
    setShowFinalEvaluation(null);
  }}
  style={menuButtonStyle}
>
  View Workplace Evaluation
</button>

<button
  onClick={() => {
    setShowWeeklyLogs(
      showWeeklyLogs === p.id ? null : p.id
    );

    setShowWorkplaceEval(null);
    setShowFinalEvaluation(null);
  }}
  style={menuButtonStyle}
>
  View Weekly Logs
</button>

<button
  onClick={() => {
    setShowFinalEvaluation(
      showFinalEvaluation === p.id ? null : p.id
    );

    setShowWorkplaceEval(null);
    setShowWeeklyLogs(null);
  }}
  style={menuButtonStyle}
>
  Give Final Evaluation
</button>

                      </div>

                      {showWorkplaceEval === p.id && (
                        <div>
                          <h4>Workplace Evaluation</h4>

                          {workplaceEval ? (
                            <div>
                              <p>
                                <strong>Total Score:</strong>{" "}
                                {workplaceEval.score} / 60
                              </p>

                              <h5>Criteria Breakdown</h5>

                              <div
                                style={{
                                  marginTop: "15px",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  border: "1px solid #ddd",
                                  width: "100%",
                                  maxWidth: "500px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              >
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontFamily: "Arial",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        backgroundColor: "#198754",
                                        color: "white",
                                        textAlign: "left",
                                      }}
                                    >
                                      <th style={{ padding: "12px" }}>
                                        Criteria
                                      </th>
                                      <th style={{ padding: "12px" }}>
                                        Marks
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {workplaceEval.criteria_scores?.map(
                                      (item, index) => (
                                        <tr
                                          key={item.id}
                                          style={{
                                            backgroundColor:
                                              index % 2 === 0
                                                ? "#f8f9fa"
                                                : "white",
                                          }}
                                        >
                                          <td
                                            style={{
                                              padding: "12px",
                                              borderBottom:
                                                "1px solid #ddd",
                                            }}
                                          >
                                            {item.criteria_name}
                                          </td>

                                          <td
                                            style={{
                                              padding: "12px",
                                              borderBottom:
                                                "1px solid #ddd",
                                              fontWeight: "bold",
                                              color: "#198754",
                                            }}
                                          >
                                            {item.score}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <p>
                                <strong>Comments:</strong>{" "}
                                {workplaceEval.comments}
                              </p>
                            </div>
                          ) : (
                            <p>No workplace evaluation yet</p>
                          )}
                        </div>
                      )}

                      {showWeeklyLogs === p.id && (
                        <div>
                          <h4>Weekly Logs</h4>

                          <p>Total Logs Submitted: {logCount}</p>
                          <p>Logs Counted (Max 8): {countedLogs}</p>
                          <p>Log Score: {logScore} / 20</p>

                          <ul>
                            {studentLogs
                              .sort(
                                (a, b) =>
                                  a.week_number - b.week_number
                              )
                              .map((log, index) => {
                                const isReviewed = index < 8;

                                return (
                                  <li key={log.id}>
                                    Week {log.week_number}: {log.tasks}

                                    <br />

                                    Status:
                                    <span
                                      style={{
                                        color: isReviewed
                                          ? "green"
                                          : "orange",
                                        fontWeight: "bold",
                                        marginLeft: "5px",
                                      }}
                                    >
                                      {isReviewed
                                        ? "Reviewed ✅"
                                        : "Pending ⏳"}
                                    </span>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      )}

                      {showFinalEvaluation === p.id && (
                        <div>
                          {!academicEval ||
                          editingPlacement === p.id ? (
                            <div>
                              <h4
                                style={{
                                color: "#198754",
                                marginBottom: "10px",
                              }}
                            >
                              Academic Supervisor Assessment
                            </h4>

                            <p
                              style={{
                                color: "#666",
                                marginBottom: "15px",
                              }}
                            >
                              Award marks based on your supervision visit, student presentation,
                              documentation quality, and overall internship performance.
                            </p>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "15px",
                                  marginBottom: "20px",
                                  marginTop: "15px",
                                }}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={scores[p.id] ?? ""}
                                  placeholder="0 - 20"
                                  style={marksInputStyle}
                                  onChange={(e) => {
                                  let value = parseInt(e.target.value) || 0;

                                  if (value < 0) value = 0;
                                  if (value > 20) value = 20;

                                  setScores((prev) => ({
                                    ...prev,
                                    [p.id]: value,
                                  }));
                                }}
                              />

                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                  color: "#198754",
                                }}
                              >
                                / 20
                              </span>
                            </div>

                              <h4>Final Score</h4>

                              <p>{finalScore} / 100</p>

                              <br />

                              <button
                                onClick={() => submitEvaluation(p.id)}
                                style={submitButtonStyle}
                              >
                                ✅ Submit Final Evaluation
                              </button>
                            </div>
                          ) : (
                            <div>
                              <h4>Academic Evaluation</h4>

                              <p
                                style={{
                                  color: "green",
                                  fontWeight: "bold",
                                }}
                              >
                                ✅ Final Evaluation Submitted
                              </p>

                              <p>
                                <strong>Academic Marks:</strong>{" "}
                                {academicEval.score} / 20
                              </p>

                              <p>
                                <strong>Final Grade:</strong>{" "}
                                {academicEval.final_grade} / 100
                              </p>

                              <button
                                style={editButtonStyle}
                                onClick={() => {
                                  setEditingPlacement(p.id);

                                  setScores((prev) => ({
                                    ...prev,
                                    [p.id]: academicEval.score,
                                  }));
                                }}
                              >
                                ✏️ Edit Evaluation
                              </button>
                            </div>
                          )}

                          
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activePage === "students" && (
  <div>
    <h2
      style={{
        color: "#198754",
        marginBottom: "20px",
      }}
    >
      My Students
    </h2>

    <div
      style={{
        backgroundColor: "white",
        borderRadius: "15px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        overflowX: "auto",
      }}
    >
      
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial",
        }}
      >
        
        <thead>
          <tr
            style={{
              backgroundColor: "#198754",
              color: "white",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "15px" }}>Student Name</th>
            <th style={{ padding: "15px" }}>Organization</th>
            <th style={{ padding: "15px" }}>Status</th>
          </tr>
        </thead>

        <tbody>
          {placements.map((p, index) => {
            const academicEval = evaluations.find(
              (ev) =>
                ev.placement === p.id &&
                ev.supervisor_type === "academic"
            );

            return (
              <tr
                key={p.id}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? "#f8f9fa" : "white",
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {p.student_name}
                </td>

                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {p.organization_name}
                </td>

                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                    fontWeight: "bold",
                    color: academicEval
                      ? "green"
                      : "orange",
                  }}
                >
                  {academicEval
                    ? "Evaluated ✅"
                    : "Pending ⏳"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}


{activePage === "evaluations" && (
  <div>
    <h2
      style={{
        color: "#198754",
        marginBottom: "20px",
      }}
    >
      Student Evaluations
    </h2>

    <div
      style={{
        backgroundColor: "white",
        borderRadius: "15px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#198754",
              color: "white",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "15px" }}>
              Student Name
            </th>

            <th style={{ padding: "15px" }}>
              Final Score
            </th>

            <th style={{ padding: "15px" }}>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {placements.map((p, index) => {
            const academicEval = evaluations.find(
              (ev) =>
                ev.placement === p.id &&
                ev.supervisor_type === "academic"
            );

            return (
              <tr
                key={p.id}
                style={{
                  backgroundColor:
                    index % 2 === 0
                      ? "#f8f9fa"
                      : "white",
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {p.student_name}
                </td>

                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                    fontWeight: "bold",
                    color: "#198754",
                  }}
                >
                  {academicEval
                    ? `${academicEval.final_grade} / 100`
                    : "Not Evaluated"}
                </td>

                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <button
                    onClick={() =>
                      setExpandedStudent(
                        expandedStudent === p.id
                          ? null
                          : p.id
                      )
                    }
                    style={{
                      backgroundColor: "#198754",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    View Full Evaluation
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* FULL EVALUATION VIEW */}
    {expandedStudent && (
      <div
        style={{
          marginTop: "30px",
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {placements
          .filter((p) => p.id === expandedStudent)
          .map((p) => {
            const studentLogs = logs[p.id] || [];

            const workplaceEval = evaluations.find(
              (ev) =>
                ev.placement === p.id &&
                ev.supervisor_type === "workplace"
            );

            const academicEval = evaluations.find(
              (ev) =>
                ev.placement === p.id &&
                ev.supervisor_type === "academic"
            );

            return (
              <div key={p.id}>
                <h3
                  style={{
                    color: "#198754",
                  }}
                >
                  {p.student_name} Full Evaluation
                </h3>

                <p>
                  <strong>Organization:</strong>{" "}
                  {p.organization_name}
                </p>

                <hr />

                <h4>Workplace Evaluation</h4>

                <p>
                  Score:{" "}
                  {workplaceEval?.score || 0} / 60
                </p>

                <p>
                  Comments:{" "}
                  {workplaceEval?.comments ||
                    "No comments"}
                </p>

                <hr />

                <h4>Weekly Logs</h4>

                <p>
                  Logs Submitted: {studentLogs.length}
                </p>

                <ul>
                  {studentLogs.map((log) => (
                    <li key={log.id}>
                      Week {log.week_number}:{" "}
                      {log.tasks}
                    </li>
                  ))}
                </ul>

                <hr />

                <h4>Academic Evaluation</h4>

                <p>
                  Academic Score:{" "}
                  {academicEval?.score || 0} / 20
                </p>

                <p>
                  <strong>Final Grade:</strong>{" "}
                  {academicEval?.final_grade || 0}
                  /100
                </p>
              </div>
            );
          })}
      </div>
    )}
  </div>
)}
<Footer />
    </div>
  );
}

export default AcademicDashboard;