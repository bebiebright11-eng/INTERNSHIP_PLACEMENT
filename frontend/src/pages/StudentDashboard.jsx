import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import Footer from "../components/Footer";

function StudentDashboard() {
  // Adding a menu
  const formRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("home");

  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [notification, setNotification] = useState(null);

  const [editingLog, setEditingLog] = useState(null);
  // NEW: Store student's placement
  const [placement, setPlacement] = useState(null);
  const firstName = localStorage.getItem("first_name");
  const navigate = useNavigate();



const handleLogout = () => {
  localStorage.clear();
  toast.success("Logged out successfully 👋");
  navigate("/");
};

  const getApprovedLogsCount = () => {
    return logs.filter(
      log => log.status === "approved"
    ).length;
  };

  const getLogScore = () => {
    const approved = getApprovedLogsCount();

    return Math.min(
      approved * 2.5,
      20
   );
  };


  const showMessage = (text, type = "success") => {
  setNotification({ text, type });

  // auto-hide after 3 seconds
  setTimeout(() => {
    setNotification(null);
  }, 3000);
};


  // NEW: store form inputs for weekly log
  const [formData, setFormData] = useState({
    week_number: "",
    tasks: "",
    challenges: "",
    attendance_days: 5,
    attachment: null,
  });


const handleEdit = (log) => {
  console.log("EDIT CLICKED:", log);

  setEditingLog(log);

  setFormData({
    week_number: log.week_number,
    tasks: log.tasks,
    challenges: log.challenges,
    attendance_days: log.attendance_days,
    attachment: null,
  });

  setTimeout(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};


  useEffect(() => {
    fetchApplications();
    fetchLogs();
    fetchEvaluations();
    fetchOrganizations();
    fetchPlacement();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("internships/applications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setApplications(res.data);
    } catch (error) {
      toast.error("Failed to load placement data ");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get("supervision/weeklylogs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLogs(res.data);
    } catch (error) {
      toast.error("Failed to load logs ");
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
      toast.error("Failed to load evaluations ");
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("internships/organizations/",{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
         },
        });
      setOrganizations(res.data);
    } catch (error) {
      toast.error("Failed to load organizations ");
    }
  };

  const applyToOrganization = async (orgId) => {
    try {
      await API.post(
        "internships/applications/",
        { organization: orgId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Application submitted successfully 🎉");
      fetchApplications();
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Failed to apply ");
    }
  };

  const deleteApplication = async (applicationId) => {

  const confirmed = window.confirm(
    "Are you sure you want to delete this application?"
  );

  if (!confirmed) return;

  try {
    await API.delete(
      `internships/applications/${applicationId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast.success("Application deleted successfully");

    fetchApplications();

  } catch (error) {
    console.log(error.response?.data);
    toast.error("Failed to delete application");
  }
};

  const hasApplied = (orgId) => {
  return applications.some(app => app.organization === orgId);
};

const fetchPlacement = async () => {
  try {
    const res = await API.get("internships/placements/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const userId = parseInt(localStorage.getItem("user_id"));

    const myPlacement = res.data.find(
      (p) => p.student === userId || p.student?.id === userId
    );

    // ✅ SHOW TOAST (PUT HERE)
    const shown = localStorage.getItem("placement_toast_shown");

    if (myPlacement && !shown) {
      toast.success(`🎉 You have been placed at ${myPlacement.organization_name}!`);
      localStorage.setItem("placement_toast_shown", "true");
    }

    setPlacement(myPlacement || null);

  } catch (error) {
    toast.error("Failed to load placement data ");
  }
};


const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleFileChange = (e) => {
  setFormData({
    ...formData,
    attachment: e.target.files[0],
  });
};

  const submitLog = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      data.append("week_number", formData.week_number);
      data.append("tasks", formData.tasks);
      data.append("challenges", formData.challenges);
      data.append("attendance_days", formData.attendance_days);
      data.append("placement", placement?.id);

      if (formData.attachment) {
        data.append("attachment", formData.attachment);
      }

      if (editingLog) {

        await API.patch(
          `supervision/weeklylogs/${editingLog.id}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

      } else {

        await API.post(
          "supervision/weeklylogs/",
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

      }
      toast.success(
        editingLog
          ? "Weekly log updated successfully ✅"
          : "Weekly log submitted successfully ✅"
      );

      setFormData({
        week_number: "",
        tasks: "",
        challenges: "",
        attendance_days: 5,
        attachment: null,
      });

      setEditingLog(null);

      fetchLogs();
    } catch (error) {
       console.log(error.response?.data);

       toast.error(
         error.response?.data?.non_field_errors?.[0] ||
         "Failed to submit log ❌"
      );
    }
  };


  const workplaceEvaluation = evaluations.find(
  ev => ev.supervisor_type === "workplace"
);

const academicEvaluation = evaluations.find(
  ev => ev.supervisor_type === "academic"
);

const workplaceScore = workplaceEvaluation?.score || 0;

const logScore = getLogScore();

const academicScore = academicEvaluation?.score || 0;

const totalScore =
  workplaceScore +
  logScore +
  academicScore;

const finalPercentage = totalScore;

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
  top: "55px",
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

const summaryCardStyle = (gradient) => ({
  background: gradient,
  borderRadius: "20px",
  padding: "25px",
  color: "white",
  minWidth: "220px",
  flex: "1",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  transition: "transform 0.2s ease",
});

const cardTitleStyle = {
  color: "#666",
  marginBottom: "10px",
};

const cardNumberStyle = {
  fontSize: "30px",
  fontWeight: "bold",
  color: "#198754",
};

const sectionCardStyle = {
  backgroundColor: "white",
  borderRadius: "15px",
  padding: "25px",
  marginBottom: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const inputStyle = {
  width: "80%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const textareaStyle = {
  width: "80%",
  minHeight: "120px",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "15px",
  resize: "vertical",
};

const submitButtonStyle = {
  backgroundColor: "#198754",
  color: "white",
  border: "none",
  padding: "12px 25px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "15px",
};

const logCardStyle = {
  backgroundColor: "white",
  borderRadius: "15px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  borderLeft: "6px solid #198754",
};

const evaluationCardStyle = {
  backgroundColor: "white",
  borderRadius: "15px",
  padding: "25px",
  marginBottom: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  borderLeft: "6px solid #198754",
};


console.log("Applications:", applications);
console.log("Applications count:", applications.length);

console.log("Evaluations:", evaluations);
console.log("Evaluations count:", evaluations.length);

console.log("Logs:", logs);
console.log("Logs count:", logs.length);
console.log("Evaluations Data:", evaluations);

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
      Student Dashboard
    </h2>

    <p
      style={{
        color: "#666",
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "0px",
      }}
    >
      Welcome, {firstName || "Student"} 👋
    </p>
  </div>

  {/* MENU */}
  <div style={{ position: "relative" }}>
    <button
      style={menuButtonStyle}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰ Menu
    </button>

    {menuOpen && (
      <div style={dropdownStyle}>
        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActiveView("home");
            setMenuOpen(false);
          }}
        >
          Home
        </div>

        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActiveView("organizations");
            setMenuOpen(false);
          }}
        >
          Organizations
        </div>

        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActiveView("applications");
            setMenuOpen(false);
          }}
        >
          Applications
        </div>

        <div
          style={dropdownItemStyle}
          onClick={() => {
            setActiveView("evaluations");
            setMenuOpen(false);
          }}
        >
          Evaluations
        </div>

        <div
          style={dropdownItemStyle}
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>
    )}
  </div>
</div>


  <div style={{
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
  flexWrap: "wrap",
}}>
  
<div style={summaryCardStyle("linear-gradient(135deg, #4e54c8, #3b82f6)")}>
  <h4>📘 Logs</h4>
  <p style={{ fontSize: "32px", fontWeight: "bold" }}>
    {logs.length}
  </p>
</div>

<div style={summaryCardStyle("linear-gradient(135deg, #11998e, #38ef7d)")}>
  <h4>📝 Applications</h4>
  <p style={{ fontSize: "32px", fontWeight: "bold" }}>
    {applications.length}
  </p>
</div>

<div style={summaryCardStyle("linear-gradient(135deg, #ff9966, #ff5e62)")}>
  <h4>✅ Approved</h4>
  <p style={{ fontSize: "32px", fontWeight: "bold" }}>
    {applications.filter(a => a.status === "approved").length}
  </p>
</div>

<div style={summaryCardStyle("linear-gradient(135deg, #c94bff, #8f44fd)")}>
  <h4>📊 Evaluations</h4>
  <p style={{ fontSize: "32px", fontWeight: "bold" }}>
    {
      evaluations.filter(
        ev => ev.supervisor_type === "academic"
      ).length
    }
  </p>
</div>
  </div>



{notification && (
  <div style={{
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor:
      notification.type === "success"
        ? "#d4edda"
        : notification.type === "error"
        ? "#f8d7da"
        : "#fff3cd",
    color:
      notification.type === "success"
        ? "#155724"
        : notification.type === "error"
        ? "#721c24"
        : "#856404"
  }}>
    {notification.text}
  </div>
)}



        {activeView === "home" && (
          <>

      {/* PLACEMENT STATUS SECTION */}
      <div style={{
        border: "2px solid #ee9714",
        padding: "15px",
        marginBottom: "25px",
        borderRadius: "10px",
        backgroundColor: "#fff8e1"  // soft highlight
   }}>
       <h2 style={{ textAlign: "center", marginTop: "0" }}>📍 My Placement</h2>   
        {placement ? (
          <>
            <p style={{textAlign: "center"}}><strong>Organization:</strong> {placement.organization_name || placement.organization}</p>
            <p style={{ textAlign: "center" }}>
  <strong>Status:</strong>
  <span style={{
    color:
      placement.status === "active"
        ? "green"
        : placement.status === "completed"
        ? "blue"
        : "orange",
    fontWeight: "bold",
    marginLeft: "5px"
  }}>
    {placement.status === "active"
      ? "Active 🟢"
      : placement.status === "completed"
      ? "Completed ✅"
      : "Not Started ⏳"}
  </span>
</p>
             
            <p style={{textAlign: "center"}}><strong>Start Date:</strong> {placement.start_date || "Not set"}</p>
            <p style={{textAlign: "center"}}><strong>End Date:</strong> {placement.end_date || "Not set"}</p>
            <p style={{ textAlign: "center" }}>
              <strong>Workplace Supervisor:</strong>{" "}
              {placement.workplace_supervisor_name || "Not Assigned"}
            </p>

            <p style={{ textAlign: "center" }}>
              <strong>Academic Supervisor:</strong>{" "}
              {placement.academic_supervisor_name || "Not Assigned"}
            </p>
          </>
        ) : (
          <p style={{textAlign: "center"}}>You have not been placed yet.</p>
        )}
      </div>

      <hr />

      {/* WEEKLY LOGS FORM */}
      <h2 style={{ textAlign: "center" }}>
        {editingLog
          ? `Edit Week ${editingLog.week_number} Log`
          : "Add Weekly Log"}
      </h2>
      <div ref={formRef} style={sectionCardStyle}>
      <form onSubmit={submitLog} style={{ textAlign: "center" }}>
        <input
          type="number"
          name="week_number"
          placeholder="Week Number"
          value={formData.week_number}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <br /><br />
        <textarea
          name="tasks"
          placeholder="Tasks done"
          value={formData.tasks}
          onChange={handleChange}
          required
          style={textareaStyle}
        />
        <br /><br />
        <textarea
          name="challenges"
          placeholder="Challenges faced"
          value={formData.challenges}
          onChange={handleChange}
          style={textareaStyle}
        />
        <br /><br />
        <input
          type="number"
          name="attendance_days"
          value={formData.attendance_days}
          onChange={handleChange}
          style={inputStyle}
        />
        <br /><br />

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={inputStyle}
        />

        {editingLog && editingLog.attachment && (
          <div
            style={{
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <strong>📄 Current PDF:</strong>{" "}
            <a
              href={editingLog.attachment}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#198754",
                fontWeight: "bold",
              }}
            >
              View Current PDF
            </a>
          </div>
        )}

        {editingLog && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "2px solid #ffc107",
              color: "#856404",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontWeight: "bold",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            ⚠️ Leave the file field empty to keep the current PDF.
            <br />
            Upload a new PDF only if you want to replace it.
          </div>
        )}

        <br /><br />

        <button
  type="submit"
  disabled={!placement}
  style={{
    ...submitButtonStyle,
    backgroundColor: !placement ? "gray" : "#198754",
    cursor: !placement ? "not-allowed" : "pointer",
  }}
>
          {editingLog ? "Update Log" : "Submit Log"}
        </button>
      </form>
      </div>

      <hr />

      {/* MY WEEKLY LOGS LIST */}
      <h2 style={{textAlign: "center"}}>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p style={{textAlign: "center"}}>No logs yet</p>
      ) : (
        logs.map((log) => (
          
          <div key={log.id} style={logCardStyle}>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
             📅 Week {log.week_number}
            </p>
           <p>
              <strong>🏢 Organization:</strong> {log.organization_name}
            </p>
            <p>
               <strong>📝 Tasks:</strong> {log.tasks}
            </p>
<p>
  <strong>Status:</strong>{" "}
  <span
    style={{
      backgroundColor:
        log.status === "approved"
          ? "#198754"
          : log.status === "rejected"
          ? "#dc3545"
          : "#ffc107",

      color: "white",

      padding: "6px 12px",
      borderRadius: "20px",
      fontWeight: "bold",
    }}
  >
    {log.status}
  </span>
</p>

{log.supervisor_feedback && (
  <p>
    <strong>Supervisor Feedback:</strong>{" "}
    {log.supervisor_feedback}
  </p>
)}

{log.status === "rejected" && (
  <button
    onClick={() => handleEdit(log)}
    style={{
      backgroundColor: "#0d6efd",
      color: "white",
      border: "none",
      padding: "8px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      marginTop: "10px",
    }}
  >
    Edit & Resubmit
  </button>
)}

          </div>
        ))
      )}

      <div style={{
  marginTop: "30px",
  padding: "15px",
  backgroundColor: "#fce2e2",
  borderLeft: "5px solid #007bff",
  borderRadius: "6px"
}}>
  <h3>Important Notes</h3>

  <p>• At least <strong>8 weekly logs</strong> should be submitted for this placement.</p>

  <p>• This placement will be evaluated based on <strong>evaluation criteria</strong> including performance, punctuality, and professionalism.</p>

  <p>• Ensure all logs are submitted on time and accurately reflect your weekly activities.</p>
  <p>• The Academic Supervisor will a ward you marks out of 20 manually depending on how you work and connect with people at your workplace and also from workplace supervisor comments about you.</p>
