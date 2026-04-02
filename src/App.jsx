import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [viewMode, setViewMode] = useState("public");
  const [reportMode, setReportMode] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [issueIndex, setIssueIndex] = useState(0);

  const [reportData, setReportData] = useState({
    description: "",
    instructions: "",
    photo: null
  });

  const [selectedReportType, setSelectedReportType] = useState("Council Summary");
  const [reportPreview, setReportPreview] = useState(
    "A concise overview of current concerns, response activity, escalations, and top recommended next steps for city leadership."
  );

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
      updates: "Resident reported this on PublicPulse 1 hour ago.",
      instructions: "",
      support: 3,
      priority: "Standard",
      queueState: "Needs Review",
      visibility: "public",
      timeline: "Awaiting city review"
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
      support: 0,
      priority: "Planned",
      queueState: "Assigned",
      visibility: "public",
      timeline: "Within 3 days"
    },
    {
      id: 3,
      x: 53,
      y: 70,
      description: "Stormwater pooling near intersection after recent rain.",
      category: "Utilities",
      status: "Assigned",
      source: "resident",
      department: "Utilities",
      actionType: "Inspect",
      escalationHours: 24,
      lastUpdatedBy: "City Admin",
      lastUpdatedText: "City has directed the appropriate department to address this",
      updates:
        "City has directed the appropriate department to address this.",
      instructions: "",
      support: 2,
      priority: "High",
      queueState: "Assigned",
      visibility: "public",
      timeline: "Within 24 hours"
    },
    {
      id: 4,
      x: 43,
      y: 55,
      description: "Sidewalk section near school needs inspection.",
      category: "Road Repair",
      status: "Assigned",
      source: "resident",
      department: "Streets",
      actionType: "Inspect",
      escalationHours: 48,
      lastUpdatedBy: "City Admin",
      lastUpdatedText: "City has directed the appropriate department to address this",
      updates: "City has directed the appropriate department to address this.",
      instructions: "Review pedestrian safety and determine repair priority.",
      support: 1,
      priority: "Standard",
      queueState: "Assigned",
      visibility: "public",
      timeline: "Within 2 days"
    },
    {
      id: 5,
      x: 72,
      y: 44,
      description: "Park bench replacement requested along walking path.",
      category: "Parks",
      status: "Received",
      source: "resident",
      department: "Parks",
      actionType: "Replace",
      escalationHours: 72,
      lastUpdatedBy: "Resident",
      lastUpdatedText: "Resident reported this on PublicPulse 30 minutes ago",
      updates: "Resident reported this on PublicPulse 30 minutes ago.",
      instructions: "",
      support: 0,
      priority: "Routine",
      queueState: "Needs Review",
      visibility: "public",
      timeline: "Awaiting city review"
    }
  ]);

  const [selectedCommandId, setSelectedCommandId] = useState(1);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(2);

  const [assignDepartment, setAssignDepartment] = useState("Streets");
  const [assignActionType, setAssignActionType] = useState("Inspect");
  const [assignEscalation, setAssignEscalation] = useState("48");
  const [assignInstructions, setAssignInstructions] = useState("");
  const [assignReviewLater, setAssignReviewLater] = useState("Tomorrow");

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

  const commandItems = useMemo(() => {
    return pins
      .filter((p) => p.status !== "Completed")
      .sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  }, [pins]);

  const departmentItems = useMemo(() => {
    return pins
      .filter(
        (p) =>
          p.department !== "City Review" &&
          ["Assigned", "In Progress", "Escalated"].includes(p.status)
      )
      .sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  }, [pins]);

  const selectedCommandItem =
    commandItems.find((item) => item.id === selectedCommandId) || commandItems[0] || null;

  const selectedDepartmentItem =
    departmentItems.find((item) => item.id === selectedDepartmentId) ||
    departmentItems[0] ||
    null;

  useEffect(() => {
    if (selectedCommandItem) {
      setSelectedCommandId(selectedCommandItem.id);
      setAssignDepartment(selectedCommandItem.department || "Streets");
      setAssignActionType(selectedCommandItem.actionType || "Inspect");
      setAssignEscalation(String(selectedCommandItem.escalationHours || 48));
      setAssignInstructions(selectedCommandItem.instructions || "");
    }
  }, [selectedCommandItem?.id]);

  useEffect(() => {
    if (selectedDepartmentItem) {
      setSelectedDepartmentId(selectedDepartmentItem.id);
    }
  }, [selectedDepartmentItem?.id]);

  const detectCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("pothole") || t.includes("road") || t.includes("street") || t.includes("sidewalk")) {
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

  const getNextActionText = (pin) => {
    if (pin.status === "Received") return "Next action: city review and routing";
    if (pin.status === "Assigned") return "Next action: department acknowledgment";
    if (pin.status === "In Progress") return "Next action: post work update or complete";
    if (pin.status === "Escalated") return "Next action: immediate follow-up required";
    if (pin.status === "Completed") return "Next action: none";
    return "Next action pending";
  };

  const getHealthColor = (pin) => {
    if (pin.status === "Escalated") return "#fdecec";
    if (pin.status === "In Progress") return "#fff6df";
    return "#e8f7ee";
  };

  const getHealthTextColor = (pin) => {
    if (pin.status === "Escalated") return "#a63838";
    if (pin.status === "In Progress") return "#996d00";
    return "#216b42";
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
      priority: department === "City Review" ? "Needs Review" : "Standard",
      queueState: department === "City Review" ? "Needs Review" : "Auto-Routed",
      visibility: "public",
      timeline: "Awaiting city review"
    };

    setPins((prev) => [newPin, ...prev]);
    setSelectedCommandId(newPin.id);
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

  const assignSelectedIssue = () => {
    if (!selectedCommandItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedCommandItem.id
          ? {
              ...pin,
              department: assignDepartment,
              actionType: assignActionType,
              escalationHours: Number(assignEscalation),
              instructions: assignInstructions,
              status: "Assigned",
              queueState: "Assigned",
              lastUpdatedBy: "City Admin",
              lastUpdatedText: "City has directed the appropriate department to address this",
              updates: "City has directed the appropriate department to address this.",
              timeline:
                Number(assignEscalation) === 24
                  ? "Within 24 hours"
                  : Number(assignEscalation) === 48
                  ? "Within 2 days"
                  : Number(assignEscalation) === 72
                  ? "Within 3 days"
                  : Number(assignEscalation) === 120
                  ? "Within 5 days"
                  : "Within 7 days"
            }
          : pin
      )
    );

    setSelectedDepartmentId(selectedCommandItem.id);
  };

  const reviewLaterSelectedIssue = () => {
    if (!selectedCommandItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedCommandItem.id
          ? {
              ...pin,
              queueState: "Review Later",
              lastUpdatedBy: "City Admin",
              lastUpdatedText: `City scheduled this for review ${assignReviewLater.toLowerCase()}`,
              updates: `City scheduled this for review ${assignReviewLater.toLowerCase()}.`
            }
          : pin
      )
    );
  };

  const escalateSelectedIssue = () => {
    if (!selectedCommandItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedCommandItem.id
          ? {
              ...pin,
              status: "Escalated",
              queueState: "Escalated",
              lastUpdatedBy: "System",
              lastUpdatedText: `Escalated: no activity within ${pin.escalationHours} hours`,
              updates: `Escalated: no activity within ${pin.escalationHours} hours.`
            }
          : pin
      )
    );
  };

  const acknowledgeDepartmentIssue = () => {
    if (!selectedDepartmentItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedDepartmentItem.id
          ? {
              ...pin,
              lastUpdatedBy: pin.department,
              lastUpdatedText: `${pin.department} acknowledged this assignment`,
              updates: `${pin.department} acknowledged this assignment and is preparing next steps.`,
              timeline: pin.timeline || "Timeline submitted"
            }
          : pin
      )
    );
  };

  const startDepartmentWork = () => {
    if (!selectedDepartmentItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedDepartmentItem.id
          ? {
              ...pin,
              status: "In Progress",
              queueState: "Active",
              lastUpdatedBy: pin.department,
              lastUpdatedText: `Work is underway: ${pin.actionType.toLowerCase()}`,
              updates: `Work is underway: ${pin.department.toLowerCase()} team is addressing this item.`,
              timeline: "In progress"
            }
          : pin
      )
    );
  };

  const addDepartmentUpdate = () => {
    if (!selectedDepartmentItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedDepartmentItem.id
          ? {
              ...pin,
              lastUpdatedBy: pin.department,
              lastUpdatedText: `${pin.department} posted an update`,
              updates: `${pin.department} posted an update and remains actively engaged on this item.`
            }
          : pin
      )
    );
  };

  const completeDepartmentIssue = () => {
    if (!selectedDepartmentItem) return;

    setPins((prev) =>
      prev.map((pin) =>
        pin.id === selectedDepartmentItem.id
          ? {
              ...pin,
              status: "Completed",
              queueState: "Completed",
              lastUpdatedBy: pin.department,
              lastUpdatedText: "City has addressed this concern and the issue is now closed",
              updates: "City has addressed this concern and the issue is now closed.",
              timeline: "Completed"
            }
          : pin
      )
    );
  };

  const generateSelectedReport = () => {
    const previews = {
      "Council Summary":
        "A concise overview of current concerns, response activity, escalations, and top recommended next steps for city leadership.",
      "Department Performance":
        "A department-by-department view of open items, response timing, in-progress work, and completion performance.",
      "Escalations":
        "A focused list of items that have exceeded expected activity windows and now require city attention.",
      "Public Concerns":
        "A summary of the issues residents are reporting most often, where they are occurring, and how they are being addressed.",
      "Budget / Planning":
        "A planning-oriented view showing recurring issue types, likely maintenance pressure points, and where future spending may need attention.",
      "Strategic Insights":
        "A higher-level narrative of patterns, hotspots, repeat issues, and action recommendations drawn from current city activity."
    };

    setReportPreview(previews[selectedReportType] || "Report preview ready.");
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
        * { box-sizing: border-box; }

        html, body, #root {
          max-width: 100%;
          overflow-x: hidden;
        }

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

        @media (max-width: 1180px) {
          .pp-three-col {
            display: block !important;
          }
          .pp-three-col > div {
            margin-bottom: 14px !important;
            min-height: unset !important;
          }
        }

        @media (max-width: 760px) {
          .pp-top-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .pp-nav-row {
            width: 100%;
            justify-content: flex-start !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "16px 14px 108px"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0a3d91 0%, #0c5fd7 100%)",
            color: "white",
            borderRadius: 24,
            padding: "18px 18px 16px",
            boxShadow: "0 12px 30px rgba(12,95,215,0.18)",
            marginBottom: 12
          }}
        >
          <div
            className="pp-top-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                PublicPulse
              </div>
              <div style={{ fontSize: 14, opacity: 0.96 }}>
                Hastings — real-time visibility, response, and decision support
              </div>
            </div>

            <div
              className="pp-nav-row"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end"
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
                    padding: "9px 13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {[
              `${statOpen} open items`,
              `${statInProgress} in progress`,
              `${statEscalated} escalated`,
              "One shared city map"
            ].map((chip) => (
              <div
                key={chip}
                style={{
                  padding: "7px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

        {viewMode === "public" && currentIssue && (
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 16,
              boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
              marginBottom: 12
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
              What’s going on in Hastings right now
            </div>

            <div
              style={{
                fontSize: 22,
                lineHeight: 1.15,
                fontWeight: 800,
                marginBottom: 8
              }}
            >
              {currentIssue.description}
            </div>

            <div style={{ color: "#4f6478", fontSize: 14, marginBottom: 10 }}>
              {getStatusLabel(currentIssue)}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={pillStyle("#edf4ff", "#2355a2")}>{currentIssue.status}</div>
              <div style={pillStyle("#f4f7fa", "#4e6278")}>{currentIssue.category}</div>
              <div style={pillStyle("#f4f7fa", "#4e6278")}>
                Last updated by {currentIssue.lastUpdatedBy}
              </div>
            </div>
          </div>
        )}

        {viewMode === "public" && (
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 14,
              boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                Live city map
              </div>
              <div style={{ fontSize: 14, color: "#55697e" }}>
                Tap a pin to see what is happening and how the city is responding.
              </div>
            </div>

            <MapPanel
              pins={pins}
              setSelectedPin={setSelectedPin}
              reportMode={reportMode}
              handleMapClick={handleMapClick}
              getPinColor={getPinColor}
            />
          </div>
        )}

        {viewMode === "command" && (
          <div className="pp-three-col" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 0.9fr", gap: 14 }}>
            <div style={panelStyle()}>
              <div style={sectionTitleStyle()}>Incoming & Active Queue</div>
              <div style={sectionSubStyle()}>
                New concerns, active items, escalations, and items scheduled for later review.
              </div>

              <div className="pp-scroll" style={{ display: "grid", gap: 10, maxHeight: 680, overflowY: "auto", marginTop: 12 }}>
                {commandItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCommandId(item.id)}
                    style={{
                      textAlign: "left",
                      border: selectedCommandItem?.id === item.id ? "2px solid #0c5fd7" : "1px solid #e0e7ef",
                      background: selectedCommandItem?.id === item.id ? "#f4f9ff" : "#fbfcfe",
                      borderRadius: 16,
                      padding: 14,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{item.description}</div>
                    <div style={{ fontSize: 13, color: "#617487", marginBottom: 8 }}>{item.queueState}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={miniChipStyle("#edf4ff", "#2458a9")}>{item.department}</span>
                      <span style={miniChipStyle("#f5f7fa", "#5e7082")}>{item.priority}</span>
                      <span style={miniChipStyle(getHealthColor(item), getHealthTextColor(item))}>{item.timeline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={panelStyle()}>
              <div style={sectionTitleStyle()}>Selected Issue & Actions</div>
              {selectedCommandItem ? (
                <>
                  <div style={selectedCardStyle()}>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                      {selectedCommandItem.category}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 10 }}>
                      {selectedCommandItem.description}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={miniChipStyle("#edf4ff", "#2458a9")}>{selectedCommandItem.status}</span>
                      <span style={miniChipStyle("#f5f7fa", "#5e7082")}>{selectedCommandItem.department}</span>
                      <span style={miniChipStyle("#f5f7fa", "#5e7082")}>
                        Escalates if no activity in {selectedCommandItem.escalationHours} hours
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: "#4f6478", marginBottom: 8 }}>
                      {getStatusLabel(selectedCommandItem)}
                    </div>
                    <div style={{ fontSize: 13, color: "#718497", marginBottom: 8 }}>
                      Last updated by {selectedCommandItem.lastUpdatedBy}
                    </div>
                    <div style={{ fontSize: 13, color: "#718497" }}>{getNextActionText(selectedCommandItem)}</div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={subHeaderStyle()}>Action Center</div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <label style={labelStyle()}>
                        Assign Department
                        <select
                          value={assignDepartment}
                          onChange={(e) => setAssignDepartment(e.target.value)}
                          style={inputStyle()}
                        >
                          {["Streets", "Utilities", "Parks", "Fire", "City Review", "Other"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </label>

                      <label style={labelStyle()}>
                        Action Type
                        <select
                          value={assignActionType}
                          onChange={(e) => setAssignActionType(e.target.value)}
                          style={inputStyle()}
                        >
                          {["Inspect", "Repair", "Monitor", "Clean Up", "Replace", "Route to Other Department"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </label>

                      <label style={labelStyle()}>
                        Escalate If No Activity In
                        <select
                          value={assignEscalation}
                          onChange={(e) => setAssignEscalation(e.target.value)}
                          style={inputStyle()}
                        >
                          <option value="24">24 hours</option>
                          <option value="48">48 hours</option>
                          <option value="72">72 hours</option>
                          <option value="120">5 days</option>
                          <option value="168">7 days</option>
                        </select>
                      </label>

                      <label style={labelStyle()}>
                        Special Instructions
                        <textarea
                          value={assignInstructions}
                          onChange={(e) => setAssignInstructions(e.target.value)}
                          style={textareaStyle(90)}
                        />
                      </label>

                      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                        <button onClick={assignSelectedIssue} style={primaryButtonStyle()}>
                          Assign
                        </button>
                        <button onClick={escalateSelectedIssue} style={dangerButtonStyle()}>
                          Escalate
                        </button>
                      </div>

                      <div
                        style={{
                          border: "1px solid #e1e7ef",
                          borderRadius: 16,
                          padding: 12,
                          background: "#fbfcfe"
                        }}
                      >
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Remind Me Later</div>
                        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr auto" }}>
                          <select
                            value={assignReviewLater}
                            onChange={(e) => setAssignReviewLater(e.target.value)}
                            style={inputStyle()}
                          >
                            <option>Later today</option>
                            <option>Tomorrow</option>
                            <option>In 3 days</option>
                            <option>Next week</option>
                          </select>
                          <button onClick={reviewLaterSelectedIssue} style={secondaryButtonStyle()}>
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: "#607386" }}>No command items available.</div>
              )}
            </div>

            <div style={panelStyle()}>
              <div style={sectionTitleStyle()}>Reports & Insights</div>
              <div style={sectionSubStyle()}>
                High-level visibility, priorities, and decision support.
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <div style={insightBoxStyle()}>
                  <div style={insightTitleStyle()}>Choose Report</div>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    style={inputStyle()}
                  >
                    <option>Council Summary</option>
                    <option>Department Performance</option>
                    <option>Escalations</option>
                    <option>Public Concerns</option>
                    <option>Budget / Planning</option>
                    <option>Strategic Insights</option>
                  </select>

                  <button
                    onClick={generateSelectedReport}
                    style={{ ...primaryButtonStyle(), width: "100%", marginTop: 10 }}
                  >
                    Generate Report
                  </button>
                </div>

                <div style={insightBoxStyle()}>
                  <div style={insightTitleStyle()}>{selectedReportType}</div>
                  <div style={insightTextStyle()}>{reportPreview}</div>
                </div>

                <div style={insightBoxStyle()}>
                  <div style={insightTitleStyle()}>Current Snapshot</div>
                  <div style={insightTextStyle()}>Open concerns: {statOpen}</div>
                  <div style={insightTextStyle()}>Escalated items: {statEscalated}</div>
                  <div style={insightTextStyle()}>In progress: {statInProgress}</div>
                </div>

                <div style={insightBoxStyle()}>
                  <div style={insightTitleStyle()}>Budget / Planning Signal</div>
                  <div style={insightTextStyle()}>
                    Drainage and roadway-related items are clustering after weather events, suggesting a need to review preventative maintenance planning.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "department" && (
          <div className="pp-three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 0.9fr", gap: 14 }}>
            <div style={panelStyle()}>
              <div style={sectionTitleStyle()}>Department Queue</div>
              <div style={sectionSubStyle()}>
                Assigned items remain here until completed or formally resolved.
              </div>

              <div className="pp-scroll" style={{ display: "grid", gap: 10, maxHeight: 680, overflowY: "auto", marginTop: 12 }}>
                {departmentItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDepartmentId(item.id)}
                    style={{
                      textAlign: "left",
                      border: selectedDepartmentItem?.id === item.id ? "2px solid #0c5fd7" : "1px solid #e0e7ef",
                      background: selectedDepartmentItem?.id === item.id ? "#f4f9ff" : "#fbfcfe",
                      borderRadius: 16,
                      padding: 14,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{item.description}</div>
                    <div style={{ fontSize: 13, color: "#617487", marginBottom: 8 }}>{item.status}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={miniChipStyle("#edf4ff", "#2458a9")}>{item.department}</span>
                      <span style={miniChipStyle(getHealthColor(item), getHealthTextColor(item))}>{item.timeline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={panelStyle()}>
              <div style={sectionTitleStyle()}>Selected Work Item</div>

              {selectedDepartmentItem ? (
                <>
                  <div style={selectedCardStyle()}>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                      {selectedDepartmentItem.category}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 10 }}>
                      {selectedDepartmentItem.description}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={miniChipStyle("#edf4ff", "#2458a9")}>{selectedDepartmentItem.status}</span>
                      <span style={miniChipStyle("#f5f7fa", "#5e7082")}>{selectedDepartmentItem.department}</span>
                      <span style={miniChipStyle("#f5f7fa", "#5e7082")}>
                        Escalates if no activity in {selectedDepartmentItem.escalationHours} hours
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: "#4f6478", marginBottom: 8 }}>
                      {getStatusLabel(selectedDepartmentItem)}
                    </div>
                    <div style={{ fontSize: 13, color: "#718497", marginBottom: 8 }}>
                      Last updated by {selectedDepartmentItem.lastUpdatedBy}
                    </div>
                    {selectedDepartmentItem.instructions && (
                      <div style={{ fontSize: 14, marginBottom: 8 }}>
                        <strong>Special instructions:</strong> {selectedDepartmentItem.instructions}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#718497" }}>{getNextActionText(selectedDepartmentItem)}</div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={subHeaderStyle()}>Department Actions</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      <button onClick={acknowledgeDepartmentIssue} style={primaryButtonStyle()}>
                        Acknowledge
                      </button>
                      <button onClick={startDepartmentWork} style={secondaryButtonStyle()}>
                        Start Work
                      </button>
                      <button onClick={addDepartmentUpdate} style={secondaryButtonStyle()}>
                        Add Update
                      </button>
                      <button onClick={completeDepartmentIssue} style={successButtonStyle()}>
                        Complete
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: "#607386" }}>No department items available.</div>
              )}
            </div>

            <div style={panelStyle()}>
              <div style={sectionTitleStyle()}>Timeline & Accountability</div>
              <div style={sectionSubStyle()}>
                Track deadlines, escalation exposure, and current work health.
              </div>

              {selectedDepartmentItem ? (
                <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                  <div style={insightBoxStyle()}>
                    <div style={insightTitleStyle()}>Current Timeline</div>
                    <div style={insightTextStyle()}>{selectedDepartmentItem.timeline}</div>
                  </div>

                  <div style={insightBoxStyle()}>
                    <div style={insightTitleStyle()}>Escalation Rule</div>
                    <div style={insightTextStyle()}>
                      Escalates if no activity in {selectedDepartmentItem.escalationHours} hours.
                    </div>
                  </div>

                  <div style={insightBoxStyle()}>
                    <div style={insightTitleStyle()}>Last Activity</div>
                    <div style={insightTextStyle()}>
                      {selectedDepartmentItem.lastUpdatedBy}: {selectedDepartmentItem.lastUpdatedText}
                    </div>
                  </div>

                  <div style={insightBoxStyle()}>
                    <div style={insightTitleStyle()}>Work Status</div>
                    <div style={insightTextStyle()}>{selectedDepartmentItem.status}</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#607386", marginTop: 12 }}>Select a work item to view details.</div>
              )}
            </div>
          </div>
        )}

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
              <div style={{ fontSize: 17, fontWeight: 800 }}>New Report</div>

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
              style={textareaStyle(110)}
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
              style={textareaStyle(84)}
            />

            <div style={{ fontSize: 13, color: "#64788c", lineHeight: 1.5 }}>
              Tap the map to place the pin. Photo support is next.
            </div>
          </div>
        )}

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

        {selectedPin && (
          <div
            style={{
              position: "fixed",
              left: 16,
              right: 16,
              bottom: 24,
              maxWidth: 820,
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
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                  {selectedPin.category}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.45 }}>{selectedPin.description}</div>
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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={miniChipStyle("#edf4ff", "#2458a9")}>{selectedPin.status}</span>
              <span style={miniChipStyle("#f5f7fa", "#5e7082")}>{selectedPin.department}</span>
              <span style={miniChipStyle("#f5f7fa", "#5e7082")}>
                Escalates if no activity in {selectedPin.escalationHours} hours
              </span>
            </div>

            <div style={{ fontSize: 14, color: "#4f6478", lineHeight: 1.5, marginBottom: 10 }}>
              {getStatusLabel(selectedPin)}
            </div>

            <div style={{ fontSize: 13, color: "#708396", marginBottom: 10 }}>
              Last updated by {selectedPin.lastUpdatedBy}
            </div>

            {selectedPin.instructions && (
              <div style={{ fontSize: 14, marginBottom: 12 }}>
                <strong>Special instructions:</strong> {selectedPin.instructions}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

function MapPanel({
  pins,
  setSelectedPin,
  reportMode,
  handleMapClick,
  getPinColor
}) {
  return (
    <div
      onClick={handleMapClick}
      style={{
        position: "relative",
        height: 560,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #d8e1ea",
        background:
          "linear-gradient(to bottom, #cfe8ff 0%, #d8eeff 54%, #e9efdf 54%, #f3f5ed 100%)",
        cursor: reportMode ? "crosshair" : "default"
      }}
    >
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
  );
}

function getPriorityScore(item) {
  let score = 0;
  if (item.status === "Escalated") score += 100;
  if (item.status === "In Progress") score += 60;
  if (item.queueState === "Needs Review") score += 50;
  if (item.priority === "High") score += 30;
  if (item.priority === "Standard") score += 20;
  if (item.priority === "Routine") score += 10;
  return score;
}

function panelStyle() {
  return {
    background: "white",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    minHeight: 680
  };
}

function sectionTitleStyle() {
  return {
    fontSize: 17,
    fontWeight: 800,
    marginBottom: 6
  };
}

function sectionSubStyle() {
  return {
    fontSize: 14,
    color: "#55697e",
    lineHeight: 1.5
  };
}

function subHeaderStyle() {
  return {
    fontSize: 15,
    fontWeight: 800,
    marginBottom: 10
  };
}

function selectedCardStyle() {
  return {
    border: "1px solid #e0e7ef",
    borderRadius: 18,
    padding: 16,
    background: "#fbfcfe"
  };
}

function insightBoxStyle() {
  return {
    border: "1px solid #e0e7ef",
    borderRadius: 18,
    padding: 14,
    background: "#fbfcfe"
  };
}

function insightTitleStyle() {
  return {
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 8
  };
}

function insightTextStyle() {
  return {
    fontSize: 14,
    color: "#566a7e",
    lineHeight: 1.5,
    marginBottom: 6
  };
}

function labelStyle() {
  return {
    display: "grid",
    gap: 6,
    fontSize: 13,
    fontWeight: 700,
    color: "#334b63"
  };
}

function inputStyle() {
  return {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid #d6dce5",
    fontSize: 14,
    boxSizing: "border-box",
    background: "white"
  };
}

function textareaStyle(minHeight) {
  return {
    width: "100%",
    minHeight,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d6dce5",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box"
  };
}

function primaryButtonStyle() {
  return {
    border: "none",
    background: "#0c5fd7",
    color: "white",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  };
}

function secondaryButtonStyle() {
  return {
    border: "1px solid #d6dce5",
    background: "#f3f6fa",
    color: "#28435e",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  };
}

function successButtonStyle() {
  return {
    border: "none",
    background: "#e8f7ee",
    color: "#216b42",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  };
}

function dangerButtonStyle() {
  return {
    border: "none",
    background: "#fdecec",
    color: "#a63838",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  };
}

function pillStyle(background, color) {
  return {
    borderRadius: 999,
    background,
    color,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 800
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