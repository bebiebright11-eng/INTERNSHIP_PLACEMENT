import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [applicationSearch, setApplicationSearch] = useState("");

// Student form
  const [studentRegNo, setStudentRegNo] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

// Staff form
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("academic");
  const [staffOrganization, setStaffOrganization] = useState("");

  const [message, setMessage] = useState("");

  const [activePlacementForm, setActivePlacementForm] = useState(null);


  const [showConfirmedPlacements, setShowConfirmedPlacements] = useState(false);
  const [placementSearch, setPlacementSearch] = useState("");


  const firstName = localStorage.getItem("first_name");

  const handleMenuClick = (view) => {
  setActiveView(view);
  setMenuOpen(false);
};
  
  const handleLogout = () => {
  localStorage.clear();

  toast.success("Logged out successfully 👋");

  navigate("/");
};


const filteredApplications = applications.filter(
  (app) =>
    app.organization_name
      ?.toLowerCase()
      .includes(applicationSearch.toLowerCase()) ||

    app.student_name
      ?.toLowerCase()
      .includes(applicationSearch.toLowerCase())
);

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



  const [placementFormData, setPlacementFormData] = useState({
    start_date: "",
    end_date: "",
  });

  const [selectedSupervisors, setSelectedSupervisors] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const [savedRows, setSavedRows] = useState({});
  const [criteria, setCriteria] = useState([]);
  const [finalEvaluations, setFinalEvaluations] = useState([]);
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
      const res = await API.get("internships/organizations/");
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


const handleCreateStudent = async (e) => {
  e.preventDefault();

  if (!studentRegNo) {
    toast.error("Registration Number is required");
    return;
  }

  try {
    await API.post("accounts/users/", {
      username: studentRegNo,
      email: studentEmail || "",
      role: "student",
    });

    toast.success("Student created successfully");

    setStudentRegNo("");
    setStudentEmail("");

    fetchSupervisors();

  } catch (error) {
    console.log(error.response?.data);
    toast.error("Error creating student");
  }
};