</div>

        </>
 )}

      {activeView === "weekly logs" && (
  <>

            {/* MY WEEKLY LOGS LIST */}
      <h2 style={{textAlign: "center"}}>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p style={{textAlign: "center"}}>No logs yet</p>
      ) : (
        logs
          .sort((a, b) => a.week_number - b.week_number)
          .map((log) => (
          <div key={log.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
            <p style={{textAlign: "center"}}>Week: {log.week_number}</p>
            <p style={{textAlign: "center"}}>Organization: {log.organization_name}</p>
            <p style={{textAlign: "center"}}>Tasks: {log.tasks}</p>
            <p style={{textAlign: "center"}}>Status: {log.status}</p>
          </div>
        ))
      )}
     </>
  )}

{activeView === "applications" && (
  <>
    <h2 style={{ textAlign: "center" }}>My Applications</h2>

    {applications.length === 0 ? (
      <p style={{ textAlign: "center" }}>
        No applications yet
      </p>
    ) : (
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginTop: "20px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#198754",
                color: "white",
              }}
            >
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                }}
              >
                Organization
              </th>

              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                }}
              >
                Status
              </th>
              {!placement && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {applications.map((app, index) => (
              <tr
                key={app.id}
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
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {app.organization_name ||
                    app.organization}
                </td>

                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor:
                        app.status === "approved"
                          ? "#198754"
                          : app.status === "rejected"
                          ? "#dc3545"
                          : "#ffc107",
                    }}
                  >
                    {app.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {!placement && (
                    <button
                      onClick={() => deleteApplication(app.id)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
)}

{activeView === "evaluations" && (
  <>

      {/* EVALUATIONS */}
      <h2 style={{textAlign: "center"}}>My Evaluations</h2>
      {evaluations.length === 0 ? (
        <p style={{textAlign: "center"}}>No evaluations yet</p>
      ) : (
        evaluations.map((ev) => (
          <div key={ev.id} style={evaluationCardStyle}>
            <p style={{textAlign: "center"}}>Supervisor: {ev.supervisor_name} ({ev.supervisor_type})</p>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "10px",
                marginTop: "10px"
              }}
            >               
  <h3
    style={{
      color: "#198754",
      marginBottom: "15px",
      textAlign: "center"
    }}
  >
    {ev.supervisor_type === "workplace"
      ? "🏢 Workplace Evaluation"
      : "🎓 Academic Evaluation"}
  </h3>


  {/* WORKPLACE SCORE */}
  {ev.supervisor_type === "workplace" && (
    <>
      <h4>📋 Workplace Evaluation Breakdown</h4>

      <table
        style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "10px",
      }}
    >
    <thead>
      <tr style={{ backgroundColor: "#198754", color: "white" }}>
        <th style={{ padding: "10px" }}>Criteria</th>
        <th style={{ padding: "10px" }}>Score</th>
      </tr>
    </thead>

    <tbody>
      {ev.criteria_scores?.map((cs, index) => (
        <tr key={index}>
          <td
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            {cs.criteria_name || cs.criteria}
          </td>

          <td
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {cs.score}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <p style={{ marginTop: "15px" }}>
    <strong>Total Workplace Score:</strong> {ev.score}/60
  </p>
    </>
  )}

  {/* ACADEMIC SCORE */}
  {ev.supervisor_type === "academic" && (
    <>
      <div
        style={{
          backgroundColor: "#fff3cd",
          padding: "15px",
          borderRadius: "10px",
          marginTop: "15px",
        }}
      >
        <h3>📊 Final Internship Result</h3>

      <p>
        Workplace Evaluation:
        <strong> {workplaceScore}/60</strong>
      </p>

      <p>
        Weekly Logs:
        <strong> {logScore}/20</strong>
      </p>

      <p>
        Academic Evaluation:
        <strong> {academicScore}/20</strong>
      </p>

      <hr />

      <h2>
        Final Grade:
        <span style={{ color: "#198754" }}>
          {" "}
          {finalPercentage}%
        </span>
      </h2>
     </div>
    </>
  )}

  <p><strong>Comments:</strong> {ev.comments}</p>

</div>

          </div>
        ))
      )}
      </>
)} 

      <hr />


  {activeView === "organizations" && (
    <>
      {/* ORGANIZATIONS */}
      <h2 style={{textAlign: "center"}}>Available Organizations</h2>
      {organizations.length === 0 ? (
        <p style={{textAlign: "center"}}>No organizations available</p>
      ) : (
        organizations.map((org) => (
          <div key={org.id} style={{ border: "1px solid purple", margin: "10px", padding: "10px" }}>
            <div
              key={org.id}
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                borderLeft: "5px solid #198754",
              }}
            >
              <h3 style={{ color: "#198754" }}>
                🏢 {org.name}
              </h3>

              <p>
                <strong>📍 Location:</strong> {org.location}
              </p>

              {org.description && (
                <>
                  <p>
                    <strong>📖 About Organization</strong>
                  </p>

                  <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    lineHeight: "1.6",
                  }}
                >
                  {org.description}
                </div>
              </>
            )}

              {org.contact_email && (
                <p>
                  <strong>📧 Email:</strong> {org.contact_email}
                </p>
              )}

              {org.phone && (
                <p>
                  <strong>📞 Phone:</strong> {org.phone}
                </p>
              )}

              {org.website && (
                <p>
                  <strong>🌐 Website:</strong>{" "}
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#198754",
                      fontWeight: "bold",
                    }}
                  >
                  Visit Website
                 </a>
                </p>
              )}

              <div style={{ marginTop: "15px" }}>
                {placement ? (
                  <button
                    disabled
                    style={{
                      backgroundColor: "gray",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                    }}
                  >
                    Already Placed
                  </button>
                ) : hasApplied(org.id) ? (
                  <button
                    disabled
                    style={{
                      backgroundColor: "#edf0f5",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                    }}
                  >
                    Applied ✅
                  </button>
                ) : (
                  <button
                    onClick={() => applyToOrganization(org.id)}
                    style={{
                      backgroundColor: "#198754",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
      
            {placement ? (
  <button disabled style={{ backgroundColor: "gray", cursor: "not-allowed" }}>
    Already Placed
  </button>
) : hasApplied(org.id) ? (
  <button disabled style={{ backgroundColor: "#edf0f5" }}>
    Applied ✅
  </button>
) : (
  <button onClick={() => applyToOrganization(org.id)}>
    Apply
  </button>
)}
          </div>
        ))
      )}
     </>
)} 
    </div>
  );
}

export default StudentDashboard;