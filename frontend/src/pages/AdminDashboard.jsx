import {useEffect, useState} from "react";
import API from "../api";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

const [organizations, setOrganizations] = useState([]);

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

    // update UI instantly
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

    // remove from UI instantly
    setOrganizations((prev) => prev.filter((org) => org.id !== id));

    alert("Deleted!");
  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
};

const fetchOrganizations = async () => {
  try {
    const res = await API.get("internships/organizations/");
    setOrganizations(res.data);
  } catch (err) {
    console.log(err);
  }
};

const groupApplicationsByOrganization = () => {
  const grouped = {};

  applications.forEach((app) => {
    const student = app.student_name;

    if (!grouped[student]) {
      grouped[student] = [];
    }
    grouped[student].push(app);
  });
  return grouped;

}

  const fetchApplications = async () => {
   try {
    const res = await API.get("internships/applications/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setApplications(res.data);
  } catch (error) {
    console.log(error);
  }
};

const[pacementFormData, setPlacementFormData] = useState({
  start_date: '',
  end_date:'',
});

const[selectedSupervisors, setSelectedSupervisors]  = useState({});

const[showDropdown, setShowDropdown] = useState({});

const[savedRows,setSavedRows] =useState({});
const[criteria, setcriteria] =useState({});
const[newCriteria, setNewCriteria] = useState({
  name: '',
  max_score: '',
});


const updateStatus = async (id, status) => {
    try {
      await API.patch(
        `internships/applications/${id}/`,
        { status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Updated successfully!");
      fetchApplications(); // refresh data

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
    fetchPlacements(); // refresh placements

  } catch (error) {
    console.log(error);
    alert("Failed to assign supervisors");
  }
};

  const createOrganization = async () => {
  if (!orgForm.name || !orgForm.location) {
    alert("Name and location are required");
    return;
  }

  try {
    const res = await API.post("organizations/", orgForm);

    setOrganizations((prev) => [...prev, res.data]);

    // reset form
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

const fetchCriteria = async () => {
  try {
    const res = await API.get("supervision/criteria/");
    console.log("CRITERIA:", res.data); // 🔥 DEBUG
    setCriteria(res.data);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchApplications();
  fetchPlacements();
  fetchSupervisors();
  fetchOrganizations();
  fetchCriteria();
}, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Applications</h2>

      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app.id}>
            <p><strong>Student:</strong> {app.student}</p>
            <p><strong>Organization:</strong> {app.organization}</p>
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
          </div>
         ))
       )}

      <h2>Placements</h2>

    {placements.length === 0 ? (
      <p>No placements yet</p>
    ) : (
      placements.map((p) => (
        <div key={p.id}>
          <p><strong>Student:</strong> {p.student}</p>
          <p><strong>Organization:</strong> {p.organization}</p>

          <select id={`workplace-${p.id}`}>
            <option>Select Workplace Supervisor</option>
            {supervisors
              .filter((u) => u.role === "workplace")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
          </select>


          <br /><br />
          
          <select id={`academic-${p.id}`}>
            <option>Select Academic Supervisor</option>
            {supervisors
              .filter((u) => u.role === "academic")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
          </select>
         
         <br /><br />
         
          <button
            onClick={() =>
              assignSupervisors(
                p.id,
               document.getElementById(`workplace-${p.id}`).value,
               document.getElementById(`academic-${p.id}`).value
             )
           }
          >
           Assign Supervisors
          </button>  


        </div>
      ))
    )}

    </div>    
  );
}

export default AdminDashboard;