const handleCreateStaff = async (e) => {
  e.preventDefault();

  if (!staffEmail) {
    toast.error("Email is required");
    return;
  }

  try {
    await API.post("accounts/users/", {
      username: staffEmail,
      email: staffEmail,
      role: staffRole,
      organization:
        staffRole === "workplace"
          ? staffOrganization
          : null,
    });

    toast.success("Staff user created successfully");

    setStaffEmail("");
    setStaffRole("academic");
    setStaffOrganization("");

    fetchSupervisors();

  } catch (error) {
    console.log(error.response?.data);
    toast.error("Error creating staff user");
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
      toast.warning("Name and location are required");
      return;
    }
    const cleanedData = {
      ...orgForm,
      website: orgForm.website || null,
      email: orgForm.email || null,
      phone: orgForm.phone || null,
      description: orgForm.description || null,
    };

    try {
      const res = await API.post("internships/organizations/", cleanedData);

      setOrganizations((prev) => [...prev, res.data]);

      setOrgForm({
        name: "",
        location: "",
        email: "",
        phone: "",
        description: "",
        website: "",
      });

      toast.success("Organization created!");
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Failed to create organization");
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

  const deleteUser = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this user?"
  );

  if (!confirmDelete) return;

  try {

    await API.delete(`accounts/users/${id}/`);

    setSupervisors((prev) =>
      prev.filter((user) => user.id !== id)
    );

    toast.success("User deleted successfully");

  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.error ||
      "Failed to delete user"
    );

  }
};



  const saveEdit = async (id) => {
    try {
      const res = await API.patch(`internships/organizations/${id}/`, editForm);

      setOrganizations((prev) =>
        prev.map((org) => (org.id === id ? res.data : org))
      );

      setEditingOrg(null);
      toast.success("Organization updated!");
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Update failed");
    }
  };

  const deleteOrganization = async (id) => {
    const confirmDelete = window.confirm("Delete this organization?");
    if (!confirmDelete) return;

    try {
      await API.delete(`internships/organizations/${id}/`);

      setOrganizations((prev) =>
        prev.filter((org) => org.id !== id)
      );

      toast.success("Organization deleted!");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

const deletePlacement = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this placement?"
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`internships/placements/${id}/`);

    setPlacements((prev) =>
      prev.filter((p) => p.id !== id)
    );

    toast.success("Placement deleted successfully");

  } catch (error) {
    console.log(error);
    toast.error("Failed to delete placement");
  }
};

  
  const updateStatus = async (id, status) => {
    try {
      await API.patch(`internships/applications/${id}/`, { status });

      toast.success("Updated successfully!");
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

      toast.success("Supervisors assigned!");
      fetchPlacements();
    } catch (error) {
      console.log(error);
      toast.error("Failed to assign supervisors");
    }
  };

  const fetchFinalEvaluations = async () => {
    try {

      const res = await API.get("supervision/evaluations/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setFinalEvaluations(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const pendingPlacements = placements.filter(
  (p) => !p.is_fully_assigned
);

const confirmedPlacements = placements.filter(
  (p) => p.is_fully_assigned
);

const filteredConfirmedPlacements =
  confirmedPlacements.filter((p) =>
    p.student_name
      ?.toLowerCase()
      .includes(placementSearch.toLowerCase()) ||

    p.organization_name
      ?.toLowerCase()
      .includes(placementSearch.toLowerCase())
  );

  // ---------------- LOAD DATA ON MOUNT ----------------
  useEffect(() => {
    fetchApplications();
    fetchPlacements();
    fetchSupervisors();
    fetchOrganizations();
    fetchCriteria();
    fetchFinalEvaluations();
  }, []); 

const menuButtonStyle = {
  background: "linear-gradient(135deg,#198754,#157347)",
  color: "white",
  border: "none",

  padding: "12px 18px",

  borderRadius: "12px",
  cursor: "pointer",

  fontWeight: "600",
  fontSize: "16px",

  display: "flex",
  alignItems: "center",
  gap: "8px",

  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",

  transition: "0.3s ease",
};
  

  const menuItemStyle = {
    padding: "12px",
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#198754",
    backgroundColor: "#f8f9fa",
  };
  const statsCard = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    flex: "1",
    minWidth: "220px",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "60px",
    left: "0",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    width: "250px",
    padding: "10px",
    zIndex: 1000,
  }; 

const sectionWrapper = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "30px",
  marginTop: "30px",

  borderLeft: "5px solid #198754",

  boxShadow:
    "0 8px 25px rgba(0,0,0,0.08)",

  transition: "0.3s",
};

const sectionCard = {
  padding: "20px",
  width: "100%",
  background: "transparent",
};

const sectionTitle = {
  color: "#198754",
  fontSize: "28px",
  marginBottom: "20px",
  textAlign: "center",
  fontWeight: "bold",
};


const purpleCard = {
  flex: 1,
  minWidth: "240px",
  padding: "25px",
  borderRadius: "20px",
  color: "white",
  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
};

const greenCard = {
  flex: 1,
  minWidth: "240px",
  padding: "25px",
  borderRadius: "20px",
  color: "white",
  background: "linear-gradient(135deg, #11998e, #38ef7d)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
};

