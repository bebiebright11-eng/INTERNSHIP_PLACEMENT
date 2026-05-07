import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scores, setScores] = useState({});
  const [logs, setLogs] = useState({});

  const [editingPlacement, setEditingPlacement] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [showMenu, setShowMenu] = useState(false);

  // --- Data Fetching Functions ---



  const menuButtonStyle = {
  backgroundColor: "#198754",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px"
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
  zIndex: 1000
};

const dropdownItemStyle = {
  padding: "12px",
  cursor: "pointer",
  borderRadius: "8px",
  marginBottom: "5px",
  fontWeight: "bold",
  color: "#198754",
  backgroundColor: "#f8f9fa"
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "15px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  minWidth: "220px",
  flex: "1"
};

const cardTitleStyle = {
  color: "#666",
  marginBottom: "10px"
};

const cardNumberStyle = {
  fontSize: "30px",
  fontWeight: "bold",
  color: "#198754"
};
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const filtered = res.data.filter(
        (p) => p.academic_supervisor === parseInt(localStorage.getItem("user_id"))
      );

      setPlacements(filtered);
    } catch (error) {
      console.log(error);
    }
  };

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

const fetchEvaluations = async () => {
  try {
    const res = await API.get("supervision/evaluations/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("EVALUATIONS FROM BACKEND:", res.data); // 👈 ADD THIS

    setEvaluations(res.data);
  } catch (error) {
    console.log(error);
  }
};

  // --- Event Handlers --- 

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
    console.log(error);
  }
};
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
      alert("Academic marks cannot exceed 20");
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

    alert("Final evaluation submitted successfully!");

    fetchEvaluations();
    setEditingPlacement(null);

  } catch (error) {
    
  console.log("FULL ERROR:", error);

  console.log("RESPONSE:", error.response);

  console.log("DATA:", error.response?.data);

  alert(JSON.stringify(error.response?.data));
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
      fontFamily: "Arial"
    }}
  >

    {/* HEADER */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        position: "relative"
      }}
    >

      <div>
        <h1
          style={{
            margin: 0,
            color: "#198754"
          }}
        >
          Academic Supervisor Dashboard
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: "10px"
          }}
        >
          Welcome {localStorage.getItem("username")}
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
              Evaluations
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
        flexWrap: "wrap"
      }}
    >

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>
          Assigned Students
        </h3>

        <p style={cardNumberStyle}>
          {placements.length}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>
          Evaluated Students
        </h3>

        <p style={cardNumberStyle}>
          {
            evaluations.filter(
              (ev) => ev.supervisor_type === "academic"
            ).length
          }
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>
          Pending Students
        </h3>

        <p style={cardNumberStyle}>
          {
            placements.length -
            evaluations.filter(
              (ev) => ev.supervisor_type === "academic"
            ).length
          }
        </p>
      </div>

    </div>


      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        placements.map((p) => {
const studentLogs = logs[p.id] || [];
const logCount = studentLogs.length;

const countedLogs = Math.min(logCount, 8);
const logScore = countedLogs * 2.5;




          const workplaceEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "workplace"
          );

          const academicEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "academic"
          );

          const workplaceScore = workplaceEval?.score || 0;

          const academicScore =
            academicEval?.score ||
            scores[p.id] ||
            0;

          const finalScore =
            academicEval?.final_grade ||
            (workplaceScore + logScore + academicScore);


          return (
            <div key={p.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
              <h3>Student: {p.student_name}</h3>
              <p>Organization: {p.organization_name}</p>


<h4>Workplace Evaluation</h4>
{workplaceEval ? (
  <div>
    <p><strong>Total Score:</strong> {workplaceEval.score} / 60</p>

    {/* ✅ ADD CRITERIA BREAKDOWN */}
    <h5>Criteria Breakdown</h5>
<div
  style={{
    marginTop: "15px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #ddd",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }}
>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "Arial"
    }}
  >
    <thead>
      <tr
        style={{
          backgroundColor: "#198754",
          color: "white",
          textAlign: "left"
        }}
      >
        <th style={{ padding: "12px" }}>Criteria</th>
        <th style={{ padding: "12px" }}>Marks</th>
      </tr>
    </thead>

    <tbody>
      {workplaceEval.criteria_scores?.map((item, index) => (
        <tr
          key={item.id}
          style={{
            backgroundColor:
              index % 2 === 0 ? "#f8f9fa" : "white"
          }}
        >
          <td
            style={{
              padding: "12px",
              borderBottom: "1px solid #ddd"
            }}
          >
            {item.criteria_name}
          </td>

          <td
            style={{
              padding: "12px",
              borderBottom: "1px solid #ddd",
              fontWeight: "bold",
              color: "#198754"
            }}
          >
            {item.score}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    <p><strong>Comments:</strong> {workplaceEval.comments}</p>
  </div>
) : (
  <p>No workplace evaluation yet</p>
)}


<h4>Weekly Logs</h4>

<p>Total Logs Submitted: {logCount}</p>
<p>Logs Counted (Max 8): {countedLogs}</p>
<p>Log Score: {logScore} / 20</p>

<ul>
  {studentLogs
  .sort((a, b) => a.week_number - b.week_number)
.map((log, index) => {

  const isReviewed = index < 8;

  return (
    <li key={log.id}>
      Week {log.week_number}: {log.tasks}

      <br />

      Status:
      <span style={{
        color: isReviewed ? "green" : "orange",
        fontWeight: "bold",
        marginLeft: "5px"
      }}>
        {isReviewed ? "Reviewed ✅" : "Pending ⏳"}
      </span>
    </li>
  );
})}
</ul>

{(!academicEval || editingPlacement === p.id) ? (
  <div>

    <h4>Academic Supervisor Marks</h4>

    <input
      type="number"
      min="0"
      max="20"
      placeholder="Enter marks out of 20"

      value={
        scores[p.id] ??
        ""
      }

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

    <h4>Final Score</h4>

    <p>{finalScore} / 100</p>

    <br />

    <button onClick={() => submitEvaluation(p.id)}>
      Submit Final Evaluation
    </button>

  </div>
) : (
  <div>

    <h4>Academic Evaluation</h4>

    <p
      style={{
        color: "green",
        fontWeight: "bold"
      }}
    >
      ✅ Final Evaluation Submitted
    </p>

    <p>
      <strong>Academic Marks:</strong>
      {" "}
      {academicEval.score} / 20
    </p>

    <p>
      <strong>Final Grade:</strong>
      {" "}
      {academicEval.final_grade} / 100
    </p>

<button
  onClick={() => {

    setEditingPlacement(p.id);

    setScores((prev) => ({
      ...prev,
      [p.id]: academicEval.score,
    }));

  }}
>
  Edit Evaluation
</button>

  </div>
)}


            </div>
          );
        })
      )}
    </div>
  );
}

export default AcademicDashboard;