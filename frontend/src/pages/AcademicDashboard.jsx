import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scores, setScores] = useState({});
  const [logs, setLogs] = useState({});

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

      setEvaluations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // --- Event Handlers --- 

  const fetchLogs = async () => {
  try {
    const res = await API.get("logs/", {
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
          supervisor_type: "academic",
          comments: "Final academic evaluation",
          criteria_scores: criteriaScores,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Final Evaluation submitted!");
    } catch (error) {
      console.log(error.response?.data);
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

const workplaceScore = workplaceEval?.score || 0;
const academicScore = scores[p.id] || 0;

const finalScore = workplaceScore + logScore + academicScore;

          const workplaceEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "workplace"
          );

          return (
            <div key={p.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
              <h3>Student: {p.student_name}</h3>
              <p>Organization: {p.organization_name}</p>

              <h4>Workplace Evaluation</h4>
              {workplaceEval ? (
                <div>
                  <p>Total Score: {workplaceEval.score}</p>
                  <p>Comments: {workplaceEval.comments}</p>
                </div>
              ) : (
                <p>No workplace evaluation yet</p>
              )}

<h4>Weekly Logs</h4>

<p>Total Logs Submitted: {logCount}</p>
<p>Logs Counted (Max 8): {countedLogs}</p>
<p>Log Score: {logScore} / 20</p>

<ul>
  {studentLogs.map((log) => (
    <li key={log.id}>
      Week {log.week}: {log.description}
    </li>
  ))}
</ul>

<h4>Academic Supervisor Marks</h4>

<input
  type="number"
  min="0"
  max="20"
  placeholder="Enter marks out of 20"
  onChange={(e) =>
    setScores((prev) => ({
      ...prev,
      [p.id]: parseInt(e.target.value),
    }))
  }
/>
              <br />

              <button onClick={() => submitEvaluation(p.id)}>
                Submit Final Evaluation
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AcademicDashboard;