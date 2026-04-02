import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [view, setView] = useState("public");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportMode, setReportMode] = useState(false);
  const [newReport, setNewReport] = useState({
    text: "",
    photo: null,
  });

  const [insightIndex, setInsightIndex] = useState(0);

  const insights = [
    "Road repair activity increasing in north Hastings",
    "Parks maintenance requests trending up",
    "Utility work ongoing in multiple zones",
  ];

  // Rotate insights
  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // AUTO ESCALATION
  useEffect(() => {
    const interval = setInterval(() => {
      setReports((prev) =>
        prev.map((r) => {
          if (
            r.status !== "Completed" &&
            r.assignedAt &&
            r.escalationTime &&
            Date.now() - r.assignedAt > r.escalationTime
          ) {
            return { ...r, status: "Escalated" };
          }
          return r;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // HANDLE PHOTO
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewReport((prev) => ({
        ...prev,
        photo: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // ADD REPORT (SIMULATED MAP CLICK)
  const addReport = () => {
    if (!newReport.text) return;

    const report = {
      id: Date.now(),
      text: newReport.text,
      photo: newReport.photo,
      status: "Received",
      createdAt: Date.now(),
      assignedAt: null,
      escalationTime: null,
    };

    setReports([...reports, report]);
    setNewReport({ text: "", photo: null });
    setReportMode(false);
  };

  // AUTO ROUTE + ASSIGN (SIMPLIFIED)
  const assignReport = (id) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: "Assigned",
            assignedAt: Date.now(),
            escalationTime: 48 * 60 * 60 * 1000, // 48h default
          };
        }
        return r;
      })
    );
  };

  // STATUS UPDATE
  const updateStatus = (id, status) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div className="app">

      {/* NAV */}
      <div className="nav">
        <button onClick={() => setView("public")}>Public</button>
        <button onClick={() => setView("command")}>Command</button>
        <button onClick={() => setView("department")}>Department</button>
      </div>

      {/* ================= PUBLIC PAGE ================= */}
      {view === "public" && (
        <div className="public-page">

          {/* ROTATING INSIGHT */}
          <div className="insight">
            {insights[insightIndex]}
          </div>

          {/* MAP AREA */}
          <div className="map">

            {/* PINS */}
            {reports.map((r) => (
              <div
                key={r.id}
                className={`pin ${r.status.toLowerCase()}`}
                onClick={() => setSelectedReport(r)}
              >
                ●
              </div>
            ))}

          </div>

          {/* POPUP CARD */}
          {selectedReport && (
            <div className="popup">
              <h3>{selectedReport.status}</h3>
              <p>{selectedReport.text}</p>

              {selectedReport.photo && (
                <img
                  src={selectedReport.photo}
                  alt="report"
                  className="popup-image"
                />
              )}

              <button onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          )}

          {/* REPORT PANEL */}
          {reportMode && (
            <div className="report-panel">
              <textarea
                placeholder="Describe the issue..."
                value={newReport.text}
                onChange={(e) =>
                  setNewReport({ ...newReport, text: e.target.value })
                }
              />

              <input type="file" onChange={handlePhotoUpload} />

              {newReport.photo && (
                <img src={newReport.photo} className="preview" />
              )}

              <button onClick={addReport}>Submit</button>
            </div>
          )}

          {/* FLOATING REPORT BUTTON */}
          <button
            className="report-button"
            onClick={() => setReportMode(!reportMode)}
          >
            + Report
          </button>
        </div>
      )}

      {/* ================= COMMAND CENTER ================= */}
      {view === "command" && (
        <div className="three-col">

          {/* COLUMN 1 */}
          <div className="col">
            <h3>Incoming / Active</h3>
            {reports.map((r) => (
              <div key={r.id} onClick={() => setSelectedReport(r)}>
                {r.text} ({r.status})
              </div>
            ))}
          </div>

          {/* COLUMN 2 */}
          <div className="col">
            <h3>Action Center</h3>
            {selectedReport && (
              <>
                <p>{selectedReport.text}</p>

                <button onClick={() => assignReport(selectedReport.id)}>
                  Assign
                </button>

                <button onClick={() => updateStatus(selectedReport.id, "In Progress")}>
                  Start
                </button>

                <button onClick={() => updateStatus(selectedReport.id, "Completed")}>
                  Complete
                </button>
              </>
            )}
          </div>

          {/* COLUMN 3 */}
          <div className="col">
            <h3>Reports & Insights</h3>

            <select>
              <option>Weekly Report</option>
              <option>Monthly Report</option>
            </select>

            <button>Generate Report</button>
          </div>
        </div>
      )}

      {/* ================= DEPARTMENT ================= */}
      {view === "department" && (
        <div className="three-col">

          {/* COLUMN 1 */}
          <div className="col">
            <h3>Department Queue</h3>
            {reports.map((r) => (
              <div key={r.id} onClick={() => setSelectedReport(r)}>
                {r.text} ({r.status})
              </div>
            ))}
          </div>

          {/* COLUMN 2 */}
          <div className="col">
            <h3>Work Item</h3>
            {selectedReport && (
              <>
                <p>{selectedReport.text}</p>

                <button onClick={() => updateStatus(selectedReport.id, "In Progress")}>
                  Start Work
                </button>

                <button onClick={() => updateStatus(selectedReport.id, "Completed")}>
                  Complete
                </button>
              </>
            )}
          </div>

          {/* COLUMN 3 */}
          <div className="col">
            <h3>Timeline</h3>
            {selectedReport && (
              <p>Status: {selectedReport.status}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}