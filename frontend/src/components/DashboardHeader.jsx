function DashboardHeader({
  dashboardTitle,
  firstName,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#198754,#157347)",
        color: "white",
        padding: "20px 30px",
        borderRadius: "18px",
        marginBottom: "25px",
        boxShadow:
          "0 6px 20px rgba(0,0,0,0.15)",
        width: "100%",  
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* LOGO */}
        <img
          src="/logo.png"
          alt="Makerere University"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "contain",
            background: "white",
            borderRadius: "50%",
            padding: "5px",
          }}
        />

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: "bold",
            }}
          >
            Makerere University
          </h1>

          <h2
            style={{
              margin: "5px 0",
              fontSize: "26px",
              fontWeight: "normal",
            }}
          >
            Internship Placement System (ILES)
          </h2>

          <p
            style={{
              margin: 0,
              opacity: 0.95,
            }}
          >
            {dashboardTitle}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "15px",
          fontSize: "20px",
        }}
      >
        Welcome,{" "}
        <strong>
          {firstName || "User"}
        </strong>
        👋
      </div>
    </div>
  );
}

export default DashboardHeader;