// ONLY showing key structure + updated sections to keep this usable in chat
// You will REPLACE your existing App.jsx with this

import React, { useState, useMemo } from "react";

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

const ROUTING_DEPARTMENTS = [
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

  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [commandForm, setCommandForm] = useState({
    specialInstructions: "",
    reassignDepartment: "Administration",
    multiDepartments: [],
  });

  const [remindLaterHours, setRemindLaterHours] = useState("24");

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId),
    [items, selectedItemId]
  );

  /* =========================
     MODE TOGGLE
  ========================= */

  function renderModeToggle() {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setPersona(PERSONAS.PUBLIC)}>Public</button>
        <button onClick={() => setPersona(PERSONAS.ADMIN)}>City</button>
        <button onClick={() => setPersona(PERSONAS.DEPARTMENT)}>Department</button>
      </div>
    );
  }

  /* =========================
     REMIND LATER
  ========================= */

  function applyRemindLater(hours) {
    if (!selectedItem) return;

    const remindAt = new Date(Date.now() + hours * 3600000);

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status: "Under Review",
              publicStatus: "Under Review",
              reviewReminderAt: remindAt.toISOString(),
            }
          : item
      )
    );
  }

  /* =========================
     CITY COMMAND CENTER
  ========================= */

  function renderCityCommandCenter() {
    return (
      <div>
        <h2>Command Center</h2>

        {selectedItem && (
          <>
            <div>{selectedItem.title}</div>

            <button>Confirm Routing</button>

            <select
              value={commandForm.reassignDepartment}
              onChange={(e) =>
                setCommandForm({
                  ...commandForm,
                  reassignDepartment: e.target.value,
                })
              }
            >
              {ROUTING_DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <button>Reassign</button>

            <button>Escalate</button>

            <div>
              <strong>Multi-Department</strong>
              {ROUTING_DEPARTMENTS.map((d) => (
                <label key={d}>
                  <input type="checkbox" /> {d}
                </label>
              ))}
            </div>

            <div>
              <strong>Remind Later</strong>
              <select
                value={remindLaterHours}
                onChange={(e) => setRemindLaterHours(e.target.value)}
              >
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                <option value="240">10 days</option>
              </select>

              <button onClick={() => applyRemindLater(remindLaterHours)}>
                Remind Later
              </button>
            </div>

            <textarea
              placeholder="Special Instructions"
              value={commandForm.specialInstructions}
              onChange={(e) =>
                setCommandForm({
                  ...commandForm,
                  specialInstructions: e.target.value,
                })
              }
            />
          </>
        )}
      </div>
    );
  }

  /* =========================
     DEPARTMENT OPERATIONS
  ========================= */

  function renderDepartmentOperations() {
    return (
      <div>
        <h2>Operations</h2>

        {selectedItem && (
          <>
            <div>{selectedItem.title}</div>

            <button>Confirm Routing</button>
            <button>In Progress</button>
            <button>Monitoring</button>
            <button>Resolved</button>

            <textarea
              placeholder="Special Instructions"
              value={commandForm.specialInstructions}
              onChange={(e) =>
                setCommandForm({
                  ...commandForm,
                  specialInstructions: e.target.value,
                })
              }
            />
          </>
        )}
      </div>
    );
  }

  /* =========================
     NAVIGATION
  ========================= */

  function renderBottomNav() {
    let tabs = [];

    if (persona === PERSONAS.PUBLIC) {
      tabs = [
        { key: TABS.HOME, label: "Home" },
        { key: TABS.REPORT, label: "Report" },
      ];
    }

    if (persona === PERSONAS.ADMIN) {
      tabs = [
        { key: TABS.HOME, label: "Map" },
        { key: TABS.CITY, label: "Command Center" },
      ];
    }

    if (persona === PERSONAS.DEPARTMENT) {
      tabs = [
        { key: TABS.HOME, label: "Map" },
        { key: TABS.DEPARTMENT, label: "Operations" },
      ];
    }

    return (
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  /* =========================
     MAIN RENDER
  ========================= */

  return (
    <div style={{ padding: 20 }}>
      <h1>PublicPulse</h1>

      {renderModeToggle()}

      {activeTab === TABS.HOME && <div>Map goes here</div>}

      {activeTab === TABS.REPORT && persona === PERSONAS.PUBLIC && (
        <div>Report flow</div>
      )}

      {activeTab === TABS.CITY &&
        persona === PERSONAS.ADMIN &&
        renderCityCommandCenter()}

      {activeTab === TABS.DEPARTMENT &&
        persona === PERSONAS.DEPARTMENT &&
        renderDepartmentOperations()}

      {renderBottomNav()}
    </div>
  );
}