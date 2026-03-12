import React, { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style jsx="true">{`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideInLeft { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
    @keyframes slideInRight { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:translateX(0); } }
    @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.6;} }
    @keyframes countUp { from{opacity:0;} to{opacity:1;} }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.5; }
      66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
    }
    @keyframes float2 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
      33% { transform: translate(-40px, 40px) scale(1.2); opacity: 0.4; }
      66% { transform: translate(30px, -20px) scale(0.8); opacity: 0.3; }
    }
    @keyframes thunder {
      0%, 90%, 100% { opacity: 0; }
      91% { opacity: 0.8; }
      92% { opacity: 0; }
      93% { opacity: 1; }
      94% { opacity: 0; }
      95% { opacity: 0.9; }
      96% { opacity: 0; }
    }
    .page-enter { animation: fadeInUp 0.3s ease forwards; }
    .row-animate { opacity:0; animation: fadeInUp 0.4s ease forwards; }
    .slide-left { animation: slideInLeft 0.5s ease forwards; }
    .slide-right { animation: slideInRight 0.5s ease forwards; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 12px 16px; }
    input:focus { outline: none; }
    button { cursor: pointer; border: none; font-family: inherit; }
    @media (max-width: 768px) {
      .analyze-grid { flex-direction: column !important; }
      .deco-panel { display: none !important; }
      .metrics-row { flex-wrap: wrap !important; }
      .metrics-row > div { flex: 1 1 45% !important; border-right: none !important; border-bottom: 1px solid var(--light-gray) !important; }
      .score-grid { flex-direction: column !important; }
      .timeline-card { min-width: 260px !important; }
      .nav-tabs { gap: 4px !important; }
      .nav-tab span { display: none; }
    }
  `}</style>
);

/* ─── MOCK DATA ──────────────────────────────────────────────────────── */
const mockResults = {
  repoUrl: "https://github.com/rift-org/hackathon-2025",
  teamName: "RIFT ORGANISERS",
  leaderName: "Saiyam Kumar",
  branchName: "RIFT_ORGANISERS_SAIYAM_AI_Fix",
  status: "PASSED",
  failuresDetected: 11,
  fixesApplied: 10,
  timeTaken: "4m 18s",
  score: { base: 100, speedBonus: 10, efficiencyPenalty: -3, total: 100 },
  fixes: [
    { file: "src/utils.py", bugType: "LINTING", line: 15, commit: "fix: remove unused import 'os' from utils.py", status: "Fixed", error: "Unused import 'os'", solution: "Remove the import statement" },
    { file: "src/validator.py", bugType: "SYNTAX", line: 8, commit: "fix: add missing colon in validator.py line 8", status: "Fixed", error: "Missing colon", solution: "Add the colon at the correct position" },
    { file: "tests/test_api.js", bugType: "SYNTAX", line: 17, commit: "fix: correct arrow function syntax in async test handler", status: "Fixed", error: "Invalid arrow function syntax", solution: "Fix async arrow function declaration" },
    { file: "src/parser.py", bugType: "LINTING", line: 42, commit: "fix: resolve unused import warnings in parser module", status: "Fixed", error: "Unused import 'json'", solution: "Remove unused import statement" },
    { file: "src/config.py", bugType: "TYPE_ERROR", line: 23, commit: "fix: correct type annotation for config parameter", status: "Fixed", error: "Type mismatch: expected str, got int", solution: "Update type annotation to Union[str, int]" },
    { file: "src/database.py", bugType: "IMPORT", line: 5, commit: "fix: add missing import for SQLAlchemy", status: "Fixed", error: "Module 'sqlalchemy' not imported", solution: "Add import statement for sqlalchemy" },
    { file: "src/helpers.py", bugType: "INDENTATION", line: 34, commit: "fix: correct indentation in helper function", status: "Fixed", error: "IndentationError: unexpected indent", solution: "Fix indentation to match function scope" },
    { file: "src/models.py", bugType: "LOGIC", line: 67, commit: "fix: correct logic error in validation method", status: "Fixed", error: "Logic error: condition always evaluates to False", solution: "Update conditional logic to check correct variable" },
    { file: "src/routes.py", bugType: "SYNTAX", line: 91, commit: "fix: add missing parenthesis in route decorator", status: "Fixed", error: "SyntaxError: invalid syntax", solution: "Add closing parenthesis" },
    { file: "tests/test_utils.py", bugType: "LINTING", line: 12, commit: "fix: remove unused variable in test case", status: "Fixed", error: "Unused variable 'result'", solution: "Remove or use the variable" }
  ],
  timeline: [
    { run: 1, status: "FAILED", time: "20:14:03", duration: "1m 02s", fixes: 4, errors: 7, commits: ["a1b2c3d fix: initial linting fixes", "e4f5a6b fix: remove syntax errors in parser"], errorList: [{ file: "src/utils.py", error: "Unused import 'os'", status: "fixed" }, { file: "src/validator.py", error: "Missing colon", status: "fixed" }, { file: "tests/test_api.js", error: "Invalid arrow function syntax", status: "fixed" }, { file: "src/parser.py", error: "Unused import 'json'", status: "fixed" }] },
    { run: 2, status: "FAILED", time: "20:15:12", duration: "58s", fixes: 3, errors: 3, commits: ["f7g8h9i fix: type errors and imports"], errorList: [{ file: "src/config.py", error: "Type mismatch: expected str, got int", status: "fixed" }, { file: "src/database.py", error: "Module 'sqlalchemy' not imported", status: "fixed" }, { file: "src/helpers.py", error: "IndentationError: unexpected indent", status: "fixed" }] },
    { run: 3, status: "PASSED", time: "20:16:18", duration: "45s", fixes: 3, errors: 0, commits: ["j1k2l3m fix: final logic and syntax corrections"], errorList: [{ file: "src/models.py", error: "Logic error: condition always evaluates to False", status: "fixed" }, { file: "src/routes.py", error: "SyntaxError: invalid syntax", status: "fixed" }, { file: "tests/test_utils.py", error: "Unused variable 'result'", status: "fixed" }] }
  ]
};

