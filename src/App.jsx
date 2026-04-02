import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "publicpulse-stable";

const escalationOptions = [
  { label: "24 hours", ms: 86400000 },
  { label: "48 hours", ms: 172800000 },
];

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
    return (order[a.status] || 99) - (order[b.status] || 99);
  });
}

export default function App() {
  const [view, setView] = useState("public");
  const [reports, setReports] = useState([]);
  const [reportMode, setReportMode] = useState(false);
  const [publicSelectedId, setPublicSelectedId] = useState(null);
  const [commandSelectedId, setCommandSelectedId] = useState(null);

  const [reportForm, setReportForm] = useState({
    description: "",
    locationName: "",
    photo: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setReports(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const handleMapClick = (e) => {
    if (!reportMode) return;

    if (!reportForm.description.trim()) {
      alert("Describe the issue first");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newItem = {
      id: Date.now(),
      title: reportForm.description,
      locationName: reportForm.locationName || "Community report",
      publicSummary: reportForm.description,
      publicUpdateText: "Report received",
      department: "City Review",
      status: "Received",
      x,
      y,
    };

    setReports((prev) => [newItem, ...prev]);
    setPublicSelectedId(newItem.id);
    setCommandSelectedId(newItem.id);

    setReportMode(false);
    setReportForm({ description: "", locationName: "", photo: null });
  };

  const commandQueue = useMemo(() => {
    return sortQueue(
      reports.filter((r) => r.status === "Received" || r.status === "Escalated")
    );
  }, [reports]);

  const assignFromCommand = () => {
    if (!commandSelectedId) return;

    setReports((prev) => {
      const updated = prev.map((r) =>
        r.id === commandSelectedId ? { ...r, status: "Assigned" } : r
      );

      const next = updated.find(
        (r) => r.status === "Received" || r.status === "Escalated"
      );

      setCommandSelectedId(next?.id || null);

      return updated;
    });
  };

  const publicSelected = reports.find((r) => r.id === publicSelectedId);

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>PublicPulse</h1>

        <div className="topbar-actions">
          <button onClick={() => setView("public")}>Public</button>
          <button onClick={() => setView("command")}>Command</button>
        </div>
      </header>

      {view === "public" && (
        <main className="public-page">
          <div className="insight-chip">
            <span>What’s going on in Hastings right now</span>
            <strong>{reports.length} active items on the map</strong>
          </div>

          <div className="map-stage" onClick={handleMapClick}>
            <div className="map-label north">North Hastings</div>
            <div className="map-label parks">Parks Corridor</div>

            <div className="road vertical" />
            <div className="road horizontal" />
            <div className="road diagonal" />

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

          {publicSelected && (
            <div className="public-popup">
              <h3>{publicSelected.locationName}</h3>
              <p>{publicSelected.publicSummary}</p>
              <strong>{publicSelected.publicUpdateText}</strong>
            </div>
          )}

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
            </div>
          )}

          <button className="floating-report-btn" onClick={() => setReportMode(true)}>
            + Report
          </button>
        </main>
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
            <button onClick={assignFromCommand}>Assign</button>
          </div>
        </div>
      )}
    </div>
  );
}