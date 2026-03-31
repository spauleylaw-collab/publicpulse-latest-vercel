import React, { useState, useEffect } from "react";

/* =========================
   CONSTANTS
========================= */

const PERSONAS = {
  PUBLIC: "public",
  ADMIN: "admin",
  DEPARTMENT: "department",
};

const TABS = {
  HOME: "home",
  REPORT: "report",
  CITY: "city",
  DEPARTMENT: "department",
};

const DEPARTMENTS = [
  "Street Department",
  "Utilities",
  "Parks",
  "Traffic Operations",
  "Code Enforcement",
  "Hastings Fire",
  "Police",
  "Administration",
  "Public Works",
];

/* =========================
   MAIN APP
========================= */

export default function App() {
  const [persona, setPersona] = useState(PERSONAS.PUBLIC);
  const [activeTab, setActiveTab] = useState(TABS.HOME);

  const [issues, setIssues] = useState([
    {
      id: "1",
      title: "Pothole on Burlington",
      description: "Large pothole causing traffic issues",
      department: "Street Department",
      status: "Under Review",
      x: 40,
      y: 50,
      affected: 3,
    },
  ]);

  const [selectedIssueId, setSelectedIssueId] = useState("1");
  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  const [reportMode, setReportMode] = useState(false);
  const [reportPin, setReportPin] = useState(null);

  const [remindHours, setRemindHours] = useState("24");

  /* =========================
     MAP CLICK
  ========================= */

  function handleMapClick(e) {
    if (!reportMode) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setReportPin({ x, y });

    const newIssue = {
      id: Date.now().toString(),
      title: "New Issue",
      description: "Reported issue",
      department: "Administration",
      status: "Under Review",
      x,
      y,
      affected: 1,
    };

    setIssues([newIssue, ...issues]);
    setSelectedIssueId(newIssue.id);
    setReportMode(false);
  }

  /* =========================
     REMIND LATER
  ========================= */

  function remindLater() {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === selectedIssueId
          ? { ...i, status: "Under Review" }
          : i
      )
    );
  }

  /* =========================
     MAP
  ========================= */

  function renderMap() {
    return (
      <div
        onClick={handleMapClick}
        style={{
          height: 500,
          background: "#eaf3fb",
          borderRadius: 16,
          position: "relative",
          cursor: reportMode ? "crosshair" : "default",
        }}
      >
        {issues.map((i) => (
          <div
            key={i.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIssueId(i.id);
            }}
            style={{
              position: "absolute",
              left: `${i.x}%`,
              top: `${i.y}%`,
              transform: "translate(-50%, -100%)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                background: "#f44336",
                borderRadius: "50%",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  /* =========================
     PUBLIC HOME
  ========================= */

  function renderPublic() {
    return (
      <>
        {renderMap()}

        <h3>What’s going on right now</h3>

        {selectedIssue && (
          <div style={{ border: "1px solid #ccc", padding: 10 }}>
            <strong>{selectedIssue.title}</strong>
            <p>{selectedIssue.description}</p>

            <button
              onClick={() => {
                setIssues((prev) =>
                  prev.map((i) =>
                    i.id === selectedIssue.id
                      ? { ...i, affected: i.affected + 1 }
                      : i
                  )
                );
              }}
            >
              I’m affected
            </button>

            <div>Residents affected: {selectedIssue.affected}</div>
          </div>
        )}
      </>
    );
  }

  /* =========================
     CITY COMMAND CENTER
  ========================= */

  function renderCity() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* LEFT */}
        <div>
          <h3>Issue</h3>
          {selectedIssue && (
            <>
              <strong>{selectedIssue.title}</strong>
              <p>{selectedIssue.description}</p>
              <div>Status: {selectedIssue.status}</div>
            </>
          )}

          <h4>Queue</h4>
          {issues.map((i) => (
            <div key={i.id} onClick={() => setSelectedIssueId(i.id)}>
              {i.title}
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div>
          <h3>Actions</h3>

          <button>Confirm Routing</button>

          <select>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button>Reassign</button>

          <button>Escalate</button>

          <div>
            <strong>Remind Later</strong>
            <select
              value={remindHours}
              onChange={(e) => setRemindHours(e.target.value)}
            >
              <option value="24">24 hours</option>
              <option value="168">7 days</option>
            </select>

            <button onClick={remindLater}>Set Reminder</button>
          </div>

          <textarea placeholder="Special Instructions" />
        </div>

        {/* RIGHT */}
        <div>
          <h3>Insights</h3>
          <div>Budget + notifications here</div>
        </div>
      </div>
    );
  }

  /* =========================
     DEPARTMENT
  ========================= */

  function renderDepartment() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <div>
          <h3>Issue</h3>
          {selectedIssue && <div>{selectedIssue.title}</div>}
        </div>

        <div>
          <h3>Actions</h3>
          <button>Confirm Routing</button>
          <button>In Progress</button>
          <button>Monitoring</button>
          <button>Resolved</button>
        </div>

        <div>
          <h3>Insights</h3>
        </div>
      </div>
    );
  }

  /* =========================
     NAV
  ========================= */

  function renderNav() {
    let tabs = [];

    if (persona === PERSONAS.PUBLIC) {
      tabs = ["Home", "Report"];
    } else if (persona === PERSONAS.ADMIN) {
      tabs = ["Map", "Command"];
    } else {
      tabs = ["Map", "Operations"];
    }

    return (
      <div style={{ marginTop: 20 }}>
        {tabs.map((t) => (
          <button key={t}>{t}</button>
        ))}
      </div>
    );
  }

  /* =========================
     MAIN
  ========================= */

  return (
    <div style={{ padding: 20 }}>
      <h1>PublicPulse</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setPersona(PERSONAS.PUBLIC)}>Public</button>
        <button onClick={() => setPersona(PERSONAS.ADMIN)}>City</button>
        <button onClick={() => setPersona(PERSONAS.DEPARTMENT)}>Department</button>
      </div>

      {persona === PERSONAS.PUBLIC && renderPublic()}
      {persona === PERSONAS.ADMIN && renderCity()}
      {persona === PERSONAS.DEPARTMENT && renderDepartment()}

      {renderNav()}
    </div>
  );
}