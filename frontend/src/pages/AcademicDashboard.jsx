import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scores, setScores] = useState({});
  const [logs, setLogs] = useState({});

  const [editingPlacement, setEditingPlacement] = useState(null);

  // --- Data Fetching Functions ---

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
    <div style={{ padding: "20px" }}>
      <h1>Academic Supervisor Dashboard</h1>

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
    <ul>
      {workplaceEval.criteria_scores?.map((item) => (
        <li key={item.id}>
          {item.criteria_name}: {item.score}
        </li>
      ))}
    </ul>

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