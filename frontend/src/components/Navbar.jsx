import React from 'react';

const PipelineIcon = ({ size = 24, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <line x1="6" y1="9" x2="6" y2="15" />
    <line x1="9" y1="6" x2="15" y2="6" />
    <line x1="6" y1="15" x2="18" y2="15" />
  </svg>
);

const Navbar = ({ activePage, setActivePage }) => {
  const tabs = ["analyze", "results", "score", "timeline"];
  const labels = {
    analyze: "Analyze",
    results: "Results",
    score: "Score",
    timeline: "Timeline",
  };

  return (
    <nav
      className="navbar-responsive"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(3,7,18,0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .navbar-responsive {
            padding: 0 16px !important;
            height: 56px !important;
          }
          .nav-tabs {
            display: none !important;
          }
          .nav-logo-text {
            font-size: 16px !important;
          }
          .nav-logo-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .nav-actions {
            gap: 8px !important;
          }
          .nav-status-text {
            display: none !important;
          }
          .nav-login-btn {
            padding: 6px 12px !important;
            font-size: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-responsive {
            padding: 0 12px !important;
          }
          .nav-subtitle {
            display: none !important;
          }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          className="nav-logo-icon"
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #1e40af, #3b82f6)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(59,130,246,0.3)",
          }}
        >
          <PipelineIcon size={20} />
        </div>
        <div>
          <div
            className="nav-logo-text"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            PipelineIQ
          </div>
          <div
            className="nav-subtitle"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#64748b",
              fontWeight: 300,
            }}
          >
            by Team Jigyasa
          </div>
        </div>
      </div>

      <div
        className="nav-tabs"
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20,
          padding: "4px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActivePage(tab)}
            style={{
              padding: "6px 18px",
              borderRadius: 16,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: activePage === tab ? 600 : 400,
              background: activePage === tab ? "linear-gradient(135deg, #1e40af, #3b82f6)" : "transparent",
              color: activePage === tab ? "#fff" : "#94a3b8",
              transition: "all 0.2s ease",
              border: "none",
            }}
          >
            <span>{labels[tab]}</span>
          </button>
        ))}
      </div>

      <div
        className="nav-actions"
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              background: "#22c55e",
              borderRadius: "50%",
              animation: "dotPulse 2s ease infinite",
              display: "inline-block",
              boxShadow: "0 0 8px rgba(34,197,94,0.5)",
            }}
          />
          <span
            className="nav-status-text"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            Agent Ready
          </span>
        </div>
        <button
          className="nav-login-btn"
          onClick={() => alert('Login functionality coming soon!')}
          style={{
            padding: "8px 20px",
            background: "linear-gradient(135deg, #1e40af, #3b82f6)",
            color: "#fff",
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            transition: "all 0.2s ease",
            border: "none",
            boxShadow: "0 0 20px rgba(59,130,246,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(59,130,246,0.4)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
