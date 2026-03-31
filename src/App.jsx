import React, { useEffect, useMemo, useRef, useState } from "react";

// VERSION MARKER
const BUILD_VERSION = "pin-upgrade-1";

/* =========================
   CONSTANTS
========================= */

const PERSONAS = {
  PUBLIC: "public",
  ADMIN: "admin",
  DEPARTMENT: "department",
};

const CATEGORY_TO_ICON = {
  Roads: "🛣️",
  Drainage: "🌧️",
  Traffic: "🚦",
  Parks: "🌳",
  Utilities: "💧",
  "Neighborhood / Property": "🏠",
  "Community Concern": "📌",
};

/* =========================
   APP
========================= */

export default function App() {
  const mapRef = useRef(null);

  const [items, setItems] = useState([
    {
      id: "1",
      title: "Pothole on Burlington",
      category: "Roads",
      x: 40,
      y: 50,
      status: "Under Review",
      escalated: false,
      type: "community_issue",
    },
    {
      id: "2",
      title: "Water leak",
      category: "Utilities",
      x: 60,
      y: 60,
      status: "In Progress",
      escalated: false,
      type: "community_issue",
    },
    {
      id: "3",
      title: "Major road damage",
      category: "Roads",
      x: 30,
      y: 30,
      status: "Under Review",
      escalated: true,
      type: "community_issue",
    },
    {
      id: "4",
      title: "Park cleanup",
      category: "Parks",
      x: 70,
      y: 25,
      status: "Routed",
      escalated: false,
      type: "city_activity",
    },
  ]);

  const [selectedItemId, setSelectedItemId] = useState(null);

  const mapItems = useMemo(() => items, [items]);

  function renderMap() {
    return (
      <div
        ref={mapRef}
        style={{
          height: 500,
          position: "relative",
          borderRadius: 16,
          background:
            "linear-gradient(180deg,#cfe6fb 0%,#ecf6e6 50%,#f3f8ff 100%)",
          overflow: "hidden",
        }}
      >
        {/* Pulse animation */}
        <style>
          {`
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.4; }
            70% { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(0.6); opacity: 0; }
          }
        `}
        </style>

        {/* Pins */}
        {mapItems.map((item) => {
          const isSelected = selectedItemId === item.id;

          let pinColor = "#e53935";
          let pulse = false;
          let scale = 1;

          if (item.type === "city_activity") {
            pinColor = "#0f6ab7";
          }

          if (item.escalated) {
            pinColor = "#ff9800";
            pulse = true;
            scale = 1.2;
          }

          if (item.status === "In Progress") {
            pulse = true;
            scale = 1.1;
          }

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              style={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -100%)",
                cursor: "pointer",
              }}
            >
              {pulse && (
                <div
                  style={{
                    position: "absolute",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: pinColor,
                    opacity: 0.2,
                    top: -8,
                    left: -7,
                    animation: "pulse 1.5s infinite",
                  }}
                />
              )}

              <div
                style={{
                  width: 18 * scale,
                  height: 18 * scale,
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                  background: isSelected ? "#173d6a" : pinColor,
                  border: "2px solid white",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 5,
                  left: 5,
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "white",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: -26,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 16,
                }}
              >
                {CATEGORY_TO_ICON[item.category]}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>PublicPulse</h2>
      {renderMap()}
    </div>
  );
}