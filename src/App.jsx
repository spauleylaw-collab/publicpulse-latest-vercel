import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "publicpulse-full-build-v2";

const escalationOptions = [
  { label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  { label: "48 hours", ms: 48 * 60 * 60 * 1000 },
  { label: "72 hours", ms: 72 * 60 * 60 * 1000 },
  { label: "5 days", ms: 5 * 24 * 60 * 60 * 1000 },
  { label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
];

function getRouteFromText(text) {
  const lower = text.toLowerCase();

  if (lower.includes("pothole") || lower.includes("road") || lower.includes("street")) {
    return { department: "Streets", category: "Roadway", actionType: "Inspect" };
  }

  if (lower.includes("park") || lower.includes("playground") || lower.includes("bench")) {
    return { department: "Parks", category: "Parks", actionType: "Inspect" };
  }

  if (lower.includes("water") || lower.includes("drain")) {
    return { department: "Utilities", category: "Utilities", actionType: "Investigate" };
  }

  return { department: "City Review", category: "General", actionType: "Inspect" };
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function sortQueue(items) {
  const order = {
    Escalated: 1,
    Received: 2,
    Assigned: 3,
    "In Progress": 4,
    Completed: 5,
  };

  return [...items].sort((a, b) => {
    const byStatus = (order[a.status] || 99) - (order[b.status] || 99);
    if (byStatus !== 0) return byStatus;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export default function App() {
  const [view, setView] = useState("public");
  const [reports, setReports] = useState([]);
  const [reportMode, setReportMode] = useState(false);

  const [reportForm, setReportForm] = useState({
    description: "",
    locationName: "",
    photo: null,
    photoName: "",
  });

  const [publicSelectedId, setPublicSelectedId] = useState(null);
  const [commandSelectedId, setCommandSelectedId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setReports(parsed);
      return;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  // 🔥 FIXED MAP CLICK (CORE FIX)
  const handleMapClick = (e) => {
    if (!reportMode) return;

    if (!reportForm.description.trim()) {
      alert("Please describe what is happening first.");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const route = getRouteFromText(reportForm.description);
    const escalation = escalationOptions[1];

    const newItem = {
      id: Date.now(),
      title: reportForm.description,
      locationName: reportForm.locationName || "Community report",
      publicSummary: reportForm.description,
      publicActionText: "City will review and route this issue.",
      publicUpdateText: "Report received.",
      department: route.department,
      category: route.category,
      actionType: route.actionType,
      escalationMs: escalation.ms,
      escalationChoice: escalation.label,
      status: "Received",
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      photo: reportForm.photo,
      photoName: reportForm.photoName,
      x,
      y,
      updates: [],
    };

    setReports((prev) => [newItem, ...prev]);
    setPublicSelectedId(newItem.id);
    setCommandSelectedId(newItem.id);

    setReportMode(false);
    setReportForm({
      description: "",
      locationName: "",
      photo: null,
      photoName: "",
    });
  };

  // 🔥 FIXED COMMAND QUEUE
  const commandQueue = useMemo(() => {
    return sortQueue(
      reports.filter((r) => r.status === "Received" || r.status === "Escalated")
    );
  }, [reports]);

  const commandSelected = reports.find((r) => r.id === commandSelectedId);

  // 🔥 FIXED ASSIGN LOGIC
  const assignFromCommand = () => {
    if (!commandSelected) return;

    setReports((prev) => {
      const updated = prev.map((item) =>
        item.id === commandSelected.id
          ? {
              ...item,
              status: "Assigned",
              lastActivityAt: Date.now(),
            }
          : item
      );

      // auto select next item
      const next = updated.find(
        (r) => r.status === "Received" || r.status === "Escalated"
      );

      if (next) {
        setCommandSelectedId(next.id);
      } else {
        setCommandSelectedId(null);
      }

      return updated;
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>PublicPulse</h1>

        <div>
          <button onClick={() => setView("public")}>Public</button>
          <button onClick={() => setView("command")}>Command</button>
        </div>
      </header>

      {view === "public" && (
        <div className="public-page">
          <div className="map-stage" onClick={handleMapClick}>
            {reports.map((r) => (
              <div
                key={r.id}
                className={`map-pin ${statusClass(r.status)}`}
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPublicSelectedId(r.id);
                }}
              />
            ))}
          </div>

          {reportMode && (
            <div className="report-flow-card">
              <h3>New Report</h3>

              <textarea
                placeholder="Describe what is happening..."
                value={reportForm.description}
                onChange={(e) =>
                  setReportForm((p) => ({ ...p, description: e.target.value }))
                }
              />

              <input
                placeholder="Location name"
                value={reportForm.locationName}
                onChange={(e) =>
                  setReportForm((p) => ({ ...p, locationName: e.target.value }))
                }
              />

              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setReportForm((p) => ({
                      ...p,
                      photo: reader.result,
                      photoName: file.name,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button onClick={() => setReportMode(false)}>Cancel</button>
            </div>
          )}

          <button className="floating-report-btn" onClick={() => setReportMode(true)}>
            + Report
          </button>
        </div>
      )}

      {view === "command" && (
        <div className="three-column">
          <div>
            <h3>Queue</h3>
            {commandQueue.map((r) => (
              <div key={r.id} onClick={() => setCommandSelectedId(r.id)}>
                {r.title}
              </div>
            ))}
          </div>

          <div>
            {commandSelected && (
              <>
                <h3>{commandSelected.title}</h3>
                <button onClick={assignFromCommand}>Assign</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}