const leaderboard = [
  { team: "RIFT ORGANISERS", score: 100, rank: 3, you: true },
  { team: "CodeStorm Alpha", score: 100, rank: 1 },
];

/* ─── SVG ICONS ──────────────────────────────────────────────────────── */
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

const LockIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#c5c3bc"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const CheckIcon = ({ color = "#14784a" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="3,8 6,11 13,4" />
  </svg>
);

/* ─── BUG TYPE BADGE ─────────────────────────────────────────────────── */
const bugColors = {
  LINTING: { bg: "#eaf0f8", color: "#1e3a5f" },
  SYNTAX: { bg: "#fdf6e3", color: "#c17d11" },
  LOGIC: { bg: "#f3e8ff", color: "#6b21a8" },
  TYPE_ERROR: { bg: "#fdf0ef", color: "#c0392b" },
  IMPORT: { bg: "#e8f5ef", color: "#14784a" },
  INDENTATION: { bg: "#f0f0ee", color: "#6b6860" },
};
const BugBadge = ({ type }) => {
  const c = bugColors[type] || { bg: "#f0f0ee", color: "#6b6860" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </span>
  );
};

/* ─── STATUS BADGE ───────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const passed = status === "PASSED";
  return (
    <span
      style={{
        background: passed ? "#e8f5ef" : "#fdf0ef",
        color: passed ? "#14784a" : "#c0392b",
        border: `1px solid ${passed ? "#14784a" : "#c0392b"}`,
        borderRadius: 20,
        padding: "6px 16px",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        animation: "pulse 2.5s ease infinite",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: passed ? "#14784a" : "#c0392b",
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
};

/* ─── NAVBAR ─────────────────────────────────────────────────────────── */
const Navbar = ({ activePage, setActivePage, isLoggedIn, userProfile, onLogin }) => {
  const tabs = isLoggedIn
    ? ["dashboard", "analyze", "results", "score", "timeline", "profile"]
    : ["analyze", "results", "score", "timeline"];
  const labels = {
    dashboard: "Dashboard",
    analyze: "Analyze",
    results: "Results",
    score: "Score",
    timeline: "Timeline",
    profile: "Profile",
  };
  return (
    <nav
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
        background: "rgba(255,255,255,0.88)",
        borderBottom: "1px solid #e8e7e3",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: "#2a2926",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PipelineIcon size={20} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#111110",
              lineHeight: 1.1,
            }}
          >
            Monster
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#6b6860",
              fontWeight: 300,
            }}
          >
            Team Jigyasa
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div
        className="nav-tabs"
        style={{
          display: "flex",
          gap: 6,
          background: "#f2f1ee",
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
              background: activePage === tab ? "#2a2926" : "transparent",
              color: activePage === tab ? "#fff" : "#6b6860",
              transition: "all 0.2s ease",
              border: "none",
            }}
          >
            <span>{labels[tab]}</span>
          </button>
        ))}
      </div>
      {/* Status & Login */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              background: "#14784a",
              borderRadius: "50%",
              animation: "dotPulse 2s ease infinite",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#2a2926",
              fontWeight: 500,
            }}
          >
            Agent Ready
          </span>
        </div>
        {isLoggedIn && userProfile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={userProfile.avatar_url}
              alt={userProfile.username}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid #e8e7e3",
              }}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#2a2926",
                fontWeight: 500,
              }}
            >
              {userProfile.username}
            </span>
          </div>
        ) : (
          <button
            onClick={onLogin}
            style={{
              padding: "8px 20px",
              background: "#2a2926",
              color: "#fff",
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s ease",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#111110";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2a2926";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Login with GitHub
          </button>
        )}
      </div>
    </nav>
  );
};