const pinkCard = {
  flex: 1,
  minWidth: "240px",
  padding: "25px",
  borderRadius: "20px",
  color: "white",
  background: "linear-gradient(135deg, #ff4ecd, #b5179e)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
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

  const tableContainerStyle = {
  background: "#fff",

  borderRadius: "20px",

  overflow: "hidden",

  border: "1px solid #e5e7eb",

  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",

  marginTop: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing : 0,
  fontFamily: "Arial",
};
 
const tableHeaderStyle = {
  background:
    "linear-gradient(135deg,#198754,#157347)",

  color: "#fff",

  padding: "18px",

  fontWeight: "bold",

  textAlign: "left",
  fontSize: "15px",
  letterSpacing:"0.5px",
};

const tableCellStyle = {
  padding: "18px",

  borderBottom: "1px solid #f1f5f9",
};

const primaryButton = {
  background:
    "linear-gradient(135deg,#198754,#157347)",

  color: "#fff",

  border: "none",

  padding: "12px 20px",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: "600",

  boxShadow:
    "0 4px 10px rgba(25,135,84,0.25)",
};

const deleteButtonStyle = {
  background:
    "linear-gradient(135deg,#dc3545,#b02a37)",

  color: "white",

  border: "none",

  padding: "10px 16px",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: "600",
};

const inputStyle = {
  width: "100%",

  padding: "14px",

  border: "1px solid #d1d5db",

  borderRadius: "12px",

  background: "#fafafa",

  fontSize: "15px",

  outline: "none",

  boxSizing: "border-box",

  marginBottom: "12px",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "100px",
  resize: "vertical",
};


  const students = supervisors.filter(
    (user) => user.role === "student"
  );

  const staffUsers = supervisors.filter(
    (user) => user.role !== "student"
  );

return (
  <div
    style={{
      padding: "30px",
      backgroundColor :"#f4f6f9",
      minHeight: "200vh",
      fontFamily:"Arial",
    }}
  >
   <div>
      <h1
        style={{
          background:"white",
          padding:"25px",
          borderRadius:"16px",
          marginBottom:"25px",
          boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        INTERNSHIP PLACEMENT SYSTEM(ILES)
      </h1>

      <h2
        style={{
        color: "#198754eb",
          marginTop: "10px",
          marginBottom: "5px",
        }} 
      >
        ADMIN DASHBOARD
      </h2>
      <p
        style={{
          color: "#a4a4a4",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        Welcome,  {firstName || "Admin"}  👋
      </p>
    </div>

    {/* MENU */}
    <div ref={menuRef}style={{display: "flex",position: "relative",marginBottom: "40px",}}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={menuButtonStyle}
      >
        <span style={{ fontSize: "18px" }}>☰</span>
        <span>Menu</span>
      </button>


      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "0",
            width: "250px",
            background: "#ffffffd5",
            borderRadius: "12px",
            padding: "20px",
            border: "2px solid #ff6b6b",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.47)",
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
        🍭Placements
      </div>


      <div
        style={menuItemStyle}
        onClick={() => handleMenuClick("users")}
      >
        👥 Users
      </div>

      <div
        style={menuItemStyle}
        onClick={() => handleMenuClick("finalEvaluations")}
      >
        🎓 Final Report
      </div>    

       <div
          style={{
            ...menuItemStyle,
            color: "#dc3545",
          }}
          onClick={handleLogout}
        >
          🚪 Logout
        </div>

      

    </div>
      )}
    </div>

  
    <div>
      
  <div
    style={{
      display: "flex",
      gap: "20px",
      marginBottom: "30px",
      flexWrap : "wrap",
    }}
  >
<div style={purpleCard}>
  <div style={{ fontSize: "30px" }}>🏢</div>
  <h3>Organizations</h3>
  <p style={{ fontSize: "40px", fontWeight: "bold" }}>
    {organizations.length}
  </p>
</div>

<div style={greenCard}>
  <div style={{ fontSize: "30px" }}>📝</div>
  <h3>Applications</h3>
  <p style={{ fontSize: "40px", fontWeight: "bold" }}>
    {applications.length}
  </p>
</div>

<div style={pinkCard}>
  <div style={{ fontSize: "30px" }}>🎓</div>
  <h3>Placements</h3>
  <p style={{ fontSize: "40px", fontWeight: "bold" }}>
    {placements.filter((p) => p.is_fully_assigned).length}
  </p>
</div>
  </div> 
      
{activeView === "home" && ( 

  <>    
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "70px",
        flexWrap: "wrap",
        alignItems: "flex-start",
        marginTop: "30px",
        
        }}
    >  
        <div style={sectionWrapper}>
          <h2 style={sectionTitle}>Organization</h2>

          <div style={sectionCard}>
  
            <h3>Add Organization</h3>    

              <input
                style={inputStyle}
                type="text"
                placeholder="Name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              />
              <br /><br />

              <input
                style={inputStyle}
                type ='text'
                placeholder="Location"
                value={orgForm.location}
                onChange={(e) => setOrgForm({ ...orgForm, location: e.target.value })}
              />
              <br /><br />

              <input
                style={inputStyle}
                type="email"
                placeholder="Email"
                value={orgForm.email}
                onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
              />
              <br /><br />

              <input
                style={inputStyle}
                type="text"
                placeholder="Phone"
                value={orgForm.phone}
                onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
              />
              <br /><br />

              <textarea
                style={textareaStyle}
                placeholder="Description"
                value={orgForm.description}
                onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
              />
              <br /><br />

              <input
                style={inputStyle}
                type='text'
                placeholder ='website'
                value={orgForm.website}
                onChange={(e) => setOrgForm({...orgForm,website: e.target.value})}
              />
              <br /><br />  

          <button style={primaryButton} onClick ={createOrganization}>
            Create Organization
          </button>
        </div>
      </div> 
        

       <div style={sectionWrapper}>
         <h2 style={sectionTitle}>Create Student</h2>

         <div style={sectionCard}>
           <form onSubmit={handleCreateStudent}>

             <input
              style={inputStyle}
              type="text"
              placeholder="Registration Number"
              value={studentRegNo}
              onChange={(e) => setStudentRegNo(e.target.value)}
            />

            <br /><br />

            <input
              style={inputStyle}
              type="email"
              placeholder="Email (Optional)"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />

            <br /><br />

            <button style={primaryButton} type="submit">
              Create Student
            </button>

          </form>
        </div>
      </div>

      <div style={sectionWrapper}>
        <h2 style={sectionTitle}>Create Staff User</h2>

        <div style={sectionCard}>
          <form onSubmit={handleCreateStaff}>

            <input
              style={inputStyle}
              type="email"
              placeholder="Email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
            />

          <br /><br />

          <select
            style={inputStyle}
            value={staffRole}
            onChange={(e) => setStaffRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="academic">
              Academic Supervisor
            </option>
            <option value="workplace">
              Workplace Supervisor
            </option>
          </select>

          <br /><br />

          {staffRole === "workplace" && (
            <>
              <select
                style={inputStyle}
                value={staffOrganization}
                onChange={(e) =>
                  setStaffOrganization(e.target.value)
                }
              >
                <option value="">
                  Select Organization
                </option>

                {organizations.map((org) => (
                  <option
                    key={org.id}
                    value={org.id}
                  >
                  {org.name}
                </option>
              ))}
            </select>

            <br /><br />
          </>
        )}

        <button style={primaryButton} type="submit">
          Create Staff User
        </button>

      </form>
    </div>
  </div>

    </div>      

  

 
  <div style={sectionWrapper}>
  <h2 style={sectionTitle}>
    Global Evaluation Criteria
  </h2>

  <div style={sectionCard}>
    <table style={tableStyle}>
  

  
    <thead>
      <tr>
        <th style={tableHeaderStyle}>Criteria</th>
        <th style={tableHeaderStyle}>Max Score</th>
        <th style={tableHeaderStyle}>Score</th>
        <th style={tableHeaderStyle}>Actions</th>
      </tr>
    </thead>

    <tbody>
      {criteria.map((c) => (
        <tr key={c.id}
          style ={{ 
            backgroundColor: savedRows[c.id] ? "#d1e7dd" : "transparent" ,
            transition: "0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = savedRows[c.id] ? "#d1e7dd" : "#f8f9fa";
          }}    
          onMouseLeave ={(e) => {
            e.currentTarget.style.backgroundColor = savedRows[c.id] ? "#d1e7dd" : "transparent";
          }}
        >
          <td style ={tableCellStyle}>
            <input
              style={inputStyle}
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

          <td style ={tableCellStyle}>
            <input
              style={inputStyle}
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

          <td style ={tableCellStyle}>
            <input type="number" placeholder="-" disabled />
          </td>

          <td style ={tableCellStyle}>
  <button style={primaryButton}
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
        toast.error("Update failed");
      }
    }}
  >
    {savedRows[c.id] ? "Saved ✅" : "Save"}
  </button>
    <button 
      style={deleteButtonStyle}

      onMouseEnter = {(e) => {
        e.currentTarget.style.backgroundColor = "#701010";
      }}

      onMouseLeave = {(e) => {
        e.currentTarget.style.backgroundColor = "#4f0909";
      }}

      onClick={async () => {

        const confirmDelete = window.confirm(
          "Are you sure you want to delete this criteria?"
        );

        if (!confirmDelete) return;

        try {
        await API.delete(`supervision/criteria/${c.id}/`);

        setCriteria((prev) =>
          prev.filter((item) => item.id !== c.id)
        );

        toast.success("Criteria deleted successfully");

      } catch {
        toast.error("Delete failed");
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
        <td style={tableCellStyle}>
          <input
            type="text"
            placeholder="New Criteria"
            value={newCriteria.name}
            onChange={(e) =>
              setNewCriteria({ ...newCriteria, name: e.target.value })
            }
          />
        </td>

        <td style={tableCellStyle}>
          <input
            style={inputStyle}
            type="number"
            placeholder="Max"
            value={newCriteria.max_score}
            onChange={(e) =>
              setNewCriteria({ ...newCriteria, max_score: e.target.value })
            }
          />
        </td>

        <td style={tableCellStyle}>-</td>  

        <td style={tableCellStyle}>
    <button style={primaryButton}
      onClick={async () => {
        if (!newCriteria.name || !newCriteria.max_score) {
          toast.warning("Please fill all fields");
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
          toast.error("Failed to create criteria");
        }
      }}
    >
      Add
    </button>

        </td>
      </tr>
    </tbody>
  </table>
      </div>
  </div>    
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
          background: "#fff",
          padding: "20px",
          marginBottom: "20px",

          borderRadius: "16px",

          borderLeft: "5px solid #198754",

          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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

            <button style={primaryButton} onClick={() => saveEdit(org.id)}>
              Save
            </button>
            <button style={primaryButton} onClick={() => setEditingOrg(null)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <p><strong>{org.name}</strong></p>
            <p>{org.location}</p>
            <p>{org.email}</p>
            <p>{org.phone}</p>
            <p>{org.description}</p>
            <p>{org.website}</p>

            <button style={primaryButton} onClick={() => startEdit(org)}>
              Edit
            </button>
            <button  
              style={deleteButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }}  
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ef4444";
              }}
              onClick={() => deleteOrganization(org.id)}>
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

    <input
      style={{
        ...inputStyle,
        maxWidth: "400px",
        marginBottom: "20px",
      }}
      type="text"
      placeholder="Search student /organization..."
      value={applicationSearch}
      onChange={(e) =>
        setApplicationSearch(e.target.value)
      }
    />

    {applications.length === 0 ? (
      <p>No applications yet</p>
    ) : (
      Object.entries(
        filteredApplications.reduce((grouped, app) => {
          const student = app.student_name;

          if (!grouped[student]) {
            grouped[student] = [];
          }

          grouped[student].push(app);

          return grouped;
        }, {})
      ).map(
        ([student, apps]) => (
          <div
            key={student}
            style={{
              border: "2px solid black",
              margin: "15px",
              padding: "10px",
            }}
          >
            <h3>Student: {student}</h3>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      Organization
                    </th>

                    <th style={tableHeaderStyle}>
                      Status
                    </th>

                    <th style={tableHeaderStyle}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {apps.map((app, index) => (
                    <tr
                      key={app.id}
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? "#f8f9fa"
                            : "white",
                      }}
                    >
                      <td style={tableCellStyle}>
                        {app.organization_name}
                      </td>

                      <td style={tableCellStyle}>
                        {app.status}
                      </td>

                      <td style={tableCellStyle}>
                        {app.status === "pending" && (
                          <>
                            <button
                              style={{
                                ...primaryButton,
                                marginRight: "10px",
                              }}
                              onClick={() =>
                                updateStatus(
                                  app.id,
                                  "approved"
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              style={deleteButtonStyle}
                              onClick={() =>
                                updateStatus(
                                  app.id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {app.status === "approved" && (
                          <>
                            {placements.some(
                              (p) =>
                                p.student ===
                                app.student
                            ) ? (
                              <p
                                style={{
                                  color: "green",
                                  fontWeight: "bold",
                                  marginTop: "10px",
                                }}
                              >
                                ✅ Placement Created , Confirm placement from "Menu" placements
                              </p>
                            ) : (
                              <>
                                <button
                                  style={primaryButton}
                                  onClick={() => {
                                    setActivePlacementForm(
                                      app.id
                                    );

                                    setPlacementFormData({
                                      start_date: "",
                                      end_date: "",
                                    });
                                  }}
                                >
                                  Create Placement
                                </button>

                                {activePlacementForm ===
                                  app.id && (
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      padding: "10px",
                                      border:
                                        "1px solid #198754",
                                      borderRadius:
                                        "8px",
                                    }}
                                  >
                                    <input
                                      style={
                                        inputStyle
                                      }
                                      type="date"
                                      value={
                                        placementFormData.start_date
                                      }
                                      onChange={(e) =>
                                        setPlacementFormData(
                                          {
                                            ...placementFormData,
                                            start_date:
                                              e.target
                                                .value,
                                          }
                                        )
                                      }
                                    />

                                    <input
                                      style={
                                        inputStyle
                                      }
                                      type="date"
                                      value={
                                        placementFormData.end_date
                                      }
                                      onChange={(e) =>
                                        setPlacementFormData(
                                          {
                                            ...placementFormData,
                                            end_date:
                                              e.target
                                                .value,
                                          }
                                        )
                                      }
                                    />

                                    <button
                                      style={
                                        primaryButton
                                      }
                                      onClick={async () => {
                                        try {
                                          await API.post(
                                            "internships/placements/",
                                            {
                                              student:
                                                app.student,
                                              organization:
                                                app.organization,
                                              start_date:
                                                placementFormData.start_date,
                                              end_date:
                                                placementFormData.end_date,
                                            }
                                          );

                                          toast.success(
                                            "Placement created!"
                                          );

                                          setActivePlacementForm(
                                            null
                                          );

                                          fetchPlacements();
                                        } catch (
                                          error
                                        ) {
                                          console.log(
                                            error
                                              .response
                                              ?.data
                                          );

                                          if (
                                            error
                                              .response
                                              ?.data
                                              ?.student
                                          ) {
                                            toast.warning(
                                              "This student already has a placement!"
                                            );
                                          } else {
                                            toast.error(
                                              "Failed to create placement"
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      Save Placement
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )
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

      <button
        style={{
          ...primaryButton,
          marginBottom: "20px",
        }}
        onClick={() =>
          setShowConfirmedPlacements(
          !showConfirmedPlacements
        )
      }
    >
      {showConfirmedPlacements
        ? "Hide Confirmed Placements"
        : "View Confirmed Placements"}
      </button>


      {showConfirmedPlacements && (
  <div
    style={{
      width: "100%",
      marginBottom: "30px",
    }}
  >
    <input
      style={{
        ...inputStyle,
        maxWidth: "400px",
        marginBottom: "15px",
      }}
      placeholder="Search student or organization..."
      value={placementSearch}
      onChange={(e) =>
        setPlacementSearch(e.target.value)
      }
    />

    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>
              Student
            </th>

            <th style={tableHeaderStyle}>
              Organization
            </th>

            <th style={tableHeaderStyle}>
              Workplace Supervisor
            </th>

            <th style={tableHeaderStyle}>
              Academic Supervisor
            </th>

            <th style={tableHeaderStyle}>
              Start / End Date
            </th>

            <th style={tableHeaderStyle}>
              Status
            </th>

            <th style={tableHeaderStyle}>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredConfirmedPlacements.map(
            (p, index) => (
              <tr
                key={p.id}
                style={{
                  backgroundColor:
                    index % 2 === 0
                      ? "#f8f9fa"
                      : "white",
                }}
              >
                <td style={tableCellStyle}>
                  {p.student_name}
                </td>

                <td style={tableCellStyle}>
                  {p.organization_name}
                </td>

                <td style={tableCellStyle}>
                  {p.workplace_supervisor_name}
                </td>

                <td style={tableCellStyle}>
                  {p.academic_supervisor_name}
                </td>

                <td style={tableCellStyle}>
                  {p.start_date} → {p.end_date}
                </td>

                <td style={tableCellStyle}>
                  <span
                    style={{
                      color: "#198754",
                      fontWeight: "bold",
                    }}
                  >
                    Confirmed
                  </span>
                </td>

                <td style={tableCellStyle}>
                  <button
                    style={deleteButtonStyle}
                    onClick={() =>
                      deletePlacement(p.id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

      {pendingPlacements.length === 0 ? (
        <p>No placements yet</p>
      ) : (
        pendingPlacements.map((p) => {

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
                maxWidth: "700px",

                margin: "0 auto 20px",

                background: "#fff",

                border: "1px solid #e5e7eb",

                borderLeft: "5px solid #2575fc",

                padding: "20px",

                borderRadius: "16px",

                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

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
                    style={inputStyle}
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
                    style={inputStyle}
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
                  <select
                    style={inputStyle}
                    value={selectedSupervisors[p.id]?.workplace || ""}
                    onChange={(e) =>
                      handleSupervisorChange(
                        p.id,
                        "workplace",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Workplace Supervisor
                    </option>

                    {workplaceSupervisors.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                      >
                        {u.username}
                      </option>
                    ))}
                  </select>

                  <br /><br />

                  {/* 🔍 ACADEMIC SEARCH */}
                  <select
                    style={inputStyle}
                    value={selectedSupervisors[p.id]?.academic || ""}
                    onChange={(e) =>
                      handleSupervisorChange(
                        p.id,
                        "academic",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Academic Supervisor
                    </option>

                    {academicSupervisors.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                      >
                        {u.username}
                      </option>
                    ))}
                  </select>

                  <br /><br />

                  <button
                    style={primaryButton}
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
              <br /><br />

            <button
              style={deleteButtonStyle}
              
              onMouseEnter ={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }}

              onMouseLeave ={(e) => {
                e.currentTarget.style.backgroundColor = "#ef4444";
              }}  
              onClick={() => deletePlacement(p.id)}
            >
              Delete Placement
            </button>

            </div>
          );
        })
      )}
    </div>
  </>
)}
{activeView === "finalEvaluations" && (
  <>
    <div
      style={{
        display:'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginTop: '30px'
      }}
    >
      <h2>Final Student Evaluations</h2>
      {finalEvaluations.length === 0 ? (
        <p>No evaluations yet</p>
      ) : (   
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{...tableHeaderStyle,borderTopLeftRadius:'16px',}}>Student</th>
                <th style={tableHeaderStyle}>Reg No.</th>
                <th style={tableHeaderStyle}>Organization</th>
                <th style={tableHeaderStyle}>Workplace Supervisor</th>
                <th style={tableHeaderStyle}>Academic Supervisor</th>
                <th style={{...tableHeaderStyle,borderTopRightRadius:'16px',}}>Final Grade</th>
              </tr>
          </thead>
          <tbody>
            {finalEvaluations.map((ev, index) => (
              <tr 
                key={ev.id} 
                
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  transition: "0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#eefbf3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#f8f9fa" : "white";    
                }}
              >
                <td style={tableCellStyle}>{ev.student_name}</td>
                <td style={tableCellStyle}>{ev.student_registration_number}</td>
                <td style={tableCellStyle}>{ev.organization_name}</td>
                <td style={tableCellStyle}>{ev.workplace_supervisor_name}</td>
                <td style={tableCellStyle}>{ev.academic_supervisor_name}</td>
                <td style={tableCellStyle}>
                  <strong>
                    {ev.final_grade}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        
      )}
  </div>
  </>
)}

{activeView === "users" && (
  <>
    <h2>Students</h2>

    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Registration Number</th>
            <th style={tableHeaderStyle}>Action</th>
          </tr>
      </thead>

      <tbody>
        {students.map((user, index) => (
          <tr 
          key={user.id} 
          style={{
            backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
            transition: "0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#eefbf3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f8f9fa" : "white";
            }}
          >
          
            <td style={tableCellStyle}>{user.username}</td>

            <td style={tableCellStyle}>
              <button style={deleteButtonStyle} onClick={() => deleteUser(user.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2>Staff Users</h2>

    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{
            ...tableHeaderStyle,
            borderTopLeftRadius: "16px",
          }}>Email</th>
          <th style={tableHeaderStyle}>Role</th>
          <th style={{
            ...tableHeaderStyle, 
            borderTopRightRadius: "16px"}}>Action</th>
        </tr>
      </thead>

      <tbody>
        {staffUsers.map((user, index) => (
          <tr
            key={user.id}
            style={{
              backgroundColor : index % 2 === 0 ? "#f8f9fa" : "white",
              transition: "0.3s",
            }}  
            
            onMouseEnter ={(e) => {
              e.currentTarget.style.backgroundColor = "#eefbf3";
            }}
            
            onMouseLeave ={(e)=> {
              e.currentTarget.style.backgroundColor =
                index % 2 == 0 ? "#f8f9fa" :"white";
            }}
          >
            <td style={tableCellStyle}>{user.username}</td>

            <td style={tableCellStyle}>{user.role}</td>

            <td style={tableCellStyle}>
              <button style={deleteButtonStyle} onClick={() => deleteUser(user.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </>
)}



   
    </div>    
  </div>
);
}

export default AdminDashboard;