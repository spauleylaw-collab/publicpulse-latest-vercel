import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [viewMode, setViewMode] = useState("public"); // public | command | department
  const [reportMode, setReportMode] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [issueIndex, setIssueIndex] = useState(0);

  const [reportData, setReportData] = useState({
    description: "",
    instructions: "",
    photo: null
  });

  const [pins, setPins] = useState([
    {
      id: 1,
      x: 30,
      y: 42,
      description: "Pothole causing rough traffic near downtown.",
      category: "Road Repair",
      status: "Received",
      source: "resident",
      department: "Streets",
      actionType: "Repair",
      escalationHours: 48,
      lastUpdatedBy: "Resident",
      lastUpdatedText: "Resident reported this on PublicPulse 1 hour ago",
      updates:
        "Resident reported this on PublicPulse 1 hour ago.",
      instructions: "",
      support: 3
    },
    {
      id: 2,
      x: 64,
      y: 28,
      description: "Playground equipment inspection and repair planned.",
      category: "Parks",
      status: "Assigned",
      source: "city",
      department: "Parks",
      actionType: "Inspect",
      escalationHours: 72,
      lastUpdatedBy: "City Admin",
      lastUpdatedText: "City has initiated work to address this",
      updates:
        "City has initiated work to address this and directed Parks to inspect and respond.",
      instructions: "Check equipment and post update after inspection.",
      support: 0
    },
    {
      id: 3,
      x: 53,
      y: 70,
      description: "Stormwater pooling near intersection after recent rain.",
      category: "Utilities",
      status: "In Progress",
      source: "resident",
      department: "Utilities",
      actionType: "Inspect",
      escalationHours: 24,
      lastUpdatedBy: "Utilities",
      lastUpdatedText: "Work is underway: utility team inspecting drainage issue",
      updates:
        "Work is underway: utility team inspecting drainage issue and evaluating next repair step.",
      instructions: "",
      support: 2
    }
  ]);

  const [commandQueue, setCommandQueue] = useState([
    {
      id: "cq-1",
      issueId: 1,
      title: "Downtown pothole",
      status: "Needs Review",
      priority: "Standard",
      departmentSuggestion: "Streets"
    },
    {
      id: "cq-2",
      issueId: 2,
      title: "Playground repair project",
      status: "Assigned",
      priority: "Planned",
      departmentSuggestion: "Parks"
    },
    {
      id: "cq-3",
      issueId: 3,
      title: "Stormwater pooling",
      status: "Active",
      priority: "High",
      departmentSuggestion: "Utilities"
    }
  ]);

  const [departmentQueue, setDepartmentQueue] = useState([
    {
      id: "dq-1",
      issueId: 2,
      title: "Playground equipment inspection",
      department: "Parks",
      state: "Assigned",
      timeline: "Within 3 days",
      health: "green"
    },
    {
      id: "dq-2",
      issueId: 3,
      title: "Drainage inspection",
      department: "Utilities",
      state: "In Progress",
      timeline: "Today",
      health: "yellow"
    }
  ]);

  useEffect(() => {
    if (pins.length === 0) return;
    const interval = setInterval(() => {
      setIssueIndex((prev) => (prev + 1) % pins.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [pins]);

  const currentIssue = useMemo(() => {
    if (!pins.length) return null;
    return pins[issueIndex];
  }, [pins, issueIndex]);

  const detectCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("pothole") || t.includes("road") || t.includes("street")) {
      return "Road Repair";
    }
    if (
      t.includes("water") ||
      t.includes("drain") ||
      t.includes("storm") ||
      t.includes("sewer") ||
      t.includes("utility")
    ) {
      return "Utilities";
    }
    if (
      t.includes("park") ||
      t.includes("bench") ||
      t.includes("playground") ||
      t.includes("tree")
    ) {
      return "Parks";
    }
    if (t.includes("fire") || t.includes("smoke")) {
      return "Fire";
    }
    return "General";
  };

  const getDefaultDepartment = (category) => {
    if (category === "Road Repair") return "Streets";
    if (category === "Utilities") return "Utilities";
    if (category === "Parks") return "Parks";
    if (category === "Fire") return "Fire";
    return "City Review";
  };

  const getDefaultActionType = (category) => {
    if (category === "Road Repair") return "Repair";
    if (category === "Utilities") return "Inspect";
    if (category === "Parks") return "Inspect";
    if (category === "Fire") return "Respond";
    return "Review";
  };

  const getDefaultEscalationHours = (category) => {
    if (category === "Utilities") return 24;
    if (category === "Road Repair") return 48;
    if (category === "Parks") return 72;
    return 48;
  };

  const getPinColor = (pin) => {
    if (pin.status === "Escalated") return "#d64545";
    if (pin.status === "In Progress") return "#f0a020";
    if (pin.status === "Assigned") return "#2d8cff";
    if (pin.status === "Completed") return "#2ca75f";
    if (pin.status === "Received") return "#7a5cff";
    return "#65758b";
  };

  const getStatusLabel = (pin) => {
    if (pin.status === "Received") {
      return pin.source === "resident"
        ? "Resident reported this on PublicPulse"
        : "City has initiated work to address this";
    }
    if (pin.status === "Under Review") {
      return "City is aware and determining the appropriate next step";
    }
    if (pin.status === "Assigned") {
      return "City has directed the appropriate department to address this";
    }
    if (pin.status === "In Progress") {
      return `Work is underway: ${pin.actionType?.toLowerCase() || "responding"}`;
    }
    if (pin.status === "Completed") {
      return "City has addressed this concern and the issue is now closed";
    }
    if (pin.status === "Escalated") {
      return "Escalated: no activity within expected timeframe";
    }
    return pin.updates;
  };

  const handleMapClick = (e) => {
    if (!reportMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const category = detectCategory(reportData.description);
    const department = getDefaultDepartment(category);
    const actionType = getDefaultActionType(category);
    const escalationHours = getDefaultEscalationHours(category);

    const newPin = {
      id: Date.now(),
      x,
      y,
      description: reportData.description.trim() || "Community concern reported",
      category,
      status: "Received",
      source: "resident",
      department,
      actionType,
      escalationHours,
      lastUpdatedBy: "Resident",
      lastUpdatedText: "Resident reported this on PublicPulse just now",
      updates: "Resident reported this on PublicPulse just now.",
      instructions: reportData.instructions || "",
      support: 0,
      photo: null
    };

    setPins((prev) => [newPin, ...prev]);
    setCommandQueue((prev) => [
      {
        id: `cq-${Date.now()}`,
        issueId: newPin.id,
        title: newPin.description,
        status: department === "City Review" ? "Needs Review" : "Auto-Routed",
        priority: "Standard",
        departmentSuggestion: department
      },
      ...prev
    ]);
    setSelectedPin(newPin);
    setReportMode(false);
    setReportData({
      description: "",
      instructions: "",
      photo: null
    });
  };

  const handleSupport = (id) => {
    setPins((prev) =>
      prev.map((pin) =>
        pin.id === id ? { ...pin, support: pin.support + 1 } : pin
      )
    );

    setSelectedPin((prev) =>
      prev && prev.id === id ? { ...prev, support: prev.support + 1 } : prev
    );
  };

  const startReport = () => {
    setViewMode("public");
    setSelectedPin(null);
    setReportMode(true);
  };

  const statOpen = pins.filter((p) => p.status !== "Completed").length;
  const statEscalated = pins.filter((p) => p.status === "Escalated").length;
  const statInProgress = pins.filter((p) => p.status === "In Progress").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef3f8",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#17324d"
      }}
    >
      <style>{`
        @keyframes pulsePin {
          0% { transform: translate(-50%, -100%) scale(1); opacity: 0.95; }
          50% { transform: translate(-50%, -100%) scale(1.12); opacity: 1; }
          100% { transform: translate(-50%, -100%) scale(1); opacity: 0.95; }
        }

        @keyframes pulseGlow {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.22; }
          50% { transform: translate(-50%, -50%) scale(1.6); opacity: 0.10; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }

        .pp-pin-wrap {
          position: absolute;
          transform: translate(-50%, -100%);
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
        }

        .pp-pin-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          animation: pulseGlow 2.1s infinite ease-out;
          pointer-events: none;
        }

        .pp-pin-shape {
          width: 22px;
          height: 22px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
          animation: pulsePin 2.1s infinite ease-in-out;
          position: relative;
          z-index: 2;
        }

        .pp-scroll {
          scrollbar-width: thin;
        }

        @media (max-width: 980px) {
          .pp-main-grid {
            display: block !important;
          }

          .pp-side-panel {
            margin-top: 14px !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "18px 16px 120px"
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            background: "linear-gradient(135deg, #0a3d91 0%, #0c5fd7 100%)",
            color: "white",
            borderRadius: 26,
            padding: "22px 20px",
            boxShadow: "0 12px 30px rgba(12,95,215,0.18)",
            marginBottom: 14
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 4
                }}
              >
                PublicPulse
              </div>
              <div
                style={{
                  fontSize: 15,
                  opacity: 0.95
                }}
              >
                Hastings — real-time visibility, response, and decision support
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}
            >
              {[
                { key: "public", label: "Public" },
                { key: "command", label: "Command Center" },
                { key: "department", label: "Department" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setViewMode(item.key);
                    setReportMode(false);
                    setSelectedPin(null);
                  }}
                  style={{
                    border: "1px solid rgba(255,255,255,0.28)",
                    background:
                      viewMode === item.key
                        ? "rgba(255,255,255,0.20)"
                        : "rgba(255,255,255,0.08)",
                    color: "white",
                    borderRadius: 14,
                    padding: "10px 14px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 16
            }}
          >
            {[
              `${statOpen} open items`,
              `${statInProgress} in progress`,
              `${statEscalated} escalated`,
              "One shared city map"
            ].map((chip) => (
              <div
                key={chip}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

        {/* PUBLIC HERO CARD */}
        {viewMode === "public" && currentIssue && (
          <div
            style={{
              background: "white",
              borderRadius: 22,
              padding: 22,
              boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
              marginBottom: 14
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 8
              }}
            >
              What’s going on in Hastings right now
            </div>

            <div
              style={{
                fontSize: 28,
                lineHeight: 1.15,
                fontWeight: 800,
                marginBottom: 10
              }}
            >
              {currentIssue.description}
            </div>

            <div
              style={{
                color: "#4f6478",
                fontSize: 15,
                marginBottom: 12
              }}
            >
              {getStatusLabel(currentIssue)}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}
            >
              <div
                style={{
                  borderRadius: 999,
                  background: "#edf4ff",
                  color: "#2355a2",
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 800
                }}
              >
                {currentIssue.status}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  background: "#f4f7fa",
                  color: "#4e6278",
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 800
                }}
              >
                {currentIssue.category}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  background: "#f4f7fa",
                  color: "#4e6278",
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 800
                }}
              >
                Last updated by {currentIssue.lastUpdatedBy}
              </div>
            </div>
          </div>
        )}

        {/* MAIN AREA */}
        <div
          className="pp-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: viewMode === "public" ? "1fr" : "1.75fr 1fr",
            gap: 14
          }}
        >
          {/* MAP COLUMN */}
          <div
            style={{
              background: "white",
              borderRadius: 22,
              padding: 18,
              boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 12
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    marginBottom: 4
                  }}
                >
                  Live city map
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#55697e"
                  }}
                >
                  {reportMode
                    ? "Tap the map to place your report."
                    : viewMode === "command"
                    ? "Use the map with the command queue to direct action."
                    : viewMode === "department"
                    ? "Department view shows assigned and active work on the same map."
                    : "Tap a pin to see what is happening and how the city is responding."}
                </div>
              </div>

              {viewMode === "public" && (
                <button
                  onClick={startReport}
                  style={{
                    border: "none",
                    background: "#0c5fd7",
                    color: "white",
                    borderRadius: 14,
                    padding: "11px 16px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 10px 18px rgba(12,95,215,0.22)"
                  }}
                >
                  Report a Concern
                </button>
              )}
            </div>

            <div
              onClick={handleMapClick}
              style={{
                position: "relative",
                height: 620,
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid #d8e1ea",
                background:
                  "linear-gradient(to bottom, #cfe8ff 0%, #d8eeff 54%, #e9efdf 54%, #f3f5ed 100%)",
                cursor: reportMode ? "crosshair" : "default"
              }}
            >
              {/* background zones */}
              <div
                style={{
                  position: "absolute",
                  top: "12%",
                  left: "8%",
                  width: "20%",
                  height: "20%",
                  background: "#b8d9cf",
                  borderRadius: 24,
                  opacity: 0.72
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "18%",
                  right: "14%",
                  width: "18%",
                  height: "16%",
                  background: "#b7d2d9",
                  borderRadius: 20,
                  opacity: 0.7
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12%",
                  left: "36%",
                  width: "21%",
                  height: "15%",
                  background: "#e8d8b5",
                  borderRadius: 20,
                  opacity: 0.8
                }}
              />

              {/* roads */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: 5,
                  background: "#8a97a6",
                  transform: "translateX(-50%)"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "69%",
                  left: 0,
                  right: 0,
                  height: 5,
                  background: "#8a97a6"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "35%",
                  left: "18%",
                  right: "18%",
                  height: 3,
                  background: "#95a1ae",
                  transform: "rotate(-8deg)"
                }}
              />

              {/* labels */}
              {[
                { text: "North Hastings", top: "12%", left: "8%" },
                { text: "Parks Corridor", top: "23%", left: "71%" },
                { text: "Downtown", top: "71%", left: "43%" }
              ].map((label) => (
                <div
                  key={label.text}
                  style={{
                    position: "absolute",
                    top: label.top,
                    left: label.left,
                    background: "rgba(255,255,255,0.94)",
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.08)"
                  }}
                >
                  {label.text}
                </div>
              ))}

              {/* report mode indicator */}
              {reportMode && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "rgba(10,61,145,0.93)",
                    color: "white",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                    zIndex: 5
                  }}
                >
                  Report mode active — tap the map to place the pin
                </div>
              )}

              {/* pins */}
              {pins.map((pin) => (
                <button
                  key={pin.id}
                  className="pp-pin-wrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(pin);
                  }}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`
                  }}
                  title={pin.description}
                >
                  <div
                    className="pp-pin-glow"
                    style={{
                      background: getPinColor(pin)
                    }}
                  />
                  <div
                    className="pp-pin-shape"
                    style={{
                      background: getPinColor(pin)
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SIDE PANEL FOR COMMAND / DEPARTMENT */}
          {viewMode !== "public" && (
            <div className="pp-side-panel" style={{ display: "grid", gap: 14 }}>
              {viewMode === "command" && (
                <>
                  <div
                    style={{
                      background: "white",
                      borderRadius: 22,
                      padding: 18,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        marginBottom: 8
                      }}
                    >
                      Command Center
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#55697e",
                        lineHeight: 1.5
                      }}
                    >
                      Review new concerns, monitor escalations, and direct the
                      right department response while keeping the map updated.
                    </div>
                  </div>

                  <div
                    style={{
                      background: "white",
                      borderRadius: 22,
                      padding: 18,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        marginBottom: 10
                      }}
                    >
                      Action Center
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <button
                        style={actionButtonStyle("#0c5fd7", "white")}
                        onClick={() => alert("Initiate Work flow comes next after pics.")}
                      >
                        Initiate Work
                      </button>

                      <button
                        style={actionButtonStyle("#f3f6fa", "#28435e")}
                        onClick={() => alert("Assign flow comes next after pics.")}
                      >
                        Assign
                      </button>

                      <button
                        style={actionButtonStyle("#f3f6fa", "#28435e")}
                        onClick={() => alert("Review Later flow comes next after pics.")}
                      >
                        Remind Me Later
                      </button>

                      <button
                        style={actionButtonStyle("#fdecec", "#a63838")}
                        onClick={() => alert("Escalation flow comes next after pics.")}
                      >
                        Escalate
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "white",
                      borderRadius: 22,
                      padding: 18,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        marginBottom: 10
                      }}
                    >
                      Queue
                    </div>

                    <div
                      className="pp-scroll"
                      style={{
                        display: "grid",
                        gap: 10,
                        maxHeight: 350,
                        overflowY: "auto",
                        paddingRight: 4
                      }}
                    >
                      {commandQueue.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            border: "1px solid #e0e7ef",
                            borderRadius: 16,
                            padding: 12,
                            background: "#fbfcfe"
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              marginBottom: 5,
                              fontSize: 14
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#607386",
                              marginBottom: 6
                            }}
                          >
                            {item.status}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap"
                            }}
                          >
                            <span style={miniChipStyle("#edf4ff", "#2458a9")}>
                              {item.departmentSuggestion}
                            </span>
                            <span style={miniChipStyle("#f5f7fa", "#5e7082")}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {viewMode === "department" && (
                <>
                  <div
                    style={{
                      background: "white",
                      borderRadius: 22,
                      padding: 18,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        marginBottom: 8
                      }}
                    >
                      Department Work
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#55697e",
                        lineHeight: 1.5
                      }}
                    >
                      Acknowledge, update, and complete assigned work while
                      keeping the city and residents informed.
                    </div>
                  </div>

                  <div
                    style={{
                      background: "white",
                      borderRadius: 22,
                      padding: 18,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        marginBottom: 10
                      }}
                    >
                      Department Actions
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <button
                        style={actionButtonStyle("#0c5fd7", "white")}
                        onClick={() => alert("Acknowledge flow comes next after pics.")}
                      >
                        Acknowledge
                      </button>

                      <button
                        style={actionButtonStyle("#f3f6fa", "#28435e")}
                        onClick={() => alert("Start Work flow comes next after pics.")}
                      >
                        Start Work
                      </button>

                      <button
                        style={actionButtonStyle("#f3f6fa", "#28435e")}
                        onClick={() => alert("Add Update flow comes next after pics.")}
                      >
                        Add Update
                      </button>

                      <button
                        style={actionButtonStyle("#e8f7ee", "#216b42")}
                        onClick={() => alert("Complete flow comes next after pics.")}
                      >
                        Complete
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "white",
                      borderRadius: 22,
                      padding: 18,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        marginBottom: 10
                      }}
                    >
                      Work Queue
                    </div>

                    <div
                      className="pp-scroll"
                      style={{
                        display: "grid",
                        gap: 10,
                        maxHeight: 350,
                        overflowY: "auto",
                        paddingRight: 4
                      }}
                    >
                      {departmentQueue.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            border: "1px solid #e0e7ef",
                            borderRadius: 16,
                            padding: 12,
                            background: "#fbfcfe"
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              marginBottom: 5,
                              fontSize: 14
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#607386",
                              marginBottom: 6
                            }}
                          >
                            {item.state}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap"
                            }}
                          >
                            <span style={miniChipStyle("#edf4ff", "#2458a9")}>
                              {item.department}
                            </span>
                            <span
                              style={miniChipStyle(
                                item.health === "green"
                                  ? "#e8f7ee"
                                  : item.health === "yellow"
                                  ? "#fff5df"
                                  : "#fdecec",
                                item.health === "green"
                                  ? "#216b42"
                                  : item.health === "yellow"
                                  ? "#996d00"
                                  : "#a63838"
                              )}
                            >
                              {item.timeline}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* REPORT PANEL */}
        {reportMode && (
          <div
            style={{
              position: "fixed",
              right: 18,
              bottom: 92,
              width: "min(420px, calc(100vw - 32px))",
              background: "white",
              borderRadius: 22,
              padding: 18,
              boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
              zIndex: 60
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                marginBottom: 10
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800
                }}
              >
                New Report
              </div>

              <button
                onClick={() => setReportMode(false)}
                style={{
                  border: "1px solid #d6dce5",
                  background: "white",
                  borderRadius: 12,
                  padding: "8px 10px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>

            <textarea
              placeholder="Describe what’s going on..."
              value={reportData.description}
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  description: e.target.value
                }))
              }
              style={textAreaStyle(110)}
            />

            <textarea
              placeholder="Special instructions"
              value={reportData.instructions}
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  instructions: e.target.value
                }))
              }
              style={textAreaStyle(84)}
            />

            <div
              style={{
                fontSize: 13,
                color: "#64788c",
                lineHeight: 1.5
              }}
            >
              Tap the map to place the pin. Photo support is the next task after
              this build.
            </div>
          </div>
        )}

        {/* FLOATING REPORT BUTTON */}
        {viewMode === "public" && !reportMode && (
          <button
            onClick={startReport}
            style={{
              position: "fixed",
              right: 18,
              bottom: 24,
              border: "none",
              background: "#0c5fd7",
              color: "white",
              borderRadius: 999,
              padding: "14px 20px",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 16px 28px rgba(12,95,215,0.28)",
              zIndex: 70
            }}
          >
            + Report
          </button>
        )}

        {/* PIN DETAIL CARD */}
        {selectedPin && (
          <div
            style={{
              position: "fixed",
              left: 16,
              right: 16,
              bottom: 24,
              maxWidth: 760,
              margin: "0 auto",
              background: "white",
              borderRadius: 22,
              padding: 18,
              boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
              zIndex: 80
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                alignItems: "start",
                marginBottom: 10
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 4
                  }}
                >
                  {selectedPin.category}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.45
                  }}
                >
                  {selectedPin.description}
                </div>
              </div>

              <button
                onClick={() => setSelectedPin(null)}
                style={{
                  border: "1px solid #d6dce5",
                  background: "white",
                  borderRadius: 12,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 10
              }}
            >
              <span style={miniChipStyle("#edf4ff", "#2458a9")}>
                {selectedPin.status}
              </span>
              <span style={miniChipStyle("#f5f7fa", "#5e7082")}>
                {selectedPin.department}
              </span>
              <span style={miniChipStyle("#f5f7fa", "#5e7082")}>
                Escalates if no activity in {selectedPin.escalationHours} hours
              </span>
            </div>

            <div
              style={{
                fontSize: 14,
                color: "#4f6478",
                lineHeight: 1.5,
                marginBottom: 10
              }}
            >
              {getStatusLabel(selectedPin)}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#708396",
                marginBottom: 10
              }}
            >
              Last updated by {selectedPin.lastUpdatedBy}
            </div>

            {selectedPin.instructions && (
              <div
                style={{
                  fontSize: 14,
                  marginBottom: 12
                }}
              >
                <strong>Special instructions:</strong> {selectedPin.instructions}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}
            >
              <button
                onClick={() => handleSupport(selectedPin.id)}
                style={{
                  border: "none",
                  background: "#0c5fd7",
                  color: "white",
                  borderRadius: 14,
                  padding: "11px 14px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                I noticed this too ({selectedPin.support})
              </button>

              <div
                style={{
                  background: "#f3f6fa",
                  color: "#41566d",
                  borderRadius: 14,
                  padding: "11px 14px",
                  fontWeight: 700
                }}
              >
                {selectedPin.actionType}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function actionButtonStyle(background, color) {
  return {
    border: "none",
    background,
    color,
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left"
  };
}

function miniChipStyle(background, color) {
  return {
    background,
    color,
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 800
  };
}

function textAreaStyle(minHeight) {
  return {
    width: "100%",
    minHeight,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d6dce5",
    marginBottom: 10,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box"
  };
}