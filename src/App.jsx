import { useState, useEffect } from "react";

export default function App() {
  const [reportMode, setReportMode] = useState(false);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [issueIndex, setIssueIndex] = useState(0);

  const [reportData, setReportData] = useState({
    description: "",
    instructions: ""
  });

  // Rotate issues
  useEffect(() => {
    if (pins.length === 0) return;
    const interval = setInterval(() => {
      setIssueIndex((prev) => (prev + 1) % pins.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [pins]);

  const detectCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("pothole") || t.includes("road")) return "Road Repair";
    if (t.includes("water")) return "Utilities";
    if (t.includes("park") || t.includes("tree")) return "Parks";
    return "General";
  };

  const handleMapClick = (e) => {
    if (!reportMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin = {
      id: Date.now(),
      x,
      y,
      description: reportData.description,
      category: detectCategory(reportData.description),
      status: "Reported",
      updates: "Reported just now",
      instructions: reportData.instructions,
      support: 0
    };

    setPins([newPin, ...pins]);
    setReportMode(false);
    setReportData({ description: "", instructions: "" });
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

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-3 text-center font-bold z-10">
        PublicPulse — Hastings
      </div>

      {/* MAP */}
      <div
        className="absolute inset-0 pt-12"
        onClick={handleMapClick}
      >
        <div className="w-full h-full relative bg-green-100">

          {pins.map((pin) => (
            <div
              key={pin.id}
              className="absolute cursor-pointer"
              style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPin(pin);
              }}
            >
              {/* Glow */}
              <div className="absolute w-8 h-8 bg-blue-400 opacity-30 rounded-full animate-ping" />
              
              {/* Pin */}
              <div className="w-4 h-4 bg-blue-600 rounded-full" />
            </div>
          ))}

        </div>
      </div>

      {/* ROTATING CARD */}
      {pins.length > 0 && (
        <div className="absolute bottom-28 left-4 right-4 bg-white p-3 rounded-xl shadow text-sm z-10">
          <div className="font-bold mb-1">
            What’s going on in Hastings right now
          </div>
          <div>{pins[issueIndex].description}</div>
        </div>
      )}

      {/* REPORT PANEL */}
      {reportMode && (
        <div className="absolute bottom-24 left-4 right-4 bg-white p-4 rounded-xl shadow z-20">
          <textarea
            placeholder="Describe what’s going on..."
            className="w-full border p-2 rounded mb-2"
            value={reportData.description}
            onChange={(e) =>
              setReportData({ ...reportData, description: e.target.value })
            }
          />

          <textarea
            placeholder="Instructions (optional)"
            className="w-full border p-2 rounded mb-2"
            value={reportData.instructions}
            onChange={(e) =>
              setReportData({ ...reportData, instructions: e.target.value })
            }
          />

          <div className="text-sm text-gray-500">
            Tap map to place pin
          </div>
        </div>
      )}

      {/* PIN POPUP */}
      {selectedPin && (
        <div className="absolute bottom-20 left-4 right-4 bg-white p-4 rounded-xl shadow z-20">
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
            className="bg-blue-600 text-white px-3 py-1 rounded"
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

      {/* FLOATING REPORT BUTTON */}
      {!reportMode && (
        <button
          onClick={() => {
            setSelectedPin(null);
            setReportMode(true);
          }}
          className="absolute bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg font-bold z-20"
        >
          + Report
        </button>
      )}
    </div>
  );
}