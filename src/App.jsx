import { useState, useEffect } from "react";

export default function App() {
  const [mode, setMode] = useState("home");
  const [reportMode, setReportMode] = useState(false);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [issueIndex, setIssueIndex] = useState(0);

  // Report form state
  const [reportData, setReportData] = useState({
    description: "",
    category: "",
    photo: null,
    instructions: ""
  });

  // Rotate issues (bottom card)
  useEffect(() => {
    if (pins.length === 0) return;
    const interval = setInterval(() => {
      setIssueIndex((prev) => (prev + 1) % pins.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [pins]);

  // Simulated AI categorization
  const detectCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("pothole")) return "Road Repair";
    if (t.includes("water")) return "Utilities";
    if (t.includes("tree")) return "Parks";
    if (t.includes("fire")) return "Fire";
    return "General";
  };

  const handleMapClick = (e) => {
    if (!reportMode && mode !== "department") return;

    const newPin = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      description:
        mode === "department"
          ? "Department initiated work"
          : reportData.description,
      category:
        mode === "department"
          ? "Department Work"
          : detectCategory(reportData.description),
      status: "Assigned",
      updates: "Scheduled for review within 24–48 hours based on priority.",
      instructions: reportData.instructions || "",
      support: 0
    };

    setPins([...pins, newPin]);
    setReportMode(false);
    setReportData({
      description: "",
      category: "",
      photo: null,
      instructions: ""
    });
  };

  const handleSupport = (id) => {
    setPins(
      pins.map((p) =>
        p.id === id ? { ...p, support: p.support + 1 } : p
      )
    );
  };

  return (
    <div className="h-screen w-screen bg-gray-100 relative overflow-hidden">
      {/* MAP */}
      <div
        className="absolute inset-0 bg-green-100"
        onClick={handleMapClick}
      >
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="absolute w-4 h-4 bg-red-600 rounded-full cursor-pointer"
            style={{ top: pin.y, left: pin.x }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPin(pin);
            }}
          />
        ))}
      </div>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow p-3 text-center font-bold">
        PublicPulse — Hastings
      </div>

      {/* REPORT MODE PANEL */}
      {reportMode && (
        <div className="absolute bottom-20 left-4 right-4 bg-white p-4 rounded-xl shadow">
          <textarea
            placeholder="Describe what’s going on..."
            className="w-full border p-2 rounded mb-2"
            value={reportData.description}
            onChange={(e) =>
              setReportData({ ...reportData, description: e.target.value })
            }
          />

          <input
            type="file"
            className="mb-2"
            onChange={(e) =>
              setReportData({ ...reportData, photo: e.target.files[0] })
            }
          />

          <textarea
            placeholder="Special instructions (optional)"
            className="w-full border p-2 rounded mb-2"
            value={reportData.instructions}
            onChange={(e) =>
              setReportData({ ...reportData, instructions: e.target.value })
            }
          />

          <div className="text-sm text-gray-500">
            Tap on the map to place this report
          </div>
        </div>
      )}

      {/* PIN DETAIL */}
      {selectedPin && (
        <div className="absolute bottom-20 left-4 right-4 bg-white p-4 rounded-xl shadow">
          <div className="font-bold">{selectedPin.category}</div>
          <div className="text-sm mb-2">{selectedPin.description}</div>

          <div className="text-xs text-gray-600 mb-2">
            {selectedPin.updates}
          </div>

          {selectedPin.instructions && (
            <div className="text-xs mb-2">
              <b>Notes:</b> {selectedPin.instructions}
            </div>
          )}

          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => handleSupport(selectedPin.id)}
          >
            I noticed this too ({selectedPin.support})
          </button>

          <button
            className="ml-2 text-sm text-gray-500"
            onClick={() => setSelectedPin(null)}
          >
            Close
          </button>
        </div>
      )}

      {/* ROTATING ISSUE CARD */}
      {pins.length > 0 && (
        <div className="absolute bottom-32 left-4 right-4 bg-white p-3 rounded-xl shadow text-sm">
          <div className="font-bold mb-1">
            What’s going on in Hastings right now
          </div>
          <div>{pins[issueIndex].description}</div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="absolute bottom-0 left-0 right-0 bg-white shadow flex justify-around p-3">
        <button onClick={() => { setMode("home"); setReportMode(false); }}>
          Home
        </button>

        <button
          onClick={() => {
            setMode("report");
            setReportMode(true);
          }}
          className="font-bold text-blue-600"
        >
          Report
        </button>

        <button
          onClick={() => {
            setMode("command");
            setReportMode(false);
          }}
        >
          Command Center
        </button>

        <button
          onClick={() => {
            setMode("department");
            setReportMode(false);
          }}
        >
          Department Work
        </button>
      </div>
    </div>
  );
}