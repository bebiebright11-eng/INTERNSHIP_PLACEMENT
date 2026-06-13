function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#222",
        color: "white",
        padding: "30px",
        marginTop: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "30px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3>ILES</h3>

          <p>
            Internship Placement Management System for
            managing placements, supervision, evaluations,
            and student progress.
          </p>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Quick Links</h3>

          <p>Home</p>
          <p>Students</p>
          <p>Evaluations</p>
          <p>Weekly Logs</p>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Contact Us</h3>

          <p>Email: support@iles.com</p>
          <p>Phone: +256 744 329 151</p>
        </div>
      </div>

      <hr
        style={{
          marginTop: "20px",
          borderColor: "#444",
        }}
      />

      <p
        style={{
          textAlign: "center",
          marginTop: "15px",
        }}
      >
        ©️ 2026 Internship Placement System (ILES)
      </p>
    </footer>
  );
}

export default Footer;