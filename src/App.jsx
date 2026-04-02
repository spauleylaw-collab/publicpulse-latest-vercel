import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [mode, setMode] = useState("home");
  const [reportMode, setReportMode] = useState(false);
  const [pins, setPins] = useState([
    {
      id: 1,
      x: 32,
      y: 42,
      description: "Pothole causing rough traffic near downtown.",
      category: "Road Repair",
      status: "Assigned",
      updates:
        "Street team has this in review and is checking repair timing based on traffic impact and crew availability.",
      instructions: "",
      support: 2,
      source: "resident"
    },
    {
      id: 2,
      x: 67,
      y: 30,
      description: "Park maintenance scheduled along the corridor.",
      category: "Department Work",
      status: "Routed",
      updates:
        "Parks crews are continuing scheduled maintenance and will update the map as work progresses.",
      instructions: "City-initiated work by Parks.",
      support: 0,
      source: "department"
    }
  ]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [issueIndex, setIssueIndex] = useState(0);

  const [reportData, setReportData] = useState({
    description: "",
    photo: null,
    instructions: ""
  });

  useEffect(() => {
    if (pins.length === 0) return;
    const interval = setInterval(() => {
      setIssueIndex((prev) => (prev + 1) % pins.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [pins]);

  const detectCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("pothole") || t.includes("street") || t.includes("road")) {
      return "Road Repair";
    }
    if (
      t.includes("water") ||
      t.includes("hydrant") ||
      t.includes("sewer") ||
      t.includes("utility")
    ) {
      return "Utilities";
    }
    if (t.includes("tree") || t.includes("park") || t.includes("grass")) {
      return "Parks";
    }
    if (t.includes("fire") || t.includes("smoke")) {
      return "Fire";
    }
    return "General";
  };

  const currentIssue = useMemo(() => {
    if (pins.length === 0) return null;
    return pins[issueIndex];
  }, [pins, issueIndex]);

  const handleMapClick = (e) => {
    if (!reportMode && mode !== "department") return;

    const mapRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
    const y = ((e.clientY - mapRect.top) / mapRect.height) * 100;

    const departmentPin = mode === "department";

    const description = departmentPin
      ? "Department initiated work"
      : reportData.description.trim() || "Community concern reported";

    const newPin = {
      id: Date.now(),
      x,
      y,
      description,
      category: departmentPin
        ? "Department Work"
        : detectCategory(reportData.description),
      status: "Assigned",
      updates: departmentPin
        ? "Department work has been added to the map and can now be updated as progress changes."
        : "This concern has been added to the map and queued for review based on urgency, location, and department fit.",
      instructions: reportData.instructions || "",
      support: 0,
      source: departmentPin ? "department" : "resident"
    };

    setPins((prev) => [...prev, newPin]);
    setSelectedPin(newPin);
    setReportMode(false);
    setReportData({
      description: "",
      photo: null,
      instructions: ""
    });
  };

  const handleSupport = (id) => {
    setPins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, support: p.support + 1 } : p))
    );

    setSelectedPin((prev) =>
      prev && prev.id === id ? { ...prev, support: prev.support + 1 } : prev
    );
  };

  const statOpenItems = pins.length;
  const statPriority = pins.filter((p) => p.category !== "Department Work").length;
  const statCityInitiated = pins.filter((p) => p.source === "department").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#eef3f8",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#123"
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 16px 90px"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0a3d91 0%, #0c5fd7 100%)",
            color: "white",
            borderRadius: 24,
            padding: "26px 22px",
            boxShadow: "0 10px 28px rgba(12,95,215,0.18)"
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 6
            }}
          >
            PublicPulse
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10
            }}
          >
            Hastings
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 14,
              opacity: 0.95,
              marginBottom: 18
            }}
          >
            A community impact and city response system for residents,
            departments, and city leadership.
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center"
            }}
          >
            {[
              `City: Hastings`,
              `Mode: ${mode === "command" ? "city admin" : mode}`,
              `${statOpenItems} open items`,
              `${statPriority} priority`,
              `${statCityInitiated} city initiated`
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.10)",
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            marginBottom: 16,
            flexWrap: "wrap"
          }}
        >
          {[
            { key: "home", label: "Public" },
            { key: "command", label: "City" },
            { key: "department", label: "Department" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setMode(tab.key);
                setReportMode(false);
              }}
              style={{
                border: "1px solid #d6dce5",
                background: mode === tab.key ? "#e8f0ff" : "white",
                color: "#1b3f8b",
                borderRadius: 14,
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentIssue && (
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 22,
              boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
              marginBottom: 14
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                marginBottom: 8
              }}
            >
              What’s going on in Hastings
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 8
              }}
            >
              {currentIssue.description}
            </div>

            <div
              style={{
                color: "#4d6278",
                fontSize: 15,
                marginBottom: 12
              }}
            >
              {currentIssue.updates}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#edf4ff",
                  color: "#1b4ea3",
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {currentIssue.status}
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#f5f7fa",
                  color: "#41566d",
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {currentIssue.category}
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 14
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 18,
              boxShadow: "0 8px 22px rgba(0,0,0,0.06)"
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 10
              }}
            >
              Live map
            </div>

            <div
              style={{
                fontSize: 14,
                color: "#506477",
                marginBottom: 12
              }}
            >
              {reportMode
                ? "Tap the map to place this report."
                : mode === "department"
                ? "Department mode is active. Tap the map to drop a work pin."
                : "Tap a pin to open the full issue card."}
            </div>

            <div
              onClick={handleMapClick}
              style={{
                position: "relative",
                height: 520,
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid #d8e1ea",
                background:
                  "linear-gradient(to bottom, #cfe8ff 0%, #d8eeff 58%, #ecf0e8 58%, #f2f5ef 100%)",
                cursor:
                  reportMode || mode === "department" ? "crosshair" : "default"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "18%",
                  left: "10%",
                  width: "18%",
                  height: "22%",
                  background: "#b8d7d0",
                  borderRadius: 22,
                  opacity: 0.7
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "62%",
                  left: "34%",
                  width: "20%",
                  height: "16%",
                  background: "#e4d8b1",
                  borderRadius: 18,
                  opacity: 0.75
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "10%",
                  right: "10%",
                  width: "22%",
                  height: "16%",
                  background: "#b8d4dc",
                  borderRadius: 18,
                  opacity: 0.8
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: 4,
                  background: "#8495a4",
                  transform: "translateX(-50%)"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "68%",
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "#8495a4"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "14%",
                  left: "9%",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
                }}
              >
                North Hastings
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "24%",
                  right: "15%",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
                }}
              >
                Parks Corridor
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "70%",
                  left: "40%",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
                }}
              >
                Downtown
              </div>

              {pins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(pin);
                  }}
                  title={pin.description}
                  style={{
                    position: "absolute",
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: "translate(-50%, -100%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50% 50% 50% 0",
                      transform: "rotate(-45deg)",
                      background:
                        pin.category === "Department Work"
                          ? "#2da44e"
                          : pin.category === "Utilities"
                          ? "#1e88e5"
                          : pin.category === "Road Repair"
                          ? "#d9485f"
                          : pin.category === "Parks"
                          ? "#3fa34d"
                          : "#f28c28",
                      border: "3px solid white",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.18)"
                    }}
                  />
                </button>
              ))}

              {reportMode && (
                <div
                  style={{
                    position: "absolute",
                    left: 16,
                    top: 16,
                    background: "rgba(10,61,145,0.92)",
                    color: "white",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  Report mode active
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: 18,
                boxShadow: "0 8px 22px rgba(0,0,0,0.06)"
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 8
                }}
              >
                Map guide
              </div>
              <div style={{ fontSize: 14, color: "#506477", lineHeight: 1.5 }}>
                Tap a pin on the map to open the issue card. In report mode,
                tap the map to place a new community concern. In department
                mode, tap the map to add department work.
              </div>
            </div>

            {(mode === "report" || reportMode || mode === "department") && (
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 18,
                  boxShadow: "0 8px 22px rgba(0,0,0,0.06)"
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 10
                  }}
                >
                  {mode === "department" ? "Department Work" : "New Report"}
                </div>

                {mode !== "department" && (
                  <>
                    <textarea
                      placeholder="Describe what’s going on..."
                      value={reportData.description}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      style={{
                        width: "100%",
                        minHeight: 96,
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #d6dce5",
                        marginBottom: 10,
                        fontFamily: "inherit",
                        fontSize: 14,
                        resize: "vertical",
                        boxSizing: "border-box"
                      }}
                    />

                    <input
                      type="file"
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          photo: e.target.files?.[0] || null
                        }))
                      }
                      style={{ marginBottom: 10, width: "100%" }}
                    />
                  </>
                )}

                <textarea
                  placeholder="Special instructions"
                  value={reportData.instructions}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      instructions: e.target.value
                    }))
                  }
                  style={{
                    width: "100%",
                    minHeight: 82,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #d6dce5",
                    marginBottom: 10,
                    fontFamily: "inherit",
                    fontSize: 14,
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />

                <button
                  onClick={() => {
                    if (mode === "department") {
                      setReportMode(false);
                    } else {
                      setMode("report");
                      setReportMode(true);
                    }
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 14,
                    background: "#0c5fd7",
                    color: "white",
                    padding: "12px 14px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {mode === "department"
                    ? "Tap the map to place department work"
                    : "Activate report mode"}
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedPin && (
          <div
            style={{
              position: "fixed",
              left: 16,
              right: 16,
              bottom: 78,
              maxWidth: 760,
              margin: "0 auto",
              background: "white",
              borderRadius: 20,
              padding: 18,
              boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
              zIndex: 30
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
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
                <div style={{ fontSize: 15 }}>{selectedPin.description}</div>
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
                fontSize: 14,
                color: "#4d6278",
                lineHeight: 1.5,
                marginBottom: 10
              }}
            >
              {selectedPin.updates}
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => handleSupport(selectedPin.id)}
                style={{
                  border: "none",
                  borderRadius: 14,
                  background: "#0c5fd7",
                  color: "white",
                  padding: "11px 14px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                I noticed this too ({selectedPin.support})
              </button>

              <div
                style={{
                  borderRadius: 14,
                  background: "#f3f6fa",
                  color: "#42576d",
                  padding: "11px 14px",
                  fontWeight: 700
                }}
              >
                Status: {selectedPin.status}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "white",
          borderTop: "1px solid #d9e1ea",
          display: "flex",
          justifyContent: "center",
          gap: 10,
          padding: "10px 12px",
          zIndex: 40,
          flexWrap: "wrap"
        }}
      >
        {[
          { key: "home", label: "Home" },
          { key: "report", label: "Report" },
          { key: "command", label: "Command Center" },
          { key: "department", label: "Department Work" }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setMode(item.key);
              setReportMode(item.key === "report");
              if (item.key !== "report") {
                setSelectedPin(null);
              }
            }}
            style={{
              border: "1px solid #d6dce5",
              background:
                mode === item.key ? "#0c5fd7" : "white",
              color: mode === item.key ? "white" : "#23384d",
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
  );
}