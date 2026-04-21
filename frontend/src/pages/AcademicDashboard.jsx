import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scores, setScores] = useState({});

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
  const handleScoreChange = (placementId, criteriaId, value) => {
  setScores((prev) => ({
    ...prev,
    [placementId]: {
      ...prev[placementId],
      [criteriaId]: parseInt(value),
    },
  }));
};


  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Academic Supervisor Dashboard</h1>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        placements.map((p) => {
          const workplaceEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "workplace"
          );

          // This return was missing - it's required for the map function to output JSX
          return (
            <div key={p.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
              <h3>Student: {p.student}</h3>
              <p>Organization: {p.organization}</p>
              <h4>Workplace Evaluation</h4>

              {workplaceEval ? (
                <div>
                  <p>Total Score: {workplaceEval.score}</p>
                  <p>Comments: {workplaceEval.comments}</p>
                </div>
              ) : (
                <p>No workplace evaluation yet</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default AcademicDashboard;