/* ─── EMPTY STATE ────────────────────────────────────────────────────── */
const EmptyState = ({ onGoAnalyze }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: 20,
    }}
  >
    <LockIcon />
    <div
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22,
        fontStyle: "italic",
        color: "#6b6860",
        textAlign: "center",
      }}
    >
      Run the agent first to see results
    </div>
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: "#c5c3bc",
      }}
    >
      Head to the Analyze tab to get started
    </div>
    <button
      onClick={onGoAnalyze}
      style={{
        marginTop: 8,
        padding: "10px 28px",
        background: "#2a2926",
        color: "#fff",
        borderRadius: 10,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Go to Analyze →
    </button>
  </div>
);

/* ─── PAGE 1: ANALYZE ────────────────────────────────────────────────── */
const loadingSteps = [
  "Cloning Repo",
  "Detecting Failures",
  "Applying Fixes",
  "Running CI/CD",
];

const AnalyzePage = ({
  formData,
  setFormData,
  isLoading,
  loadingStep,
  onRun,
}) => {
  const [focused, setFocused] = useState("");
  const inputStyle = (name) => ({
    width: "100%",
    height: 52,
    padding: "0 16px",
    background: "#f2f1ee",
    border: `1.5px solid ${focused === name ? "#2a2926" : "#e8e7e3"}`,
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: "#111110",
    transition: "border-color 0.2s ease",
  });
  const [hoverBtn, setHoverBtn] = useState("");

  return (
    <div
      className="page-enter"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 48px 64px" }}
    >
      <div
        className="analyze-grid"
        style={{ display: "flex", gap: 40, alignItems: "flex-start" }}
      >
        {/* Left decorative panel */}
        <div
          className="deco-panel"
          style={{
            width: "42%",
            minWidth: 340,
            height: 540,
            borderRadius: 20,
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)",
            backgroundSize: "400% 400%",
            animation: "gradientShift 8s ease infinite",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PipelineIcon size={18} />
            </div>
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
              }}
            >
              View Docs →
            </button>
          </div>
          {/* Decorative grid lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Bottom text */}
          <div
            style={{ position: "absolute", bottom: 56, left: 28, right: 28 }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.35,
              }}
            >
              Intelligent pipelines.
              <br />
              Flawless delivery.
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Powered by AI — built for speed
            </div>
          </div>
          {/* Dots */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 6,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: i === 0 ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === 0 ? "#fff" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right form */}
        <div style={{ flex: 1, paddingTop: 12 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40,
              fontWeight: 700,
              color: "#111110",
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Create a Run
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: "#6b6860",
              marginBottom: 32,
            }}
          >
            Analyze your repository and auto-fix CI/CD failures.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              {
                key: "repoUrl",
                label: "GitHub Repository URL",
                placeholder: "https://github.com/org/repo",
              },
              {
                key: "teamName",
                label: "Team Name",
                placeholder: "e.g. RIFT ORGANISERS",
              },
              {
                key: "leaderName",
                label: "Team Leader Name",
                placeholder: "e.g. Saiyam Kumar",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#2a2926",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, [key]: e.target.value }))
                  }
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused("")}
                  style={inputStyle(key)}
                />
              </div>
            ))}
          </div>

          {/* Run Agent button */}
          <button
            onClick={onRun}
            disabled={isLoading}
            onMouseEnter={() => setHoverBtn("run")}
            onMouseLeave={() => setHoverBtn("")}
            style={{
              width: "100%",
              height: 54,
              background: "#2a2926",
              color: "#fff",
              borderRadius: 10,
              fontFamily: isLoading
                ? "'DM Mono', monospace"
                : "'Playfair Display', serif",
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transform:
                hoverBtn === "run" && !isLoading
                  ? "translateY(-1px)"
                  : "translateY(0)",
              boxShadow:
                hoverBtn === "run" && !isLoading
                  ? "0 8px 24px rgba(0,0,0,0.2)"
                  : "0 4px 12px rgba(0,0,0,0.12)",
              transition: "all 0.2s ease",
              opacity: isLoading ? 0.85 : 1,
            }}
          >
            {isLoading && (
              <span
                style={{
                  width: 18,
                  height: 18,
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }}
              />
            )}
            {isLoading ? "Analyzing…" : "Run Agent"}
          </button>

          {/* Loading steps */}
          {isLoading && (
            <div
              style={{
                marginTop: 24,
                padding: 20,
                background: "#f8f8f6",
                borderRadius: 12,
                border: "1px solid #e8e7e3",
              }}
            >
              {loadingSteps.map((step, i) => {
                const done = i < loadingStep;
                const active = i === loadingStep;
                return (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 0",
                      opacity: i > loadingStep ? 0.4 : 1,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: done
                          ? "#e8f5ef"
                          : active
                            ? "#2a2926"
                            : "#e8e7e3",
                        animation: active ? "pulse 1s ease infinite" : "none",
                        flexShrink: 0,
                      }}
                    >
                      {done ? (
                        <CheckIcon />
                      ) : active ? (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            background: "#fff",
                            borderRadius: "50%",
                            display: "block",
                          }}
                        />
                      ) : null}
                    </div>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        color: done
                          ? "#14784a"
                          : active
                            ? "#111110"
                            : "#6b6860",
                      }}
                    >
                      {done ? "✓ " : ""}
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#e8e7e3" }} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "#c5c3bc",
                whiteSpace: "nowrap",
              }}
            >
              or configure manually
            </span>
            <div style={{ flex: 1, height: 1, background: "#e8e7e3" }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              [
                "Load Sample Data",
                () =>
                  setFormData({
                    repoUrl: mockResults.repoUrl,
                    teamName: mockResults.teamName,
                    leaderName: mockResults.leaderName,
                  }),
              ],
              [
                "Reset Form",
                () =>
                  setFormData({ repoUrl: "", teamName: "", leaderName: "" }),
              ],
            ].map(([label, action]) => (
              <button
                key={label}
                onClick={action}
                style={{
                  flex: 1,
                  height: 46,
                  background: "transparent",
                  border: "1.5px solid #e8e7e3",
                  borderRadius: 10,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "#2a2926",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2a2926";
                  e.currentTarget.style.background = "#f2f1ee";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e7e3";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── PAGE 2: RESULTS ────────────────────────────────────────────────── */
const ResultsPage = ({ results }) => {
  const [visibleRows, setVisibleRows] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setVisibleRows(i);
      if (i >= results.fixes.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="page-enter"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 48px 64px" }}
    >
      {/* Summary Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
          padding: 40,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                color: "#2a2926",
                marginBottom: 8,
                maxWidth: 380,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {results.repoUrl}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  background: "#f2f1ee",
                  border: "1px solid #e8e7e3",
                  borderRadius: 20,
                  padding: "4px 14px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2a2926",
                }}
              >
                {results.teamName}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "#6b6860",
                }}
              >
                Lead: <strong>{results.leaderName}</strong>
              </span>
            </div>
          </div>
          <StatusBadge status={results.status} />
        </div>
      </div>

      {/* Fixes Applied Table */}
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 32 }}>
        <div style={{ padding: "32px 40px 20px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#111110", marginBottom: 8 }}>
            Fixes Applied
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
            {results.fixesApplied} fixes applied out of {results.failuresDetected} failures detected
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f8f6", borderBottom: "2px solid #e8e7e3" }}>
                <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926" }}>File</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926" }}>Bug Type</th>
                <th style={{ padding: "16px 24px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926" }}>Line</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926" }}>Commit Message</th>
                <th style={{ padding: "16px 24px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.fixes.map((fix, idx) => {
                const isVisible = idx < visibleRows;
                const isFixed = fix.status === "Fixed";
                return (
                  <tr
                    key={idx}
                    className={isVisible ? "row-animate" : ""}
                    style={{
                      borderBottom: "1px solid #f2f1ee",
                      animationDelay: `${idx * 0.05}s`,
                      background: isFixed ? "rgba(232, 245, 239, 0.3)" : "rgba(253, 240, 239, 0.3)"
                    }}
                  >
                    <td style={{ padding: "16px 24px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#2a2926" }}>{fix.file}</td>
                    <td style={{ padding: "16px 24px" }}><BugBadge type={fix.bugType} /></td>
                    <td style={{ padding: "16px 24px", textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#6b6860" }}>{fix.line}</td>
                    <td style={{ padding: "16px 24px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860" }}>{fix.commit}</td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: 12,
                        background: isFixed ? "#e8f5ef" : "#fdf0ef",
                        color: isFixed ? "#14784a" : "#c0392b",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {isFixed ? "✓" : "✗"} {fix.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── PAGE 3: SCORE ──────────────────────────────────────────────────── */
const ScorePage = ({ results }) => (
  <div className="page-enter" style={{ maxWidth: 1400, margin: "0 auto", padding: "96px 48px 64px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, gap: 40, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 320 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Performance Analysis</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "#111110", lineHeight: 1.2 }}>Score Breakdown</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "#fff", border: "1px solid #e8e7e3", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", marginBottom: 4, fontWeight: 500 }}>Base Score</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c5c3bc" }}>Initial evaluation score</div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, color: "#2a2926" }}>{results.score.base}</div>
          </div>
          <div style={{ background: "#fff", border: "2px solid #14784a", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#14784a", marginBottom: 4, fontWeight: 600 }}>Speed Bonus</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6860" }}>Completed in {results.timeTaken}</div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, color: "#14784a" }}>+{results.score.speedBonus}</div>
          </div>
          <div style={{ background: "#fff", border: "2px solid #c0392b", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#c0392b", marginBottom: 4, fontWeight: 600 }}>Efficiency Penalty</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6860" }}>Resource optimization</div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, color: "#c0392b" }}>{results.score.efficiencyPenalty}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{ background: "#f8f8f6", borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6860", marginBottom: 8 }}>Failures Detected</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#2a2926" }}>{results.failuresDetected}</div>
          </div>
          <div style={{ background: "#f8f8f6", borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6860", marginBottom: 8 }}>Fixes Applied</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#14784a" }}>{results.fixesApplied}</div>
          </div>
        </div>
      </div>
      <div style={{ width: 420, flexShrink: 0 }}>
        <div style={{ background: "linear-gradient(135deg, #2a2926 0%, #111110 100%)", borderRadius: 24, padding: 48, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>Final Score</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 96, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 24 }}>{results.score.total}</div>
            <div style={{ display: "inline-block", padding: "8px 20px", background: "rgba(255,255,255,0.15)", borderRadius: 20, backdropFilter: "blur(10px)" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{results.status}</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, background: "#fff", border: "1px solid #e8e7e3", borderRadius: 16, padding: 24 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2a2926", fontWeight: 600, marginBottom: 16 }}>Repository Details</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6b6860", marginBottom: 4 }}>Team</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#2a2926", fontWeight: 500 }}>{results.teamName}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6b6860", marginBottom: 4 }}>Leader</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#2a2926", fontWeight: 500 }}>{results.leaderName}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6b6860", marginBottom: 4 }}>Branch</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#2a2926" }}>{results.branchName}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── PAGE 4: TIMELINE ───────────────────────────────────────────────── */
const TimelinePage = ({ results }) => {
  const retryLimit = 5;
  const iterationsUsed = results.timeline.length;

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 48px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: "#111110" }}>
          CI/CD Timeline
        </h1>
        <div style={{
          padding: "12px 24px",
          background: "#f2f1ee",
          borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: "#2a2926"
        }}>
          Iterations: {iterationsUsed}/{retryLimit}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div style={{ position: "relative", paddingLeft: 40 }}>
        {/* Vertical Line */}
        <div style={{
          position: "absolute",
          left: 20,
          top: 0,
          bottom: 0,
          width: 3,
          background: "linear-gradient(180deg, #2a2926 0%, #e8e7e3 100%)",
          borderRadius: 2
        }} />

        {results.timeline.map((run, idx) => {
          const isPassed = run.status === "PASSED";
          const isFailed = run.status === "FAILED";

          return (
            <div key={idx} style={{ position: "relative", marginBottom: 32 }}>
              {/* Timeline Dot */}
              <div style={{
                position: "absolute",
                left: -28,
                top: 24,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: isPassed ? "#14784a" : isFailed ? "#c0392b" : "#c17d11",
                border: "3px solid #fff",
                boxShadow: "0 0 0 3px rgba(0,0,0,0.1)",
                zIndex: 1
              }} />

              {/* Run Card */}
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: 32,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                border: `2px solid ${isPassed ? "#e8f5ef" : isFailed ? "#fdf0ef" : "#fdf6e3"}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: "#111110" }}>
                        Run #{run.run}
                      </div>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 12,
                        background: isPassed ? "#e8f5ef" : isFailed ? "#fdf0ef" : "#fdf6e3",
                        color: isPassed ? "#14784a" : isFailed ? "#c0392b" : "#c17d11",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        {run.status}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#6b6860" }}>
                      {run.time} • Duration: {run.duration}
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                  <div style={{ padding: 16, background: "#e8f5ef", borderRadius: 12 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#14784a", marginBottom: 4, fontWeight: 600 }}>Fixes Applied</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#14784a" }}>{run.fixes}</div>
                  </div>
                  <div style={{ padding: 16, background: "#fdf0ef", borderRadius: 12 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c0392b", marginBottom: 4, fontWeight: 600 }}>Errors Remaining</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#c0392b" }}>{run.errors}</div>
                  </div>
                  <div style={{ padding: 16, background: "#f2f1ee", borderRadius: 12 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#2a2926", marginBottom: 4, fontWeight: 600 }}>Commits</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#2a2926" }}>{run.commits.length}</div>
                  </div>
                </div>

                {/* Commits Section */}
                {run.commits.length > 0 && (
                  <div style={{ borderTop: "1px solid #e8e7e3", paddingTop: 16 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926", marginBottom: 12 }}>Commits:</div>
                    {run.commits.map((commit, i) => (
                      <div key={i} style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12,
                        color: "#6b6860",
                        marginBottom: 6,
                        padding: "8px 12px",
                        background: "#f8f8f6",
                        borderRadius: 8
                      }}>
                        {commit}
                      </div>
                    ))}
                  </div>
                )}

                {/* Error List */}
                {run.errorList && run.errorList.length > 0 && (
                  <div style={{ borderTop: "1px solid #e8e7e3", paddingTop: 16, marginTop: 16 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2a2926", marginBottom: 12 }}>Issues Addressed:</div>
                    {run.errorList.map((error, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: error.status === "fixed" ? "#e8f5ef" : "#fdf0ef",
                        borderRadius: 8,
                        marginBottom: 8
                      }}>
                        <div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#2a2926", fontWeight: 600 }}>{error.file}</div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6b6860" }}>{error.error}</div>
                        </div>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: error.status === "fixed" ? "#14784a" : "#c0392b",
                          color: "#fff",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase"
                        }}>
                          {error.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── DASHBOARD PAGE ────────────────────────────────────────────────── */
const DashboardPage = ({ userProfile }) => {
  const [repos, setRepos] = useState([]);
  const [clonedRepos, setClonedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const api = (await import('./services/api.js')).default;
      console.log('Fetching repos and cloned repos...');
      const [reposList, clonedList] = await Promise.all([
        api.getUserRepos().catch(err => { console.error('Repos error:', err); return []; }),
        api.getClonedRepos().catch(err => { console.error('Cloned error:', err); return []; })
      ]);
      console.log('Repos fetched:', reposList.length);
      console.log('Cloned fetched:', clonedList.length);
      setRepos(reposList);
      setClonedRepos(clonedList);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      alert('Failed to load repositories. Check console for details.');
    }
    setLoading(false);
  };

  const handleCloneRepo = async (repo) => {
    try {
      const api = (await import('./services/api.js')).default;
      await api.cloneRepository({
        repo_url: repo.clone_url,
        repo_name: repo.name
      });
      alert(`${repo.name} cloned successfully!`);
      fetchData();
    } catch (err) {
      alert('Failed to clone repository: ' + err.message);
    }
  };

  const handleRemoveCloned = async (repoName) => {
    try {
      const api = (await import('./services/api.js')).default;
      await api.removeClonedRepo(repoName);
      fetchData();
    } catch (err) {
      alert('Failed to remove repository: ' + err.message);
    }
  };

  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" ||
      (filterType === "public" && !repo.private) ||
      (filterType === "private" && repo.private);
    return matchesSearch && matchesFilter;
  });

  const isCloned = (repoName) => clonedRepos.some(c => c.repo_name === repoName);

  if (!userProfile) {
    return (
      <div style={{ padding: "96px 48px 64px", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#6b6860" }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: "0 auto", padding: "96px 48px 64px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={userProfile.avatar_url}
            alt={userProfile.username}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "3px solid #e8e7e3"
            }}
          />
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#111110",
              marginBottom: 4
            }}>
              Welcome, {userProfile.name}
            </h1>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#6b6860"
            }}>
              @{userProfile.username} • {userProfile.public_repos + userProfile.private_repos} repositories
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            padding: "12px 20px",
            background: "#e8f5ef",
            borderRadius: 12,
            textAlign: "center"
          }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#14784a" }}>
              {clonedRepos.length}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6860" }}>
              Cloned
            </div>
          </div>
          <div style={{
            padding: "12px 20px",
            background: "#f2f1ee",
            borderRadius: 12,
            textAlign: "center"
          }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#2a2926" }}>
              {repos.length}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6860" }}>
              Total Repos
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: "flex",
        gap: 16,
        marginBottom: 24,
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: 300,
            height: 48,
            padding: "0 16px",
            background: "#fff",
            border: "1.5px solid #e8e7e3",
            borderRadius: 10,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#111110"
          }}
        />
        <div style={{ display: "flex", gap: 6, background: "#f2f1ee", borderRadius: 10, padding: "4px" }}>
          {[
            { key: "all", label: "All" },
            { key: "public", label: "Public" },
            { key: "private", label: "Private" }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: filterType === key ? 600 : 400,
                background: filterType === key ? "#2a2926" : "transparent",
                color: filterType === key ? "#fff" : "#6b6860",
                border: "none",
                transition: "all 0.2s ease"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Repository Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#6b6860" }}>
            Loading repositories...
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 20
        }}>
          {filteredRepos.map((repo) => {
            const cloned = isCloned(repo.name);
            return (
              <div key={repo.id} style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                border: cloned ? "2px solid #14784a" : "1px solid #e8e7e3",
                transition: "all 0.2s ease"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#111110",
                        margin: 0
                      }}>
                        {repo.name}
                      </h3>
                      {repo.private && (
                        <span style={{
                          background: "#fdf0ef",
                          color: "#c0392b",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 10,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600
                        }}>
                          Private
                        </span>
                      )}
                      {cloned && (
                        <span style={{
                          background: "#e8f5ef",
                          color: "#14784a",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 10,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600
                        }}>
                          ✓ Cloned
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "#6b6860",
                      margin: 0,
                      marginBottom: 12,
                      lineHeight: 1.4,
                      height: 36,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {repo.description || "No description available"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <span style={{
                        background: "#f2f1ee",
                        color: "#2a2926",
                        padding: "4px 8px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600
                      }}>
                        {repo.language || "Unknown"}
                      </span>
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: "#c5c3bc"
                      }}>
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {cloned ? (
                    <>
                      <button
                        onClick={() => handleRemoveCloned(repo.name)}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          background: "#c0392b",
                          color: "#fff",
                          borderRadius: 8,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          border: "none",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#a93226";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#c0392b";
                        }}
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => window.open(repo.html_url, '_blank')}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          background: "transparent",
                          color: "#2a2926",
                          border: "1px solid #e8e7e3",
                          borderRadius: 8,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f2f1ee";
                          e.currentTarget.style.borderColor = "#2a2926";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "#e8e7e3";
                        }}
                      >
                        View on GitHub
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCloneRepo(repo)}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          background: "#2a2926",
                          color: "#fff",
                          borderRadius: 8,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          border: "none",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#111110";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#2a2926";
                        }}
                      >
                        Clone to Workspace
                      </button>
                      <button
                        onClick={() => window.open(repo.html_url, '_blank')}
                        style={{
                          padding: "10px 16px",
                          background: "transparent",
                          color: "#2a2926",
                          border: "1px solid #e8e7e3",
                          borderRadius: 8,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f2f1ee";
                          e.currentTarget.style.borderColor = "#2a2926";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "#e8e7e3";
                        }}
                      >
                        View
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredRepos.length === 0 && !loading && (
        <div style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#6b6860" }}>
            No repositories found matching your search.
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── PROFILE PAGE ────────────────────────────────────────────────── */
function ProfilePage({ userProfile }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [repos, setRepos] = useState([]);
  const [clonedRepos, setClonedRepos] = useState([]);
  const [fixedBranches, setFixedBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "repos") {
      fetchRepos();
    } else if (activeTab === "cloned") {
      fetchClonedRepos();
    } else if (activeTab === "fixed") {
      fetchFixedBranches();
    }
  }, [activeTab]);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const api = (await import('./services/api.js')).default;
      const reposList = await api.getUserRepos();
      setRepos(reposList);
    } catch (err) {
      console.error('Failed to fetch repos:', err);
    }
    setLoading(false);
  };

  const fetchClonedRepos = async () => {
    setLoading(true);
    try {
      const api = (await import('./services/api.js')).default;
      const clonedList = await api.getClonedRepos();
      setClonedRepos(clonedList);
    } catch (err) {
      console.error('Failed to fetch cloned repos:', err);
    }
    setLoading(false);
  };

  const fetchFixedBranches = async () => {
    setLoading(true);
    try {
      const api = (await import('./services/api.js')).default;
      const branches = await api.getFixedBranches();
      setFixedBranches(branches);
    } catch (err) {
      console.error('Failed to fetch fixed branches:', err);
    }
    setLoading(false);
  };

  const handleCloneRepo = async (repo) => {
    try {
      const api = (await import('./services/api.js')).default;
      await api.cloneRepository({
        repo_url: repo.clone_url,
        repo_name: repo.name
      });
      alert(`${repo.name} cloned successfully!`);
      if (activeTab === "cloned") {
        fetchClonedRepos();
      }
    } catch (err) {
      alert('Failed to clone repository: ' + err.message);
    }
  };

  const handleRemoveCloned = async (repoName) => {
    try {
      const api = (await import('./services/api.js')).default;
      await api.removeClonedRepo(repoName);
      fetchClonedRepos();
    } catch (err) {
      alert('Failed to remove repository: ' + err.message);
    }
  };

  const handleRemoveFixedBranch = async (branchName) => {
    try {
      const api = (await import('./services/api.js')).default;
      await api.removeFixedBranch(branchName);
      fetchFixedBranches();
    } catch (err) {
      alert('Failed to remove fixed branch: ' + err.message);
    }
  };

  if (!userProfile) {
    return (
      <div style={{ padding: "96px 48px 64px", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#6b6860" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 48px 64px" }}>
      {/* Profile Header */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        padding: 40,
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 24
      }}>
        <img
          src={userProfile.avatar_url}
          alt={userProfile.username}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "3px solid #e8e7e3"
          }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#111110",
            marginBottom: 8
          }}>
            {userProfile.name}
          </h1>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            color: "#6b6860",
            marginBottom: 16
          }}>
            @{userProfile.username}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#111110" }}>
                {userProfile.public_repos}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", marginLeft: 6 }}>
                Public Repos
              </span>
            </div>
            <div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#111110" }}>
                {userProfile.private_repos}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", marginLeft: 6 }}>
                Private Repos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        background: "#f2f1ee",
        borderRadius: 20,
        padding: "4px",
        marginBottom: 32,
        width: "fit-content"
      }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "repos", label: "GitHub Repos" },
          { key: "cloned", label: "Cloned Repos" },
          { key: "fixed", label: "Fixed Branches" }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: "8px 20px",
              borderRadius: 16,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: activeTab === key ? 600 : 400,
              background: activeTab === key ? "#2a2926" : "transparent",
              color: activeTab === key ? "#fff" : "#6b6860",
              transition: "all 0.2s ease",
              border: "none"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          padding: 40
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#111110",
            marginBottom: 20
          }}>
            Account Overview
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            <div style={{ padding: 20, background: "#f8f8f6", borderRadius: 12 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", marginBottom: 6 }}>
                Username
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#111110" }}>
                {userProfile.username}
              </div>
            </div>
            <div style={{ padding: 20, background: "#f8f8f6", borderRadius: 12 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", marginBottom: 6 }}>
                Email
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#111110" }}>
                {userProfile.email || "Not provided"}
              </div>
            </div>
            <div style={{ padding: 20, background: "#f8f8f6", borderRadius: 12 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6860", marginBottom: 6 }}>
                Total Repositories
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#111110" }}>
                {userProfile.public_repos + userProfile.private_repos}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "repos" && (
        <div style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <div style={{ padding: "32px 40px 20px" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#111110",
              marginBottom: 4
            }}>
              GitHub Repositories
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#6b6860"
            }}>
              Your public and private repositories from GitHub
            </p>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
                Loading repositories...
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: "auto" }}>
              {repos.map((repo) => (
                <div key={repo.id} style={{
                  padding: "20px 40px",
                  borderBottom: "1px solid #f2f1ee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#111110",
                        margin: 0
                      }}>
                        {repo.name}
                      </h3>
                      {repo.private && (
                        <span style={{
                          background: "#fdf0ef",
                          color: "#c0392b",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600
                        }}>
                          Private
                        </span>
                      )}
                      <span style={{
                        background: "#e8f5ef",
                        color: "#14784a",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600
                      }}>
                        {repo.language}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "#6b6860",
                      margin: 0,
                      marginBottom: 8
                    }}>
                      {repo.description || "No description"}
                    </p>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "#c5c3bc"
                    }}>
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCloneRepo(repo)}
                    style={{
                      padding: "8px 16px",
                      background: "#2a2926",
                      color: "#fff",
                      borderRadius: 8,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      border: "none",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#111110";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#2a2926";
                    }}
                  >
                    Clone
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "cloned" && (
        <div style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <div style={{ padding: "32px 40px 20px" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#111110",
              marginBottom: 4
            }}>
              Cloned Repositories
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#6b6860"
            }}>
              Repositories you've cloned to this workspace
            </p>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
                Loading cloned repositories...
              </div>
            </div>
          ) : clonedRepos.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
                No repositories cloned yet. Go to GitHub Repos tab to clone some!
              </div>
            </div>
          ) : (
            <div>
              {clonedRepos.map((repo, index) => (
                <div key={index} style={{
                  padding: "20px 40px",
                  borderBottom: "1px solid #f2f1ee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#111110",
                      margin: 0,
                      marginBottom: 8
                    }}>
                      {repo.repo_name}
                    </h3>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: "#6b6860",
                      marginBottom: 8
                    }}>
                      {repo.repo_url}
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      color: "#c5c3bc"
                    }}>
                      Cloned {new Date(repo.cloned_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCloned(repo.repo_name)}
                    style={{
                      padding: "8px 16px",
                      background: "#c0392b",
                      color: "#fff",
                      borderRadius: 8,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      border: "none",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#a93226";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#c0392b";
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "fixed" && (
        <div style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <div style={{ padding: "32px 40px 20px" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#111110",
              marginBottom: 4
            }}>
              Fixed Branches
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#6b6860"
            }}>
              AI-fixed branches created by the pipeline agent
            </p>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
                Loading fixed branches...
              </div>
            </div>
          ) : fixedBranches.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
                No fixed branches yet. Run the pipeline agent to create some!
              </div>
            </div>
          ) : (
            <div>
              {fixedBranches.map((branch, index) => (
                <div key={index} style={{
                  padding: "20px 40px",
                  borderBottom: "1px solid #f2f1ee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h3 style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#111110",
                        margin: 0
                      }}>
                        {branch.branch_name}
                      </h3>
                      <span style={{
                        background: branch.status === "COMPLETED" ? "#e8f5ef" : "#fdf0ef",
                        color: branch.status === "COMPLETED" ? "#14784a" : "#c0392b",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600
                      }}>
                        {branch.status}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: "#6b6860",
                      marginBottom: 8
                    }}>
                      {branch.repo_name} • {branch.fixes_applied} fixes applied
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      color: "#c5c3bc"
                    }}>
                      Created {new Date(branch.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => window.open(branch.branch_url, '_blank')}
                      style={{
                        padding: "8px 16px",
                        background: "#2a2926",
                        color: "#fff",
                        borderRadius: 8,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        border: "none",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#111110";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#2a2926";
                      }}
                    >
                      View Branch
                    </button>
                    <button
                      onClick={() => handleRemoveFixedBranch(branch.branch_name)}
                      style={{
                        padding: "8px 16px",
                        background: "#c0392b",
                        color: "#fff",
                        borderRadius: 8,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        border: "none",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#a93226";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#c0392b";
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "32px 40px 20px" }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#111110",
            marginBottom: 4
          }}>
            Cloned Repositories
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#6b6860"
          }}>
            Repositories you've cloned to this workspace
          </p>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
              Loading cloned repositories...
            </div>
          </div>
        ) : clonedRepos.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6860" }}>
              No repositories cloned yet. Go to GitHub Repos tab to clone some!
            </div>
          </div>
        ) : (
          <div>
            {clonedRepos.map((repo, index) => (
              <div key={index} style={{
                padding: "20px 40px",
                borderBottom: "1px solid #f2f1ee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111110",
                    margin: 0,
                    marginBottom: 8
                  }}>
                    {repo.repo_name}
                  </h3>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    color: "#6b6860",
                    marginBottom: 8
                  }}>
                    {repo.repo_url}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "#c5c3bc"
                  }}>
                    Cloned {new Date(repo.cloned_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCloned(repo.repo_name)}
                  style={{
                    padding: "8px 16px",
                    background: "#c0392b",
                    color: "#fff",
                    borderRadius: 8,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    border: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#a93226";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#c0392b";
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────── */
export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activePage, setActivePage] = useState("analyze");
  const [formData, setFormData] = useState({
    repoUrl: "",
    teamName: "",
    leaderName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleRun = useCallback(async () => {
    // Validate inputs
    if (!formData.repoUrl || !formData.teamName || !formData.leaderName) {
      alert('Please fill in all fields before running the agent');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    try {
      // Simulate loading steps
      const steps = ["Cloning Repo", "Detecting Failures", "Applying Fixes", "Running CI/CD"];
      let stepInterval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 1000);

      // Call the actual backend API
      const api = (await import('./services/api.js')).default;
      const result = await api.runPipeline(
        formData.repoUrl,
        formData.teamName,
        formData.leaderName
      );

      clearInterval(stepInterval);
      setLoadingStep(steps.length);

      // Fetch the actual results
      const results = await api.getResults(result.run_id);

      // Update mock results with real data
      Object.assign(mockResults, {
        repoUrl: results.repo_url,
        teamName: results.team_name,
        leaderName: results.leader_name,
        branchName: results.branch_name,
        status: results.status,
        failuresDetected: results.failures_detected,
        fixesApplied: results.fixes_applied,
        timeTaken: results.time_taken || '0m 0s'
      });

      setHasResults(true);
      setActivePage("results");
    } catch (error) {
      console.error('Pipeline failed:', error);
      alert('Pipeline execution failed: ' + error.message + '\n\nPlease ensure:\n1. Backend server is running\n2. You are logged in\n3. Repository URL is valid');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleTabClick = (tab) => {
    if (
      (tab === "results" || tab === "score" || tab === "timeline") &&
      !hasResults
    ) {
      setActivePage(tab);
    } else {
      setActivePage(tab);
    }
  };

  const handleLogin = async () => {
    try {
      const api = (await import('./services/api.js')).default;
      const { auth_url } = await api.getGitHubAuthUrl();
      window.location.href = auth_url;
    } catch (err) {
      console.error('Login error:', err);
      alert('Failed to initiate GitHub login: ' + err.message);
    }
  };

  // Check for auth token on mount
  // Check for auth token on mount
  useEffect(() => {
    // Check for token in URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('access_token', tokenFromUrl);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoggedIn(true);
      setShowLanding(false);
      setActivePage("dashboard");
      // Fetch user profile
      import('./services/api.js').then(({ default: api }) => {
        api.getUserProfile().then(profile => {
          setUserProfile(profile);
        }).catch(() => {
          localStorage.removeItem('access_token');
          setIsLoggedIn(false);
          setActivePage("analyze");
        });
      });
      return;
    }

    // Check for existing token in localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      // DO NOT auto-hide landing page for returning users
      // setShowLanding(false);

      // Fetch user profile
      import('./services/api.js').then(({ default: api }) => {
        api.getUserProfile().then(profile => {
          setUserProfile(profile);
        }).catch(() => {
          localStorage.removeItem('access_token');
          setIsLoggedIn(false);
        });
      });
    }
  }, []);

  const renderPage = () => {
    if (
      (activePage === "results" ||
        activePage === "score" ||
        activePage === "timeline") &&
      !hasResults
    ) {
      return <EmptyState onGoAnalyze={() => setActivePage("analyze")} />;
    }
    switch (activePage) {
      case "dashboard":
        return <DashboardPage userProfile={userProfile} />;
      case "analyze":
        return (
          <AnalyzePage
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            loadingStep={loadingStep}
            onRun={handleRun}
          />
        );
      case "results":
        return <ResultsPage results={mockResults} />;
      case "score":
        return <ScorePage results={mockResults} />;
      case "timeline":
        return <TimelinePage results={mockResults} />;
      case "profile":
        return <ProfilePage userProfile={userProfile} />;
      default:
        return null;
    }
  };

  if (showLanding) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "#0a0a20" }}>
        <GlobalStyles />
        {/* ── Aurora Background CSS ── */}
        <style>{`
          @keyframes aurora1 {
            0%,100% { transform: translate(-10%, -10%) rotate(0deg) scale(1.1); }
            50%     { transform: translate(10%, 10%) rotate(-15deg) scale(1.4); }
          }
          @keyframes aurora2 {
            0%,100% { transform: translate(10%, 10%) rotate(10deg) scale(1.2); }
            50%     { transform: translate(-15%, -10%) rotate(0deg) scale(1.5); }
          }
          @keyframes aurora3 {
            0%,100% { transform: translate(0, 5%) rotate(-5deg) scale(1.3); }
            50%     { transform: translate(20%, -15%) rotate(15deg) scale(1.1); }
          }
          @keyframes landingIn {
            from { opacity:0; transform: translateY(24px); }
            to   { opacity:1; transform: translateY(0); }
          }
          .landing-hero { animation: landingIn 0.7s cubic-bezier(.22,1,.36,1) 0.1s both; }
          .landing-cta:hover {
            box-shadow: 0 0 32px rgba(99, 102, 241, 0.45) !important;
            transform: translateY(-2px) !important;
            background: rgba(255,255,255,0.15) !important;
          }
          .landing-login:hover {
            background: rgba(255,255,255,0.18) !important;
          }
        `}</style>

        {/* Deep dark base */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse at bottom, #111130 0%, #060614 100%)",
        }} />

        {/* Aurora Blurs */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, filter: "blur(120px)", opacity: 0.8 }}>
          {/* Teal Aurora */}
          <div style={{
            position: "absolute", width: "70%", height: "60%",
            background: "linear-gradient(135deg, rgba(8,145,178,0.7) 0%, transparent 80%)",
            top: "-10%", left: "-10%",
            borderRadius: "40% 60% 70% 30%",
            animation: "aurora1 18s ease-in-out infinite",
          }} />
          {/* Deep Purple / Pink Aurora */}
          <div style={{
            position: "absolute", width: "80%", height: "70%",
            background: "linear-gradient(135deg, rgba(147,51,234,0.6) 0%, rgba(192,38,211,0.2) 80%)",
            bottom: "-20%", right: "-10%",
            borderRadius: "60% 40% 30% 70%",
            animation: "aurora2 22s ease-in-out infinite",
          }} />
          {/* Bright Indigo Core */}
          <div style={{
            position: "absolute", width: "60%", height: "50%",
            background: "radial-gradient(circle, rgba(79,70,229,0.5) 0%, transparent 70%)",
            top: "20%", left: "20%",
            animation: "aurora3 15s ease-in-out infinite",
          }} />
        </div>

        {/* ── Navbar ── */}
        <nav style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 64, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px",
        }}>
          {/* Brand */}
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17,
            color: "#fff", letterSpacing: "0.02em",
          }}>
            RIFT 2026
          </div>
          {/* Login / Profile */}
          {isLoggedIn && userProfile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={userProfile.avatar_url}
                alt={userProfile.username}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)" }}
              />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#fff", fontWeight: 500 }}>
                {userProfile.username}
              </span>
            </div>
          ) : (
            <button
              className="landing-login"
              onClick={handleLogin}
              style={{
                padding: "8px 22px",
                background: "rgba(255,255,255,0.10)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 50,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "background 0.2s ease",
              }}
            >
              Log in
            </button>
          )}
        </nav>

        {/* ── Hero ── */}
        <div style={{
          position: "relative", zIndex: 5,
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "80px 32px 48px",
        }}>
          {/* App icon */}
          <div className="landing-icon" style={{
            width: 88, height: 88, borderRadius: 22,
            background: "#fff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 32,
            flexShrink: 0,
          }}>
            {/* Terminal-style pipeline icon in brand gradient */}
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <defs>
                <linearGradient id="iconGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f8ef7" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <rect width="52" height="52" rx="14" fill="url(#iconGrad)" />
              <polyline points="14,20 22,26 14,32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="26" y1="32" x2="38" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Title */}
          <div className="landing-hero">
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(52px, 8vw, 80px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 18px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              Monster
            </h1>

            {/* Subtitle */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(14px, 2vw, 17px)",
              color: "rgba(255,255,255,0.72)",
              maxWidth: 540,
              margin: "0 auto 36px",
              lineHeight: 1.6,
            }}>
              Automatically detect and fix CI/CD pipeline failures with AI-powered analysis. Built for RIFT 2026.
            </p>

            {/* CTA Button */}
            <button
              className="landing-cta"
              onClick={() => {
                setShowLanding(false);
                if (isLoggedIn) setActivePage("dashboard");
              }}
              style={{
                padding: "16px 44px",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.2)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.22s ease",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                letterSpacing: "0.02em",
              }}
            >
              {isLoggedIn ? "Go to Dashboard →" : "Get Started →"}
            </button>

            {/* Team tag */}
            <p style={{
              marginTop: 48,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Team Jigyasa
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6" }}>
      <GlobalStyles />
      <Navbar
        activePage={activePage}
        setActivePage={handleTabClick}
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onLogin={handleLogin}
      />
      <main>{renderPage()}</main>
    </div>
  );
}




