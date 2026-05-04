import { useEffect, useState, useRef } from "react";
import API from "../api";

function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const handleMenuClick = (view) => {
  setActiveView(view);
  setMenuOpen(false);
};

  const [orgForm, setOrgForm] = useState({
    name: "",
    location: "",
    email: "",
    phone: "",
    description: "",
    website: "",
  });

  const [editingOrg, setEditingOrg] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    email: "",
    phone: "",
    description: "",
    website: "",
  });

  const [activePlacementForm, setActivePlacementForm] = useState(null);

  const [placementFormData, setPlacementFormData] = useState({
    start_date: "",
    end_date: "",
  });

  const [selectedSupervisors, setSelectedSupervisors] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const [savedRows, setSavedRows] = useState({});
  const [criteria, setCriteria] = useState([]);
  const [newCriteria, setNewCriteria] = useState({
    name: "",
    max_score: "",
  });

  const menuRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);


  const fetchApplications = async () => {
    try {
      const res = await API.get("internships/applications/");
      setApplications(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/");
      setPlacements(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await API.get("accounts/users/");
      setSupervisors(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("internships/organization/");
      setOrganizations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCriteria = async () => {
    try {
      const res = await API.get("supervision/criteria/");
      console.log("CRITERIA:", res.data);
      setCriteria(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  
  const groupApplicationsByStudent = () => {
    const grouped = {};

    applications.forEach((app) => {
      const student = app.student_name;

      if (!grouped[student]) {
        grouped[student] = [];
      }

      grouped[student].push(app);
    });

    return grouped;
  };

  
  const createOrganization = async () => {
    if (!orgForm.name || !orgForm.location) {
      alert("Name and location are required");
      return;
    }

    try {
      const res = await API.post("internships/organizations/", orgForm);

      setOrganizations((prev) => [...prev, res.data]);

      setOrgForm({
        name: "",
        location: "",
        email: "",
        phone: "",
        description: "",
        website: "",
      });

      alert("Organization created!");
    } catch (err) {
      console.log(err.response?.data);
      alert("Failed to create organization");
    }
  };

  const startEdit = (org) => {
    setEditingOrg(org.id);
    setEditForm({
      name: org.name,
      location: org.location,
      email: org.email,
      phone: org.phone,
      description: org.description,
      website: org.website,
    });
  };

  const saveEdit = async (id) => {
    try {
      const res = await API.patch(`organizations/${id}/`, editForm);

      setOrganizations((prev) =>
        prev.map((org) => (org.id === id ? res.data : org))
      );

      setEditingOrg(null);
      alert("Organization updated!");
    } catch (err) {
      console.log(err.response?.data);
      alert("Update failed");
    }
  };

  const deleteOrganization = async (id) => {
    const confirmDelete = window.confirm("Delete this organization?");
    if (!confirmDelete) return;

    try {
      await API.delete(`organizations/${id}/`);

      setOrganizations((prev) =>
        prev.filter((org) => org.id !== id)
      );

      alert("Deleted!");
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  
  const updateStatus = async (id, status) => {
    try {
      await API.patch(`internships/applications/${id}/`, { status });

      alert("Updated successfully!");
      fetchApplications();
    } catch (error) {
      console.log(error);
    }
  };

  
  const handleSupervisorChange = (placementId, type, value) => {
    setSelectedSupervisors((prev) => ({
      ...prev,
      [placementId]: {
        ...prev[placementId],
        [type]: value,
      },
    }));
  };

  const assignSupervisors = async (placementId, workplaceId, academicId) => {
    try {
      await API.patch(`internships/placements/${placementId}/`, {
        workplace_supervisor: workplaceId,
        academic_supervisor: academicId,
      });

      alert("Supervisors assigned!");
      fetchPlacements();
    } catch (error) {
      console.log(error);
      alert("Failed to assign supervisors");
    }
  };

  // ---------------- LOAD DATA ON MOUNT ----------------
  useEffect(() => {
    fetchApplications();
    fetchPlacements();
    fetchSupervisors();
    fetchOrganizations();
    fetchCriteria();
  }, []);

  const menuItemStyle = {
  padding: "20px",
  cursor: "pointer",
  borderBottom: "1px solid #eee"
};
  const statsCard = {
  background: "#f7c7c7",
  padding: "10px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  textAlign: "center",
  border: "1px solid #eee",
  borderTop: "5px solid #480303"
};
  const dropdownStyle = {
  border: "1px solid #1e0707",
  maxHeight: "120px",
  overflowY: "auto",
  background: "#e5bc91",
  position: "absolute",
  zIndex: 1000,
}; 


return (
  <div>
    {/* MENU */}
    <div ref ={menuRef} style={{ display: 'flex',position:"relative" }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          fontSize : '24px',
          background: "none",
          border: "none",
          cursor: "pointer",

        }}
      >
        ☰ menu
      </button>


      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "0",
            width: "250px",
            background: "#efdfb9",
            borderRadius: "12px",
            padding: "20px",
            border: "2px solid #ff6b6b",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 1000
          }}
        >
          <h3 style={{ textAlign: "center" }}>Menu</h3>

      <div
        style={menuItemStyle}
        onClick={() => handleMenuClick("home")}
      >
        🏠 Home
      </div>

      <div
        style={menuItemStyle}
        onClick={() => handleMenuClick("organizations")}
      >
        🏢 Organizations
      </div>

      <div
        style={menuItemStyle}
        onClick={() => handleMenuClick("applications")}
      >
        📝 My Applications
      </div>
      <div
        style={menuItemStyle}
        onClick={() => handleMenuClick("placements")}
      >
        📍 Placements
      </div>

     

      

    </div>
      )}
    </div>

    {/* DASHBOARD CONTENT */}
    <div>
      <h1>Admin Dashboard</h1>

      {/* ⬇️ KEEP EVERYTHING ELSE EXACTLY AS YOU WROTE IT BELOW */}
{activeView === "home" && ( 

  <> 
        <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px"
    }}
  >
    {/* Organizations */}
    <div style={statsCard}>
      <h3>🏢 Organizations</h3>
      <h1>{organizations.length}</h1>
    </div>

    {/* Applications */}
    <div style={statsCard}>
      <h3>📝 Applications</h3>
      <h1>{applications.length}</h1>
    </div>

    {/* Active Placements */}
    <div style={statsCard}>
      <h3>📍 Active Placements</h3>
      <h1>
        {
          placements.filter((p) => p.is_fully_assigned).length
        }
      </h1>
    </div>
  </div>   
        <h2>Organization</h2>
    <div
      style={{
        border: "1px solid #140961",
        padding: "15px",
        marginBottom: "20px",
        borderRadius: "8px",
        background: "#d4f4f4",
        maxWidth: "500px"
      }}
    >
      <h3>Add Organization</h3>    

      <input
        type="text"
        placeholder="Name"
        value={orgForm.name}
        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
      />
      <br /><br />

      <input
        type ='text'
        placeholder="Location"
        value={orgForm.location}
        onChange={(e) => setOrgForm({ ...orgForm, location: e.target.value })}
      />
      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={orgForm.email}
        onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
      />
      <br /><br />

      <input
        type="text"
        placeholder="Phone"
        value={orgForm.phone}
        onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
      />
      <br /><br />

      <textarea
        placeholder="Description"
        value={orgForm.description}
        onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
      />
      <br /><br />

      <input
        type='text'
        placeholder ='website'
        value={orgForm.website}
        onChange={(e) => setOrgForm({...orgForm,website: e.target.value})}
      />
      <br /><br />  

      <button onClick ={createOrganization}>
        Create Organization
      </button>
    </div>
  

 
  <h2>Global Evaluation Criteria (Admin only)</h2>

  <table border ='1'cellPadding ="10" style={{ marginTop: "10px", marginLeft: "30px" }}>
    <thead>
      <tr>
        <th>Criteria</th>
        <th>Max Score</th>
        <th>Score</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {criteria.map((c) => (
        <tr key={c.id}>
          <td>
            <input
              type="text"
              value={c.name}
              onChange={(e) => {
                const updated = criteria.map((item) =>
                  item.id === c.id ? { ...item, name: e.target.value } : item
                );
                setCriteria(updated);
              }}
            />
          </td>

          <td>
            <input
              type="number"
              value={c.max_score}
              onChange={(e) => {
                const updated = criteria.map((item) =>
                  item.id === c.id
                    ? { ...item, max_score: e.target.value }
                    : item
                );
                setCriteria(updated);
              }}
            />
          </td>

          {/* 🔥 Score column (Admin optional / future use) */}
          <td>
            <input type="number" placeholder="-" disabled />
          </td>

          <td>
  <button
    onClick={async () => {
      try {
        await API.patch(`supervision/criteria/${c.id}/`, {
          name: c.name,
          max_score: Number(c.max_score),
        });

        setSavedRows((prev) => ({
          ...prev,
          [c.id]: true,
        }));

      } catch {
        alert("Update failed");
      }
    }}
  >
    {savedRows[c.id] ? "Saved ✅" : "Save"}
  </button>
    <button
    onClick={async () => {
      try {
        await API.delete(`supervision/criteria/${c.id}/`);

        // ✅ remove instantly from UI
        setCriteria((prev) => prev.filter((item) => item.id !== c.id));

      } catch {
        alert("Delete failed");
      }
    }}
  >
    Delete
  </button>


          </td>
        </tr>
      ))}

      {/* 🔥 ADD NEW ROW */}
      <tr>
        <td>
          <input
            type="text"
            placeholder="New Criteria"
            value={newCriteria.name}
            onChange={(e) =>
              setNewCriteria({ ...newCriteria, name: e.target.value })
            }
          />
        </td>

        <td>
          <input
            type="number"
            placeholder="Max"
            value={newCriteria.max_score}
            onChange={(e) =>
              setNewCriteria({ ...newCriteria, max_score: e.target.value })
            }
          />
        </td>

        <td>-</td>  

        <td>
  <button
    onClick={async () => {
      if (!newCriteria.name || !newCriteria.max_score) {
        alert("Please fill all fields");
        return;
      }

      // 🚨 LIMIT CHECK
      if (criteria.length >= 6) {
        const confirmAdd = window.confirm(
          "You have reached 6 criteria. Do you want to add another?"
        );

        if (!confirmAdd) return;
      }

      try {
        const res = await API.post("supervision/criteria/", {
          name: newCriteria.name,
          max_score: Number(newCriteria.max_score),
        });

        // ✅ add instantly to UI
        setCriteria((prev) => [...prev, res.data]);

        setNewCriteria({ name: "", max_score: "" });

      } catch (err) {
        console.log(err.response?.data);
        alert("Failed to create criteria");
      }
    }}
  >
    Add
  </button>

        </td>
      </tr>
    </tbody>
  </table>
  </>
)}
{activeView === "organizations" && (
  <>
 <h3>Existing Organizations</h3>
  {organizations.length === 0 ? (
    <p>No organizations yet</p>
  ) : (
    organizations.map((org) => (
      <div
        key={org.id}
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          background: "#fff",
        }}
      >
        {editingOrg === org.id ? (
          <>
            <input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <br />

            <input
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
            />
            <br />

            <input
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <br />

            <input
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
            <br />

            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
            <br />

            <input
              value={editForm.website}
              onChange={(e) =>
                setEditForm({ ...editForm, website: e.target.value })
              }
            />
            <br /><br />

            <button onClick={() => saveEdit(org.id)}>Save</button>
            <button onClick={() => setEditingOrg(null)}>Cancel</button>
          </>
        ) : (
          <>
            <p><strong>{org.name}</strong></p>
            <p>{org.location}</p>
            <p>{org.email}</p>
            <p>{org.phone}</p>
            <p>{org.description}</p>
            <p>{org.website}</p>

            <button onClick={() => startEdit(org)}>Edit</button>
            <button onClick={() => deleteOrganization(org.id)}>
              Delete
            </button>
          </>
        )}
      </div>
    ))
  )}
  </>
)}




   
{activeView === "applications" && (
  <>

        <h2>Applications</h2>

  {applications.length === 0 ? (
    <p>No applications yet</p>
  ) : (
    Object.entries(groupApplicationsByStudent()).map(([student, apps]) => (
      <div
        key={student}
        style={{ border: "2px solid black", margin: "15px", padding: "10px" }}
      >
        
        {/* 🔥 STUDENT NAME */}
        <h3>Student: {student}</h3>

        {/* 🔥 APPLICATIONS UNDER THAT STUDENT */}
        {apps.map((app) => (
          <div
            key={app.id}
            style={{
              marginLeft: "20px",
              borderTop: "1px solid gray",
              padding: "5px",
            }}
          >
            <p><strong>Organization:</strong> {app.organization_name}</p>
            <p><strong>Status:</strong> {app.status}</p>

            {app.status === "pending" && (
              <>
                <button onClick={() => updateStatus(app.id, "approved")}>
                  Approve
                </button>

                <button onClick={() => updateStatus(app.id, "rejected")}>
                  Reject
                </button>
              </>
            )}
            

          

  {/* 🔥 SHOW BUTTON ONLY IF APPROVED */}
  {app.status === "approved" && (
    placements.some((p) => p.student === app.student) ? (
      <p style={{ color: "green", fontWeight: "bold" }}>
        ✅ Placement Created
      </p>
    ) : (
      <button
        onClick={() => {
          setActivePlacementForm(app.id);
          setPlacementFormData({
            start_date: "",
            end_date: "",
          });
        }}
      >
        Create Placement
      </button>
    )
  )}

  {/* 🔥 INLINE PLACEMENT FORM */}
  {activePlacementForm === app.id && (
    <div style={{ marginTop: "10px", padding: "10px", border: "1px solid blue" }}>
      
      {/* START DATE */}
      <input
        type="date"
        value={placementFormData.start_date}
        onChange={(e) =>
          setPlacementFormData({
            ...placementFormData,
            start_date: e.target.value,
          })
        }
      />
      {/* END DATE */}
      <input
        type="date"
        value={placementFormData.end_date}
        onChange={(e) =>
          setPlacementFormData({
            ...placementFormData,
            end_date: e.target.value,
          })
        }
      />
      <br /><br />

      {/* SAVE BUTTON */}
      <button
        onClick={async () => {
          try {
            await API.post("internships/placements/", {
              student: app.student,
              organization: app.organization,
              start_date: placementFormData.start_date,
              end_date: placementFormData.end_date,
            });
            alert("Placement created!");

            // 🔥 close form after saving
            setActivePlacementForm(null);

            fetchPlacements();
          } catch (error) {
              console.log(error.response?.data);

              if (error.response?.data?.student) {
                alert("This student already has a placement!");
              } else {
                alert("Failed to create placement");
              }
            }
        }}
      >
        Save Placement
      </button>

    </div>
  )}
          </div>
        ))}
      </div>
    ))
  )}
  </>
)}
      


{activeView === "placements" && (
  <>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        textAlign: "center",
      }}
    >
      <h2>Placements</h2>

      {placements.length === 0 ? (
        <p>No placements yet</p>
      ) : (
        placements.map((p) => {

          // 🔥 FILTER SUPERVISORS (IMPORTANT — KEEP THIS)
          const workplaceSupervisors = supervisors.filter(
            (u) =>
              u.role === "workplace" &&
              u.organization === p.organization
          );

          const academicSupervisors = supervisors.filter(
            (u) => u.role === "academic"
          );

          return (
            <div
              key={p.id}
              style={{
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto 20px",
                border: "1px solid #05072c",
                padding: "15px",
                borderRadius: "10px",
                background: "#b8bfe179",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                textAlign: "left",
              }}
            >
              <p><strong>Student:</strong> {p.student_name}</p>
              <p><strong>Organization:</strong> {p.organization_name}</p>
              <p><strong>Start Date:</strong> {p.start_date || "Not set"}</p>
              <p><strong>End Date:</strong> {p.end_date || "Not set"}</p>

              {/* ✅ IF FULLY ASSIGNED */}
              {p.is_fully_assigned ? (
                <>
                  <p><strong>Status:</strong> {p.status}</p>
                  <p><strong>Workplace Supervisor:</strong> {p.workplace_supervisor_name}</p>
                  <p><strong>Academic Supervisor:</strong> {p.academic_supervisor_name}</p>

                  <p style={{ color: "green", fontWeight: "bold" }}>
                    ✅ Placement Confirmed
                  </p>
                </>
              ) : (
                <>
                  {/* 🔧 DATE FIELDS */}
                  <input
                    type="date"
                    defaultValue={p.start_date || ""}
                    onBlur={async (e) => {
                      await API.patch(`internships/placements/${p.id}/`, {
                        start_date: e.target.value,
                      });
                      fetchPlacements();
                    }}
                  />

                  <br /><br />

                  <input
                    type="date"
                    defaultValue={p.end_date || ""}
                    onBlur={async (e) => {
                      await API.patch(`internships/placements/${p.id}/`, {
                        end_date: e.target.value,
                      });
                      fetchPlacements();
                    }}
                  />

                  <br /><br />

                  {/* 🔍 WORKPLACE SEARCH */}
                  <input
                    type="text"
                    placeholder="Search workplace supervisor"
                    value={selectedSupervisors[p.id]?.workplace_search || ""}
                    onFocus={() =>
                      setShowDropdown((prev) => ({
                        ...prev,
                        [p.id]: "workplace",
                      }))
                    }
                    onChange={(e) => {
                      handleSupervisorChange(p.id, "workplace_search", e.target.value);
                      setShowDropdown((prev) => ({
                        ...prev,
                        [p.id]: "workplace",
                      }));
                    }}
                  />

                  {showDropdown[p.id] === "workplace" && (
                    <div style={dropdownStyle}>
                      {workplaceSupervisors
                        .filter((u) =>
                          u.username
                            .toLowerCase()
                            .includes(
                              (selectedSupervisors[p.id]?.workplace_search || "")
                                .toLowerCase()
                            )
                        )
                        .map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              handleSupervisorChange(p.id, "workplace", u.id);
                              handleSupervisorChange(
                                p.id,
                                "workplace_search",
                                u.username
                              );

                              setShowDropdown((prev) => ({
                                ...prev,
                                [p.id]: null,
                              }));
                            }}
                            style={{ padding: "5px", cursor: "pointer" }}
                          >
                            {u.username}
                          </div>
                        ))}
                    </div>
                  )}

                  <br /><br />

                  {/* 🔍 ACADEMIC SEARCH */}
                  <input
                    type="text"
                    placeholder="Search academic supervisor"
                    value={selectedSupervisors[p.id]?.academic_search || ""}
                    onFocus={() =>
                      setShowDropdown((prev) => ({
                        ...prev,
                        [p.id]: "academic",
                      }))
                    }
                    onChange={(e) => {
                      handleSupervisorChange(p.id, "academic_search", e.target.value);
                      setShowDropdown((prev) => ({
                        ...prev,
                        [p.id]: "academic",
                      }));
                    }}
                  />

                  {showDropdown[p.id] === "academic" && (
                    <div style={dropdownStyle}>
                      {academicSupervisors
                        .filter((u) =>
                          u.username
                            .toLowerCase()
                            .includes(
                              (selectedSupervisors[p.id]?.academic_search || "")
                                .toLowerCase()
                            )
                        )
                        .map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              handleSupervisorChange(p.id, "academic", u.id);
                              handleSupervisorChange(
                                p.id,
                                "academic_search",
                                u.username
                              );

                              setShowDropdown((prev) => ({
                                ...prev,
                                [p.id]: null,
                              }));
                            }}
                            style={{ padding: "5px", cursor: "pointer" }}
                          >
                            {u.username}
                          </div>
                        ))}
                    </div>
                  )}

                  <br /><br />

                  <button
                    onClick={() =>
                      assignSupervisors(
                        p.id,
                        selectedSupervisors[p.id]?.workplace,
                        selectedSupervisors[p.id]?.academic
                      )
                    }
                  >
                    Assign Supervisors
                  </button>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  </>
)}
   
    </div>    
  </div>
);
}

export default AdminDashboard;