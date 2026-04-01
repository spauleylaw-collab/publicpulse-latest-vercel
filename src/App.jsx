import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   VERSION
========================= */

const BUILD_VERSION = "full-build-report-forward-4";

/* =========================
   CONSTANTS
========================= */

const CITY_NAME = "Hastings";

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

const MAP_MODES = {
  CIVIC: "civic",
  LIVE: "live",
};

const PUBLIC_CATEGORIES = [
  "Roads",
  "Drainage",
  "Traffic",
  "Parks",
  "Utilities",
  "Neighborhood / Property",
  "Community Concern",
];

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

const REPORT_TYPES = [
  "Selected Issue Report",
  "Council Report",
  "Department Summary",
  "Budget Impact Summary",
  "Grant Support Summary",
  "Monthly Roll-Up",
  "Annual Review",
];

const REPORT_TIMEFRAMES = [
  "Current view",
  "Last 7 days",
  "Last 30 days",
  "Quarter to date",
  "Year to date",
];

const CATEGORY_TO_DEPARTMENT = {
  Roads: "Street Department",
  Drainage: "Public Works",
  Traffic: "Traffic Operations",
  Parks: "Parks",
  Utilities: "Utilities",
  "Neighborhood / Property": "Code Enforcement",
  "Community Concern": "Administration",
};

const CATEGORY_TO_FUND = {
  Roads: "Street Fund",
  Drainage: "Public Works Fund",
  Traffic: "Traffic Fund",
  Parks: "Parks / Keno",
  Utilities: "Utility Fund",
  "Neighborhood / Property": "General Fund",
  "Community Concern": "General Fund",
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

const STATUS_STYLES = {
  "Under Review": {
    background: "#FFF4DB",
    color: "#7A5600",
    border: "1px solid #F1D98A",
  },
  Routed: {
    background: "#EAF2FF",
    color: "#1F4E9D",
    border: "1px solid #CDE0FF",
  },
  "In Progress": {
    background: "#E8F7EC",
    color: "#146C2E",
    border: "1px solid #BFE3C9",
  },
  Escalated: {
    background: "#FFF0F0",
    color: "#A43D3D",
    border: "1px solid #F5C5C5",
  },
  Resolved: {
    background: "#EEF0F2",
    color: "#495057",
    border: "1px solid #D9E0E5",
  },
  Monitoring: {
    background: "#F4F0FF",
    color: "#5B3FA8",
    border: "1px solid #D9CEFF",
  },
};

const INITIAL_BUDGETS = [
  { fund: "General Fund", budgeted: 5600000, spent: 3985000 },
  { fund: "Street Fund", budgeted: 2400000, spent: 1735000 },
  { fund: "Utility Fund", budgeted: 4200000, spent: 2875000 },
  { fund: "Parks / Keno", budgeted: 1450000, spent: 910000 },
  { fund: "Traffic Fund", budgeted: 950000, spent: 540000 },
  { fund: "Public Works Fund", budgeted: 1800000, spent: 1015000 },
];

const INITIAL_ITEMS = [
  {
    id: "item-1",
    type: "community_issue",
    title: "Pothole on Burlington",
    summary: "Large pothole causing traffic issues.",
    description:
      "A large pothole is causing repeated traffic issues and rough driving conditions along Burlington.",
    category: "Roads",
    recommendedDepartment: "Street Department",
    assignedDepartments: ["Street Department"],
    confidence: 87,
    status: "Under Review",
    publicStatus: "Under Review",
    escalated: false,
    specialInstructions: "",
    x: 42,
    y: 50,
    locationLabel: "Burlington corridor",
    updatedAt: new Date().toISOString(),
    affectedCount: 3,
    affectedByUser: false,
    fund: "Street Fund",
    source: "Resident",
    queueStage: "city_review",
    reviewReminderAt: null,
  },
  {
    id: "item-2",
    type: "community_issue",
    title: "Standing water near storm inlet",
    summary: "Drainage concern reported after recent rain.",
    description:
      "Standing water is collecting near a storm inlet and may require inspection or clearing.",
    category: "Drainage",
    recommendedDepartment: "Public Works",
    assignedDepartments: ["Public Works"],
    confidence: 82,
    status: "Routed",
    publicStatus: "Routed to department",
    escalated: false,
    specialInstructions: "",
    x: 27,
    y: 62,
    locationLabel: "Southwest residential area",
    updatedAt: new Date().toISOString(),
    affectedCount: 2,
    affectedByUser: false,
    fund: "Public Works Fund",
    source: "Resident",
    queueStage: "department_active",
    reviewReminderAt: null,
  },
  {
    id: "item-3",
    type: "community_issue",
    title: "Traffic signal timing issue",
    summary: "Signal timing may be creating backups at peak hours.",
    description:
      "Residents have reported traffic signal timing problems leading to backups during the afternoon rush.",
    category: "Traffic",
    recommendedDepartment: "Traffic Operations",
    assignedDepartments: ["Traffic Operations"],
    confidence: 79,
    status: "Monitoring",
    publicStatus: "Monitoring",
    escalated: true,
    specialInstructions: "",
    x: 56,
    y: 45,
    locationLabel: "Downtown intersection",
    updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    affectedCount: 4,
    affectedByUser: false,
    fund: "Traffic Fund",
    source: "Resident",
    queueStage: "department_active",
    reviewReminderAt: null,
  },
  {
    id: "item-4",
    type: "city_activity",
    title: "Planned park maintenance",
    summary: "City initiated work scheduled in this park area.",
    description:
      "Parks staff will be completing scheduled maintenance and cleanup work in this park area.",
    category: "Parks",
    recommendedDepartment: "Parks",
    assignedDepartments: ["Parks"],
    confidence: 100,
    status: "Routed",
    publicStatus: "City initiated work",
    escalated: false,
    specialInstructions: "Routine spring maintenance.",
    x: 72,
    y: 28,
    locationLabel: "North park zone",
    updatedAt: new Date().toISOString(),
    affectedCount: 0,
    affectedByUser: false,
    fund: "Parks / Keno",
    source: "City",
    queueStage: "department_active",
    reviewReminderAt: null,
  },
  {
    id: "item-5",
    type: "community_issue",
    title: "Water leak near curb line",
    summary: "Possible utility leak observed near the curb.",
    description:
      "A possible water leak has been observed near the curb line and appears to be expanding.",
    category: "Utilities",
    recommendedDepartment: "Utilities",
    assignedDepartments: ["Utilities"],
    confidence: 93,
    status: "In Progress",
    publicStatus: "City responding",
    escalated: false,
    specialInstructions: "Check nearby service lines while on site.",
    x: 63,
    y: 58,
    locationLabel: "East utility corridor",
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    affectedCount: 1,
    affectedByUser: false,
    fund: "Utility Fund",
    source: "Department",
    queueStage: "department_active",
    reviewReminderAt: null,
  },
];

const INITIAL_SIGNALS = [
  {
    id: "signal-1",
    source: "Utilities social channel",
    text: "Water main break reported near 7th and Lincoln. Crews are responding.",
  },
  {
    id: "signal-2",
    source: "Parks social channel",
    text: "Spring cleanup continues across city parks this week.",
  },
  {
    id: "signal-3",
    source: "City social channel",
    text: "Street maintenance activity planned in the north corridor this week.",
  },
];

/* =========================
   HELPERS
========================= */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortDate(iso) {
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function derivePublicStatus(status, escalated, type) {
  if (type === "city_activity" && status === "Routed") return "City initiated work";
  if (status === "Resolved") return "Resolved";
  if (status === "In Progress") return "City responding";
  if (status === "Monitoring") return "Monitoring";
  if (escalated || status === "Escalated") return "Priority review";
  if (status === "Routed") return "Routed to department";
  return "Under Review";
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  return SpeechRecognition;
}

function inferCategory(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("pothole") ||
    lower.includes("road") ||
    lower.includes("street") ||
    lower.includes("asphalt")
  ) {
    return "Roads";
  }
  if (
    lower.includes("drain") ||
    lower.includes("storm") ||
    lower.includes("flood") ||
    lower.includes("standing water")
  ) {
    return "Drainage";
  }
  if (
    lower.includes("traffic") ||
    lower.includes("signal") ||
    lower.includes("light") ||
    lower.includes("intersection")
  ) {
    return "Traffic";
  }
  if (
    lower.includes("park") ||
    lower.includes("playground") ||
    lower.includes("trail")
  ) {
    return "Parks";
  }
  if (
    lower.includes("water") ||
    lower.includes("utility") ||
    lower.includes("power") ||
    lower.includes("leak") ||
    lower.includes("outage")
  ) {
    return "Utilities";
  }
  if (
    lower.includes("property") ||
    lower.includes("yard") ||
    lower.includes("trash") ||
    lower.includes("abandoned")
  ) {
    return "Neighborhood / Property";
  }

  return "Community Concern";
}

function inferConfidence(text) {
  const lower = text.toLowerCase();
  let confidence = 72;

  if (
    lower.includes("reported") ||
    lower.includes("visible") ||
    lower.includes("leak") ||
    lower.includes("damaged")
  ) {
    confidence += 8;
  }

  if (
    lower.includes("maybe") ||
    lower.includes("might") ||
    lower.includes("possibly")
  ) {
    confidence -= 10;
  }

  return clamp(confidence, 45, 98);
}

function estimateCost(category) {
  switch (category) {
    case "Roads":
      return 1800;
    case "Drainage":
      return 2600;
    case "Traffic":
      return 1400;
    case "Parks":
      return 1200;
    case "Utilities":
      return 4200;
    case "Neighborhood / Property":
      return 900;
    default:
      return 1000;
  }
}

function getWhoIsReviewing(item) {
  if (item.type === "city_activity") return "City";
  if (item.status === "Under Review") return "City review";
  return item.assignedDepartments[0] || item.recommendedDepartment;
}

function getCitySeesText(item) {
  if (item.type === "city_activity") {
    return "Planned work is already visible on the map so residents can understand what the city is doing.";
  }
  if (item.escalated || item.status === "Escalated") {
    return "The city sees this as a higher-priority concern and is paying closer attention to it.";
  }
  if (item.status === "In Progress") {
    return "The city sees an active problem that crews are already addressing.";
  }
  return "The city sees this as a tracked concern that needs review, routing, or timing decisions.";
}

function getWhyTimingVaries(item) {
  if (item.type === "city_activity") {
    return "City initiated work timing may shift based on scheduling, weather, staffing, and related work.";
  }
  return "Timing may vary based on urgency, safety, staffing, weather, equipment, and budget priorities.";
}

function getNextExpectedStep(item) {
  if (item.type === "city_activity") {
    return "Crews continue scheduled work and update the map as progress changes.";
  }
  if (item.status === "Under Review") {
    return "A city reviewer confirms routing or marks it for later review.";
  }
  if (item.status === "Routed") {
    return "The assigned department reviews the issue and decides next field action.";
  }
  if (item.status === "In Progress") {
    return "Crews continue work and update the issue when conditions change.";
  }
  if (item.status === "Monitoring") {
    return "The city keeps watching the issue and updates if action becomes necessary.";
  }
  if (item.status === "Resolved") {
    return "The issue remains visible as resolved unless residents report it again.";
  }
  return "The city updates routing or work status as the situation changes.";
}

function getInsightLine(item) {
  if (!item) return "";
  if (item.type === "city_activity") {
    return `${item.title} — ${item.publicStatus} by ${item.assignedDepartments[0]}`;
  }
  return `${item.title} — ${item.status} by ${item.assignedDepartments[0]}`;
}

function getDepartmentSlaHours(item) {
  if (item.escalated || item.status === "Escalated") return 24;
  if (item.category === "Utilities") return 24;
  if (item.category === "Roads") return 72;
  if (item.category === "Traffic") return 72;
  return 168;
}

function isOverdueForCityReview(item) {
  if (item.queueStage !== "department_active") return false;
  if (item.status === "Resolved") return false;

  const updated = new Date(item.updatedAt).getTime();
  const dueAt = updated + getDepartmentSlaHours(item) * 60 * 60 * 1000;

  return Date.now() > dueAt;
}

function isVisibleInCityQueue(item) {
  if (item.queueStage === "city_review") {
    if (!item.reviewReminderAt) return true;
    const now = Date.now();
    const reminderTime = new Date(item.reviewReminderAt).getTime();
    return reminderTime <= now;
  }

  if (isOverdueForCityReview(item)) return true;

  return false;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 980 : false
  );

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 980);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

/* =========================
   UI HELPERS
========================= */

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES["Under Review"];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        ...style,
      }}
    >
      {status}
    </span>
  );
}

function MicButton({ listening, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Use microphone"
      style={{
        border: "1px solid #cfe0f0",
        borderRadius: 12,
        padding: "10px 12px",
        fontWeight: 700,
        cursor: "pointer",
        background: listening ? "#eef6ff" : "white",
        color: listening ? "#0f6ab7" : "#24527a",
        minWidth: 48,
      }}
    >
      {listening ? "🎙️…" : "🎙️"}
    </button>
  );
}

function TextInputWithMic({
  value,
  onChange,
  placeholder,
  listening,
  onMicClick,
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          borderRadius: 12,
          border: "1px solid #d7e4f0",
          padding: "12px 12px",
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          background: "white",
        }}
      />
      <MicButton listening={listening} onClick={onMicClick} />
    </div>
  );
}

function TextareaWithMic({
  value,
  onChange,
  placeholder,
  listening,
  onMicClick,
  minHeight = 96,
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight,
          borderRadius: 12,
          border: "1px solid #d7e4f0",
          padding: "12px 12px",
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          resize: "vertical",
          background: "white",
        }}
      />
      <MicButton listening={listening} onClick={onMicClick} />
    </div>
  );
}

function primaryButtonStyle() {
  return {
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 700,
    cursor: "pointer",
    background: "#0f6ab7",
    color: "white",
  };
}

function secondaryButtonStyle() {
  return {
    border: "1px solid #cfe0f0",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 700,
    cursor: "pointer",
    background: "white",
    color: "#24527a",
  };
}

function actionButtonStyle(active = false, disabled = false) {
  return {
    width: "100%",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: active ? "1px solid #0f6ab7" : "1px solid #cfe0f0",
    background: active ? "#0f6ab7" : "white",
    color: active ? "white" : "#24527a",
    opacity: disabled ? 0.5 : 1,
    textDecoration: disabled ? "line-through" : "none",
    textAlign: "left",
  };
}

function mapModeButtonStyle(active = false) {
  return {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #cfe0f0",
    background: active ? "#0f6ab7" : "white",
    color: active ? "white" : "#24527a",
    fontWeight: 700,
    cursor: "pointer",
  };
}

function panelStyle(sticky = false) {
  return {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 28px rgba(25,42,70,0.08)",
    border: "1px solid #e7edf5",
    ...(sticky ? { position: "sticky", top: 16 } : {}),
  };
}

function listItemStyle(selected = false) {
  return {
    background: selected ? "#eef6ff" : "#f8fbfe",
    border: "1px solid #e5edf6",
    borderRadius: 14,
    padding: 12,
  };
}

function Modal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          background: "white",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 18px 50px rgba(15,23,42,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #d7e4f0",
              background: "white",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const isMobile = useIsMobile();
  const mapRef = useRef(null);

  const [persona, setPersona] = useState(PERSONAS.PUBLIC);
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [mapMode, setMapMode] = useState(MAP_MODES.CIVIC);

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [budgetData] = useState(INITIAL_BUDGETS);
  const [signals] = useState(INITIAL_SIGNALS);
  const [notifications, setNotifications] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [listeningField, setListeningField] = useState(null);
  const [remindLaterHours, setRemindLaterHours] = useState("24");
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedCityAction, setSelectedCityAction] = useState("");

  const [reportMode, setReportMode] = useState(false);
  const [reportPin, setReportPin] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [reportForm, setReportForm] = useState({
    description: "",
    category: "Community Concern",
    categoryTouched: false,
  });

  const [cityInitiatedMode, setCityInitiatedMode] = useState(false);
  const [cityInitiatedPin, setCityInitiatedPin] = useState(null);
  const [showCityInitiatedModal, setShowCityInitiatedModal] = useState(false);
  const [cityInitiatedForm, setCityInitiatedForm] = useState({
    title: "",
    description: "",
    category: "Roads",
    specialInstructions: "",
  });

  const [commandForm, setCommandForm] = useState({
    specialInstructions: "",
    reassignDepartment: "Administration",
    multiDepartments: [],
  });

  const [reportBuilder, setReportBuilder] = useState({
    type: "Council Report",
    scope: "Citywide",
    department: "All departments",
    timeframe: "Current view",
  });

  const [generatedReport, setGeneratedReport] = useState({
    title: "",
    subtitle: "",
    sections: [],
  });

  const mapItems = useMemo(() => {
    if (mapMode === MAP_MODES.CIVIC) {
      return items.filter((item) => item.x != null && item.y != null);
    }

    if (mapMode === MAP_MODES.LIVE) {
      return items.filter(
        (item) =>
          item.x != null &&
          item.y != null &&
          item.type === "community_issue"
      );
    }

    return [];
  }, [items, mapMode]);

  const featuredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.type === "community_issue" || item.type === "city_activity"
      ),
    [items]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  const featuredItem = useMemo(() => {
    if (!featuredItems.length) return null;
    return featuredItems[rotationIndex % featuredItems.length];
  }, [featuredItems, rotationIndex]);

  const summary = useMemo(() => {
    return {
      open: items.filter((item) => item.status !== "Resolved").length,
      escalated: items.filter(
        (item) => item.escalated || item.status === "Escalated"
      ).length,
      cityInitiated: items.filter((item) => item.type === "city_activity").length,
    };
  }, [items]);

  const visibleCityQueueItems = useMemo(() => {
    return items
      .filter((item) => isVisibleInCityQueue(item))
      .sort((a, b) => {
        const aOverdue = isOverdueForCityReview(a) ? 1 : 0;
        const bOverdue = isOverdueForCityReview(b) ? 1 : 0;

        if (aOverdue !== bOverdue) return bOverdue - aOverdue;

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items]);

  const visibleDepartmentQueueItems = useMemo(() => {
    return items.filter(
      (item) => item.queueStage === "department_active" && item.status !== "Resolved"
    );
  }, [items]);

  useEffect(() => {
    if (!featuredItems.length) return undefined;

    const timer = window.setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % featuredItems.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [featuredItems.length]);

  useEffect(() => {
    if (!reportForm.description.trim()) {
      if (
        !reportForm.categoryTouched &&
        reportForm.category !== "Community Concern"
      ) {
        setReportForm((prev) => ({ ...prev, category: "Community Concern" }));
      }
      return;
    }

    if (!reportForm.categoryTouched) {
      const suggested = inferCategory(reportForm.description);
      if (suggested !== reportForm.category) {
        setReportForm((prev) => ({ ...prev, category: suggested }));
      }
    }
  }, [reportForm.description, reportForm.categoryTouched, reportForm.category]);

  function startVoiceInput(fieldName, getValue, setValue) {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      window.alert("Microphone is not supported on this device/browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      setListeningField(fieldName);

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        const currentValue = getValue();
        const nextValue = currentValue
          ? `${currentValue} ${transcript}`.trim()
          : transcript.trim();

        setValue(nextValue);
      };

      recognition.onerror = () => setListeningField(null);
      recognition.onend = () => setListeningField(null);

      recognition.start();
    } catch {
      setListeningField(null);
      window.alert("Microphone could not start.");
    }
  }

  function addNotification(message, department, severity = "medium") {
    setNotifications((prev) => [
      {
        id: makeId("note"),
        message,
        department,
        severity,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  }

  function closeMapPopover() {
    setSelectedItemId(null);
  }

  function handleMapClick(event) {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 8, 94);

    if (reportMode && mapMode === MAP_MODES.CIVIC) {
      setReportPin({ x, y });
      setShowReportModal(true);
      return;
    }

    if (cityInitiatedMode && mapMode === MAP_MODES.CIVIC) {
      setCityInitiatedPin({ x, y });
      setShowCityInitiatedModal(true);
      return;
    }

    closeMapPopover();
  }

  function closeReportModal() {
    setShowReportModal(false);
    setReportMode(false);
    setReportPin(null);
    setReportForm({
      description: "",
      category: "Community Concern",
      categoryTouched: false,
    });
  }

  function closeCityInitiatedModal() {
    setShowCityInitiatedModal(false);
    setCityInitiatedMode(false);
    setCityInitiatedPin(null);
    setCityInitiatedForm({
      title: "",
      description: "",
      category: "Roads",
      specialInstructions: "",
    });
  }

  function submitReport() {
    if (!reportPin || !reportForm.description.trim()) return;

    const category = reportForm.category || inferCategory(reportForm.description);
    const recommendedDepartment = CATEGORY_TO_DEPARTMENT[category];
    const confidence = inferConfidence(reportForm.description);

    const nextItem = {
      id: makeId("item"),
      type: "community_issue",
      title:
        reportForm.description.length > 56
          ? `${reportForm.description.slice(0, 56)}…`
          : reportForm.description,
      summary: reportForm.description,
      description: reportForm.description,
      category,
      recommendedDepartment,
      assignedDepartments: [recommendedDepartment],
      confidence,
      status: "Under Review",
      publicStatus: "Under Review",
      escalated: false,
      specialInstructions: "",
      x: reportPin.x,
      y: reportPin.y,
      locationLabel: "Resident-selected location",
      updatedAt: new Date().toISOString(),
      affectedCount: 1,
      affectedByUser: true,
      fund: CATEGORY_TO_FUND[category],
      source: "Resident",
      queueStage: "city_review",
      reviewReminderAt: null,
    };

    setItems((prev) => [nextItem, ...prev]);
    setSelectedItemId(nextItem.id);

    addNotification(
      `AI recommended ${recommendedDepartment} for a new community report.`,
      recommendedDepartment,
      confidence >= 85 ? "high" : "medium"
    );

    closeReportModal();
    setShowThankYou(true);
  }

  function submitCityInitiatedPin() {
    if (
      !cityInitiatedPin ||
      !cityInitiatedForm.title.trim() ||
      !cityInitiatedForm.description.trim()
    ) {
      return;
    }

    const category = cityInitiatedForm.category;
    const department = CATEGORY_TO_DEPARTMENT[category];

    const nextItem = {
      id: makeId("item"),
      type: "city_activity",
      title: cityInitiatedForm.title,
      summary: cityInitiatedForm.description,
      description: cityInitiatedForm.description,
      category,
      recommendedDepartment: department,
      assignedDepartments: [department],
      confidence: 100,
      status: "Routed",
      publicStatus: "City initiated work",
      escalated: false,
      specialInstructions: cityInitiatedForm.specialInstructions,
      x: cityInitiatedPin.x,
      y: cityInitiatedPin.y,
      locationLabel: "City-selected project location",
      updatedAt: new Date().toISOString(),
      affectedCount: 0,
      affectedByUser: false,
      fund: CATEGORY_TO_FUND[category],
      source: "City",
      queueStage: "department_active",
      reviewReminderAt: null,
    };

    setItems((prev) => [nextItem, ...prev]);
    setSelectedItemId(nextItem.id);

    addNotification(
      `New city initiated pin created for ${department}.`,
      department,
      "medium"
    );

    closeCityInitiatedModal();
    setActiveTab(TABS.HOME);
  }

  function markAffected(itemId) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              affectedCount: item.affectedByUser
                ? item.affectedCount
                : item.affectedCount + 1,
              affectedByUser: true,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }

  function updateCommandForm(key, value) {
    setCommandForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyCommandAction(action) {
    if (!selectedItem) return;

    let nextStatus = selectedItem.status;
    let nextEscalated = selectedItem.escalated;
    let nextDepartments = [...selectedItem.assignedDepartments];
    let nextQueueStage = selectedItem.queueStage || "city_review";
    const specialInstructions = commandForm.specialInstructions.trim();

    if (action === "confirm_routing") {
      nextStatus = "Routed";
      nextDepartments = [selectedItem.recommendedDepartment];
      nextQueueStage = "department_active";
    }

    if (action === "reassign") {
      nextStatus = "Routed";
      nextDepartments = [commandForm.reassignDepartment];
      nextQueueStage = "department_active";
    }

    if (action === "escalate") {
      nextEscalated = true;
      nextStatus = "Escalated";
      nextQueueStage = "department_active";
    }

    if (action === "multi_department") {
      const picked = commandForm.multiDepartments.length
        ? commandForm.multiDepartments
        : [selectedItem.recommendedDepartment];
      nextDepartments = picked;
      nextStatus = "Routed";
      nextQueueStage = "department_active";
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              assignedDepartments: nextDepartments,
              status: nextStatus,
              escalated: nextEscalated,
              queueStage: nextQueueStage,
              reviewReminderAt: null,
              specialInstructions: specialInstructions || item.specialInstructions,
              publicStatus: derivePublicStatus(nextStatus, nextEscalated, item.type),
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    addNotification(
      `${selectedItem.title}: ${action.replaceAll("_", " ")} completed.`,
      nextDepartments[0] || selectedItem.recommendedDepartment,
      action === "escalate" ? "high" : "medium"
    );

    setCommandForm((prev) => ({
      ...prev,
      specialInstructions: "",
    }));

    setSelectedCityAction("");
  }

  function applyDepartmentStatus(status) {
    if (!selectedItem) return;

    const nextQueueStage = status === "Resolved" ? "resolved" : "department_active";

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status,
              queueStage: nextQueueStage,
              publicStatus: derivePublicStatus(status, item.escalated, item.type),
              specialInstructions:
                commandForm.specialInstructions.trim() || item.specialInstructions,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    addNotification(
      `${selectedItem.title} updated to ${status}.`,
      selectedItem.assignedDepartments[0] || selectedItem.recommendedDepartment,
      status === "Resolved" ? "medium" : "low"
    );

    setCommandForm((prev) => ({
      ...prev,
      specialInstructions: "",
    }));
  }

  function applyRemindLater(hours) {
    if (!selectedItem) return;

    const now = new Date();
    const remindAt = new Date(now.getTime() + Number(hours) * 60 * 60 * 1000);

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status: "Under Review",
              publicStatus: "Under Review",
              queueStage: "city_review",
              reviewReminderAt: remindAt.toISOString(),
              specialInstructions:
                commandForm.specialInstructions.trim() || item.specialInstructions,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    addNotification(
      `${selectedItem.title} removed from the City queue until ${formatShortDate(
        remindAt.toISOString()
      )}.`,
      selectedItem.assignedDepartments[0] || selectedItem.recommendedDepartment,
      "medium"
    );

    setCommandForm((prev) => ({
      ...prev,
      specialInstructions: "",
    }));

    setSelectedCityAction("");
  }

  function toggleMultiDepartment(department) {
    setCommandForm((prev) => {
      const exists = prev.multiDepartments.includes(department);
      return {
        ...prev,
        multiDepartments: exists
          ? prev.multiDepartments.filter((item) => item !== department)
          : [...prev.multiDepartments, department],
      };
    });
  }

  function buildReportSections(filteredItems) {
    const total = filteredItems.length;
    const open = filteredItems.filter((item) => item.status !== "Resolved").length;
    const resolved = filteredItems.filter((item) => item.status === "Resolved").length;
    const priority = filteredItems.filter(
      (item) => item.escalated || item.status === "Escalated"
    ).length;
    const inProgress = filteredItems.filter(
      (item) => item.status === "In Progress"
    ).length;
    const overdue = filteredItems.filter((item) => isOverdueForCityReview(item)).length;
    const communitySignals = filteredItems.reduce(
      (sum, item) => sum + (item.affectedCount || 0),
      0
    );

    const byDepartment = ROUTING_DEPARTMENTS.map((department) => ({
      department,
      count: filteredItems.filter((item) =>
        item.assignedDepartments.includes(department)
      ).length,
    })).filter((entry) => entry.count > 0);

    const topItems = [...filteredItems]
      .sort((a, b) => (b.affectedCount || 0) - (a.affectedCount || 0))
      .slice(0, 5);

    const budgetLines = budgetData.map((fund) => {
      const remaining = fund.budgeted - fund.spent;
      return `${fund.fund}: ${formatMoney(fund.spent)} spent of ${formatMoney(
        fund.budgeted
      )}, ${formatMoney(remaining)} remaining.`;
    });

    return {
      total,
      open,
      resolved,
      priority,
      inProgress,
      overdue,
      communitySignals,
      byDepartment,
      topItems,
      budgetLines,
    };
  }

  function handleGenerateReport() {
    const selectedDepartment =
      reportBuilder.department === "All departments"
        ? null
        : reportBuilder.department;

    const filteredItems = items.filter((item) => {
      if (reportBuilder.scope === "Selected issue only" && selectedItem) {
        return item.id === selectedItem.id;
      }
      if (selectedDepartment) {
        return item.assignedDepartments.includes(selectedDepartment);
      }
      return true;
    });

    const stats = buildReportSections(filteredItems);
    const type = reportBuilder.type;

    let title = type;
    const subtitle = `${CITY_NAME} • ${reportBuilder.timeframe} • ${reportBuilder.scope}${
      reportBuilder.department !== "All departments"
        ? ` • ${reportBuilder.department}`
        : ""
    }`;
    let sections = [];

    if (type === "Selected Issue Report") {
      title = "Selected Issue Report";
      sections = [
        {
          heading: "Overview",
          body: selectedItem
            ? `${selectedItem.title} is currently marked ${selectedItem.publicStatus}. It is assigned to ${selectedItem.assignedDepartments.join(
                ", "
              )} and has ${selectedItem.affectedCount} community signals.`
            : "No selected issue is currently open.",
        },
        {
          heading: "What the City Sees",
          body: selectedItem
            ? getCitySeesText(selectedItem)
            : "No selected issue is currently open.",
        },
        {
          heading: "Who Is Reviewing",
          body: selectedItem
            ? getWhoIsReviewing(selectedItem)
            : "No selected issue is currently open.",
        },
        {
          heading: "Budget Context",
          body: selectedItem
            ? `Fund: ${selectedItem.fund}. Estimated impact: ${formatMoney(
                estimateCost(selectedItem.category)
              )}.`
            : "No selected issue is currently open.",
        },
        {
          heading: "Next Expected Step",
          body: selectedItem
            ? getNextExpectedStep(selectedItem)
            : "No selected issue is currently open.",
        },
      ];
    }

    if (type === "Council Report") {
      sections = [
        {
          heading: "Overview",
          body: `PublicPulse is currently tracking ${stats.total} items in scope, with ${stats.open} still open, ${stats.resolved} resolved, ${stats.priority} marked as priority concerns, ${stats.overdue} needing renewed City attention, and ${stats.communitySignals} total community signals.`,
        },
        {
          heading: "Top Concerns",
          body: stats.topItems.length
            ? stats.topItems
                .map(
                  (item, index) =>
                    `${index + 1}. ${item.title} — ${item.publicStatus}. ${
                      item.affectedCount
                    } community signals. Assigned to ${item.assignedDepartments.join(
                      ", "
                    )}.`
                )
                .join("\n")
            : "No issues matched the selected report scope.",
        },
        {
          heading: "Department Activity",
          body: stats.byDepartment.length
            ? stats.byDepartment
                .map(
                  (entry) => `${entry.department}: ${entry.count} tracked items.`
                )
                .join("\n")
            : "No department activity matched the selected report scope.",
        },
        {
          heading: "Budget Context",
          body: stats.budgetLines.join("\n"),
        },
        {
          heading: "Recommended Next Actions",
          body: "Focus City attention on the most visible open concerns, follow up on overdue department items, confirm routing on under-review items, and continue moving in-progress items toward closure.",
        },
      ];
    }

    if (type === "Department Summary") {
      sections = [
        {
          heading: "Overview",
          body: `This summary covers ${stats.total} items for the selected department scope, with ${stats.open} open items, ${stats.inProgress} in progress, and ${stats.resolved} resolved items.`,
        },
        {
          heading: "Current Workload",
          body: `Open items: ${stats.open}\nIn progress: ${stats.inProgress}\nPriority items: ${stats.priority}\nOverdue follow-ups: ${stats.overdue}`,
        },
        {
          heading: "Issue List",
          body: stats.topItems.length
            ? stats.topItems
                .map(
                  (item, index) =>
                    `${index + 1}. ${item.title} — ${item.publicStatus} • ${item.locationLabel}`
                )
                .join("\n")
            : "No issues matched the selected report scope.",
        },
        {
          heading: "Recommended Next Actions",
          body: "Review under-review items, update active work promptly, and close the loop on resolved issues so public status stays current.",
        },
      ];
    }

    if (type === "Budget Impact Summary") {
      sections = [
        {
          heading: "Overview",
          body: `This summary highlights operational demand visible in PublicPulse and pairs it with current budget context. ${stats.total} items are in scope with ${stats.priority} marked priority and ${stats.overdue} needing renewed attention.`,
        },
        {
          heading: "Operational Demand",
          body: filteredItems.length
            ? filteredItems
                .map(
                  (item) =>
                    `${item.title}: estimated impact ${formatMoney(
                      estimateCost(item.category)
                    )} from ${item.fund}.`
                )
                .join("\n")
            : "No items matched the selected scope.",
        },
        {
          heading: "Fund Snapshot",
          body: stats.budgetLines.join("\n"),
        },
        {
          heading: "Recommended Next Actions",
          body: "Use this summary to connect visible service demand with current fund pressure, near-term workload, and any overdue operational items.",
        },
      ];
    }

    if (type === "Grant Support Summary") {
      sections = [
        {
          heading: "Overview",
          body: `This summary is designed to support narrative development for external funding requests. PublicPulse is tracking ${stats.total} issues in this scope including ${stats.priority} higher-priority concerns and ${stats.communitySignals} community signals.`,
        },
        {
          heading: "Need Statement",
          body: "Recurring public concerns and visible service demand support the case for targeted external funding to accelerate response, reduce delay, and improve operational resilience.",
        },
        {
          heading: "Illustrative Issues",
          body: stats.topItems.length
            ? stats.topItems
                .map(
                  (item, index) =>
                    `${index + 1}. ${item.title} — ${item.publicStatus}. ${item.affectedCount} community signals.`
                )
                .join("\n")
            : "No issues matched the selected report scope.",
        },
        {
          heading: "Budget Context",
          body: stats.budgetLines.join("\n"),
        },
        {
          heading: "Recommended Narrative Direction",
          body: "Highlight recurring public need, department workload, visible demand on infrastructure systems, and the value of targeted funding to accelerate response.",
        },
      ];
    }

    if (type === "Monthly Roll-Up") {
      sections = [
        {
          heading: "Overview",
          body: `This monthly roll-up summarizes tracked concerns, department activity, and operational visibility. Open: ${stats.open}. Resolved: ${stats.resolved}. Priority: ${stats.priority}. Overdue: ${stats.overdue}.`,
        },
        {
          heading: "Most Visible Issues",
          body: stats.topItems.length
            ? stats.topItems
                .map(
                  (item, index) =>
                    `${index + 1}. ${item.title} — ${item.publicStatus}. ${item.affectedCount} community signals.`
                )
                .join("\n")
            : "No issues matched the selected report scope.",
        },
        {
          heading: "Department Activity",
          body: stats.byDepartment.length
            ? stats.byDepartment
                .map(
                  (entry) => `${entry.department}: ${entry.count} tracked items.`
                )
                .join("\n")
            : "No department activity matched the selected report scope.",
        },
        {
          heading: "Recommended Next Actions",
          body: "Carry forward unresolved high-visibility concerns, follow up on overdue items, confirm routes on newer issues, and maintain consistent public-facing updates.",
        },
      ];
    }

    if (type === "Annual Review") {
      sections = [
        {
          heading: "Overview",
          body: "This annual review summarizes PublicPulse activity across the selected scope.",
        },
        {
          heading: "Annual Snapshot",
          body: `Total items: ${stats.total}\nOpen items: ${stats.open}\nResolved items: ${stats.resolved}\nPriority items: ${stats.priority}\nOverdue follow-ups: ${stats.overdue}\nCommunity signals: ${stats.communitySignals}`,
        },
        {
          heading: "Most Visible Issues",
          body: stats.topItems.length
            ? stats.topItems
                .map(
                  (item, index) =>
                    `${index + 1}. ${item.title} — ${item.publicStatus}. ${item.affectedCount} community signals.`
                )
                .join("\n")
            : "No issues matched the selected report scope.",
        },
        {
          heading: "Department Activity",
          body: stats.byDepartment.length
            ? stats.byDepartment
                .map(
                  (entry) => `${entry.department}: ${entry.count} tracked items.`
                )
                .join("\n")
            : "No department activity matched the selected report scope.",
        },
        {
          heading: "Budget Context",
          body: stats.budgetLines.join("\n"),
        },
        {
          heading: "Recommended Next Actions",
          body: "Use this annual review to support leadership updates, public accountability, budget conversations, and operational planning for the next cycle.",
        },
      ];
    }

    setGeneratedReport({
      title,
      subtitle,
      sections,
    });
  }

  function renderGeneratedReportPreview() {
    if (!generatedReport.title) return null;

    return (
      <div
        style={{
          marginTop: 14,
          background: "#ffffff",
          border: "1px solid #dbe6f1",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #e5edf6",
            background: "#f8fbfe",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>{generatedReport.title}</div>
          <div style={{ color: "#6b8399", fontSize: 12, marginTop: 4 }}>
            {generatedReport.subtitle}
          </div>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 14 }}>
          {generatedReport.sections.map((section) => (
            <div
              key={section.heading}
              style={{
                background: "#f8fbfe",
                border: "1px solid #e5edf6",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                {section.heading}
              </div>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  color: "#344c63",
                  lineHeight: 1.55,
                }}
              >
                {section.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderGenerateReportPanel() {
    return (
      <div style={listItemStyle()}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Generate report</div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Report type
            </div>
            <select
              value={reportBuilder.type}
              onChange={(e) =>
                setReportBuilder((prev) => ({ ...prev, type: e.target.value }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Scope
            </div>
            <select
              value={reportBuilder.scope}
              onChange={(e) =>
                setReportBuilder((prev) => ({ ...prev, scope: e.target.value }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              <option value="Citywide">Citywide</option>
              <option value="Selected issue only">Selected issue only</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Department
            </div>
            <select
              value={reportBuilder.department}
              onChange={(e) =>
                setReportBuilder((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              <option value="All departments">All departments</option>
              {ROUTING_DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Timeframe
            </div>
            <select
              value={reportBuilder.timeframe}
              onChange={(e) =>
                setReportBuilder((prev) => ({
                  ...prev,
                  timeframe: e.target.value,
                }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              {REPORT_TIMEFRAMES.map((timeframe) => (
                <option key={timeframe} value={timeframe}>
                  {timeframe}
                </option>
              ))}
            </select>
          </div>

          <button style={primaryButtonStyle()} onClick={handleGenerateReport}>
            Generate report
          </button>
        </div>

        {renderGeneratedReportPreview()}
      </div>
    );
  }

  function renderTopBar() {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #0d4d87 0%, #0f6ab7 100%)",
          color: "#fff",
          borderRadius: 20,
          padding: 18,
          boxShadow: "0 16px 40px rgba(13,77,135,0.22)",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          PublicPulse
        </div>
        <div style={{ fontSize: 14, opacity: 0.95, lineHeight: 1.45 }}>
          A community impact and city response system for residents, departments,
          and city leadership.
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 14,
          }}
        >
          {[
            `City: ${CITY_NAME}`,
            `Mode: ${persona}`,
            `${summary.open} open items`,
            `${summary.escalated} priority`,
            `${summary.cityInitiated} city initiated`,
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "white",
                padding: "8px 12px",
                borderRadius: 999,
                fontSize: 13,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderModeToggle() {
    const options = [
      { key: PERSONAS.PUBLIC, label: "Public" },
      { key: PERSONAS.ADMIN, label: "City" },
      { key: PERSONAS.DEPARTMENT, label: "Department" },
    ];

    return (
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => {
              setPersona(option.key);
              setActiveTab(TABS.HOME);
              setReportMode(false);
              setCityInitiatedMode(false);
              setMapMode(MAP_MODES.CIVIC);
              closeMapPopover();
            }}
            style={{
              ...secondaryButtonStyle(),
              background: persona === option.key ? "#eef6ff" : "white",
              color: persona === option.key ? "#0f6ab7" : "#24527a",
              borderColor: persona === option.key ? "#bcd8f6" : "#cfe0f0",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  function renderInsightBar() {
    return (
      <div style={panelStyle()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              What’s going on in Hastings
            </div>
            {featuredItem ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#173d6a" }}>
                  {getInsightLine(featuredItem)}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#647b92" }}>
                  {featuredItem.affectedCount > 0
                    ? `${featuredItem.affectedCount} community signals • ${getNextExpectedStep(
                        featuredItem
                      )}`
                    : getNextExpectedStep(featuredItem)}
                </div>
              </>
            ) : (
              <div style={{ color: "#647b92" }}>No live insight available.</div>
            )}
          </div>

          {featuredItem && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <StatusBadge status={featuredItem.status} />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f8fbfe",
                  border: "1px solid #dbe8f4",
                  color: "#355a7f",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✓ {getWhoIsReviewing(featuredItem)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderMapPopover(item) {
    if (!item) return null;

    const left = clamp(item.x, 16, 84);
    const top = clamp(item.y - 20, 12, 72);

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          transform: "translate(-50%, -100%)",
          width: isMobile ? 280 : 360,
          maxWidth: "90vw",
          zIndex: 12,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            border: "1px solid #d8e5f1",
            borderRadius: 18,
            boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#67819a", marginTop: 4 }}>
                  {item.locationLabel} • Updated {formatShortDate(item.updatedAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={closeMapPopover}
                style={{
                  border: "1px solid #d7e4f0",
                  background: "white",
                  borderRadius: 10,
                  padding: "6px 8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#355a7f",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <StatusBadge status={item.status} />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f8fbfe",
                  border: "1px solid #dbe8f4",
                  color: "#355a7f",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✓ {getWhoIsReviewing(item)}
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 14,
                lineHeight: 1.5,
                color: "#334b63",
              }}
            >
              {item.description}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                ["Status", item.publicStatus],
                ["Noticed by", `${item.affectedCount} community signals`],
                ["Who’s reviewing", getWhoIsReviewing(item)],
                ["What the city sees", getCitySeesText(item)],
                ["Why timing may vary", getWhyTimingVaries(item)],
                ["Next expected step", getNextExpectedStep(item)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fbfe",
                    border: "1px solid #e4edf6",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#5b7590",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontWeight: label === "Status" ? 800 : 700,
                      fontSize: 14,
                      lineHeight: 1.4,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {item.type === "community_issue" &&
              persona === PERSONAS.PUBLIC &&
              mapMode === MAP_MODES.CIVIC && (
                <div style={{ marginTop: 14 }}>
                  <button
                    disabled={item.affectedByUser}
                    onClick={() => markAffected(item.id)}
                    style={{
                      ...primaryButtonStyle(),
                      opacity: item.affectedByUser ? 0.6 : 1,
                      cursor: item.affectedByUser ? "default" : "pointer",
                      width: "100%",
                    }}
                  >
                    {item.affectedByUser ? "You’ve added your voice" : "I noticed this too"}
                  </button>
                </div>
              )}
          </div>
        </div>

        <div
          style={{
            width: 18,
            height: 18,
            background: "rgba(255,255,255,0.98)",
            borderLeft: "1px solid #d8e5f1",
            borderBottom: "1px solid #d8e5f1",
            transform: "rotate(-45deg)",
            margin: "-9px auto 0",
            boxShadow: "-6px 6px 12px rgba(15,23,42,0.04)",
          }}
        />
      </div>
    );
  }

  function renderMap() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          {mapMode === MAP_MODES.CIVIC ? "City map" : "What’s happening right now"}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 10 }}>
          <button
            onClick={() => {
              setMapMode(MAP_MODES.CIVIC);
              setReportMode(false);
              setCityInitiatedMode(false);
              closeMapPopover();
            }}
            style={mapModeButtonStyle(mapMode === MAP_MODES.CIVIC)}
          >
            Civic
          </button>

          <button
            onClick={() => {
              setMapMode(MAP_MODES.LIVE);
              setReportMode(false);
              setCityInitiatedMode(false);
              closeMapPopover();
            }}
            style={mapModeButtonStyle(mapMode === MAP_MODES.LIVE)}
          >
            Right now
          </button>
        </div>

        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          {mapMode === MAP_MODES.CIVIC
            ? "The map reflects both community concerns and city initiated work."
            : "This view highlights where people are noticing activity right now."}
        </div>

        {persona === PERSONAS.PUBLIC && (
          <div
            style={{
              marginTop: 12,
              background: "#f8fbfe",
              border: "1px solid #e5edf6",
              borderRadius: 14,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
              color: "#4b657d",
            }}
          >
            {mapMode === MAP_MODES.CIVIC
              ? "The City appreciates residents sharing what they are seeing. Response timing depends on priority, safety, staffing, and budget."
              : "This view shows where activity is happening right now based on community signals."}
          </div>
        )}

        <div
          ref={mapRef}
          onClick={handleMapClick}
          style={{
            height: 560,
            borderRadius: 20,
            position: "relative",
            cursor:
              reportMode && mapMode === MAP_MODES.CIVIC
                ? "crosshair"
                : cityInitiatedMode && mapMode === MAP_MODES.CIVIC
                ? "crosshair"
                : "default",
            background:
              "linear-gradient(180deg, #cfe6fb 0%, #deefff 35%, #ecf6e6 35%, #f3f8ff 100%)",
            border:
              (reportMode || cityInitiatedMode) && mapMode === MAP_MODES.CIVIC
                ? "2px solid #0f6ab7"
                : "1px solid #cfe0f0",
            boxShadow: "0 10px 30px rgba(15,106,183,0.08)",
            overflow: "hidden",
            marginTop: 14,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "0%",
              top: "0%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "8%",
              top: "10%",
              width: "18%",
              height: "18%",
              borderRadius: 18,
              background: "rgba(76, 175, 80, 0.12)",
              border: "1px solid rgba(76, 175, 80, 0.25)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "35%",
              top: "38%",
              width: "24%",
              height: "22%",
              borderRadius: 18,
              background: "rgba(255, 193, 7, 0.12)",
              border: "1px solid rgba(255, 193, 7, 0.25)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "66%",
              top: "48%",
              width: "22%",
              height: "22%",
              borderRadius: 18,
              background: "rgba(33, 150, 243, 0.12)",
              border: "1px solid rgba(33, 150, 243, 0.25)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "0%",
              top: "48%",
              width: "100%",
              height: 8,
              background: "rgba(120, 144, 156, 0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "49%",
              top: "0%",
              width: 8,
              height: "100%",
              background: "rgba(120, 144, 156, 0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "18%",
              top: "0%",
              width: 6,
              height: "100%",
              background: "rgba(120, 144, 156, 0.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "74%",
              top: "0%",
              width: 6,
              height: "100%",
              background: "rgba(120, 144, 156, 0.2)",
            }}
          />

          {reportMode && mapMode === MAP_MODES.CIVIC && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#0f6ab7",
                color: "white",
                padding: "6px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                zIndex: 3,
              }}
            >
              Tap map to report
            </div>
          )}

          {cityInitiatedMode && mapMode === MAP_MODES.CIVIC && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#0f6ab7",
                color: "white",
                padding: "6px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                zIndex: 3,
              }}
            >
              Tap map to place city initiated pin
            </div>
          )}

          {[
            { label: "North Hastings", left: "10%", top: "8%" },
            { label: "Downtown", left: "43%", top: "42%" },
            { label: "Parks Corridor", left: "68%", top: "18%" },
            { label: "Utilities East", left: "72%", top: "62%" },
          ].map((label) => (
            <div
              key={label.label}
              style={{
                position: "absolute",
                left: label.left,
                top: label.top,
                padding: "6px 10px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #d9e6f3",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                color: "#28537b",
              }}
            >
              {label.label}
            </div>
          ))}

          {mapItems.map((item) => {
            const isSelected = selectedItemId === item.id;

            let pinColor = "#e53935";
            let pulse = false;
            let scale = 1;

            if (mapMode === MAP_MODES.CIVIC && item.type === "city_activity") {
              pinColor = "#0f6ab7";
            }

            if (item.escalated || item.status === "Escalated") {
              pinColor = "#ff9800";
              pulse = true;
              scale = 1.2;
            }

            if (item.status === "In Progress") {
              pulse = true;
              scale = 1.1;
            }

            if (mapMode === MAP_MODES.LIVE) {
              pinColor = "#0f6ab7";
              pulse = item.affectedCount >= 3;
              scale = item.affectedCount >= 3 ? 1.2 : 1;
            }

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemId(item.id);
                }}
                title={item.title}
                style={{
                  position: "absolute",
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: "translate(-50%, -100%)",
                  cursor: "pointer",
                  zIndex: isSelected ? 6 : 4,
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
                    boxShadow: isSelected
                      ? "0 0 0 6px rgba(23,61,106,0.25)"
                      : "0 0 0 4px rgba(0,0,0,0.08)",
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
                  {CATEGORY_TO_ICON[item.category] || "📌"}
                </div>
              </div>
            );
          })}

          {renderMapPopover(selectedItem)}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {persona === PERSONAS.PUBLIC && mapMode === MAP_MODES.CIVIC && (
            <button
              onClick={() => {
                setActiveTab(TABS.REPORT);
                setReportMode(true);
                setCityInitiatedMode(false);
                closeMapPopover();
              }}
              style={primaryButtonStyle()}
            >
              Report
            </button>
          )}

          {persona === PERSONAS.ADMIN && mapMode === MAP_MODES.CIVIC && (
            <button
              onClick={() => {
                setActiveTab(TABS.HOME);
                setCityInitiatedMode(true);
                setReportMode(false);
                closeMapPopover();
              }}
              style={secondaryButtonStyle()}
            >
              Add city initiated pin
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderRightRailCard() {
    if (selectedItem) {
      return (
        <div style={panelStyle()}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
            Selected issue
          </div>
          <div style={{ fontWeight: 800 }}>{selectedItem.title}</div>
          <div style={{ marginTop: 8, color: "#5e778f", lineHeight: 1.5 }}>
            Tap anywhere on the map background to close the pop-up card.
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div
              style={{
                background: "#f8fbfe",
                border: "1px solid #e5edf6",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#5b7590", marginBottom: 4 }}>
                Status
              </div>
              <div style={{ fontWeight: 800 }}>{selectedItem.publicStatus}</div>
            </div>

            <div
              style={{
                background: "#f8fbfe",
                border: "1px solid #e5edf6",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#5b7590", marginBottom: 4 }}>
                Community signals
              </div>
              <div style={{ fontWeight: 800 }}>{selectedItem.affectedCount}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Map guide
        </div>
        <div style={{ color: "#5e778f", lineHeight: 1.55 }}>
          Tap a pin on the map to see the full issue card rise from that
          location. The map now does the main storytelling.
        </div>
      </div>
    );
  }

  function renderReportSidebar() {
    return (
      <div style={panelStyle(true)}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Report an issue
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          Report flow: tap Report, tap the map, pin drops, then the report form opens.
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#355a7f",
                marginBottom: 6,
              }}
            >
              Public categories
            </div>
            <div style={listItemStyle()}>{PUBLIC_CATEGORIES.join(" • ")}</div>
          </div>

          <button
            style={primaryButtonStyle()}
            onClick={() => {
              setActiveTab(TABS.HOME);
              setReportMode(true);
              setCityInitiatedMode(false);
              closeMapPopover();
            }}
          >
            Tap map to place report
          </button>
        </div>
      </div>
    );
  }

  function renderGeneratedReportPreview() {
    if (!generatedReport.title) return null;

    return (
      <div
        style={{
          marginTop: 14,
          background: "#ffffff",
          border: "1px solid #dbe6f1",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #e5edf6",
            background: "#f8fbfe",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>{generatedReport.title}</div>
          <div style={{ color: "#6b8399", fontSize: 12, marginTop: 4 }}>
            {generatedReport.subtitle}
          </div>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 14 }}>
          {generatedReport.sections.map((section) => (
            <div
              key={section.heading}
              style={{
                background: "#f8fbfe",
                border: "1px solid #e5edf6",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                {section.heading}
              </div>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  color: "#344c63",
                  lineHeight: 1.55,
                }}
              >
                {section.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderGenerateReportPanel() {
    return (
      <div style={listItemStyle()}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Generate report</div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Report type
            </div>
            <select
              value={reportBuilder.type}
              onChange={(e) =>
                setReportBuilder((prev) => ({ ...prev, type: e.target.value }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Scope
            </div>
            <select
              value={reportBuilder.scope}
              onChange={(e) =>
                setReportBuilder((prev) => ({ ...prev, scope: e.target.value }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              <option value="Citywide">Citywide</option>
              <option value="Selected issue only">Selected issue only</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Department
            </div>
            <select
              value={reportBuilder.department}
              onChange={(e) =>
                setReportBuilder((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              <option value="All departments">All departments</option>
              {ROUTING_DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Timeframe
            </div>
            <select
              value={reportBuilder.timeframe}
              onChange={(e) =>
                setReportBuilder((prev) => ({
                  ...prev,
                  timeframe: e.target.value,
                }))
              }
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #d7e4f0",
                padding: "12px 12px",
                fontSize: 14,
                background: "white",
              }}
            >
              {REPORT_TIMEFRAMES.map((timeframe) => (
                <option key={timeframe} value={timeframe}>
                  {timeframe}
                </option>
              ))}
            </select>
          </div>

          <button style={primaryButtonStyle()} onClick={handleGenerateReport}>
            Generate report
          </button>
        </div>

        {renderGeneratedReportPreview()}
      </div>
    );
  }

  function renderCityCommandCenter() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          City decisions
        </div>
        <div
          style={{
            color: "#63809b",
            fontSize: 13,
            lineHeight: 1.45,
            marginBottom: 14,
          }}
        >
          Review citywide concerns, make routing decisions, generate reports,
          and add city initiated pins to the map.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800 }}>Issue</div>

            {selectedItem ? (
              <div style={listItemStyle()}>
                <div style={{ fontWeight: 800 }}>{selectedItem.title}</div>
                <div style={{ marginTop: 8 }}>{selectedItem.description}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                  {selectedItem.locationLabel} • {selectedItem.assignedDepartments.join(", ")}
                </div>
                <div style={{ marginTop: 10 }}>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "#67819a" }}>
                  AI suggested: {selectedItem.recommendedDepartment}
                </div>
                {selectedItem.reviewReminderAt && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                    Hidden from City queue until {formatShortDate(selectedItem.reviewReminderAt)}
                  </div>
                )}
                {selectedItem && isOverdueForCityReview(selectedItem) && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#a43d3d",
                    }}
                  >
                    Returned to City queue due to no department action in time.
                  </div>
                )}
              </div>
            ) : (
              <div style={listItemStyle()}>
                Select an item from the queue or tap a map pin.
              </div>
            )}

            <div style={{ fontWeight: 800, marginTop: 6 }}>Queue</div>

            {visibleCityQueueItems.map((item) => {
              const overdue = isOverdueForCityReview(item);

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    ...listItemStyle(selectedItemId === item.id),
                    textAlign: "left",
                    cursor: "pointer",
                    border: overdue
                      ? "1px solid #f2b8b5"
                      : selectedItemId === item.id
                      ? "1px solid #bcd8f6"
                      : "1px solid #e5edf6",
                    background: overdue
                      ? "#fff5f5"
                      : selectedItemId === item.id
                      ? "#eef6ff"
                      : "#f8fbfe",
                  }}
                >
                  <div style={{ fontWeight: 700, color: overdue ? "#a43d3d" : "#15304a" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#67819a", marginTop: 4 }}>
                    {item.assignedDepartments.join(", ")} • {item.publicStatus}
                  </div>
                  {overdue && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#a43d3d",
                      }}
                    >
                      Needs City follow-up
                    </div>
                  )}
                </button>
              );
            })}

            {visibleCityQueueItems.length === 0 && (
              <div style={listItemStyle()}>
                No issues are currently active in the City queue.
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800 }}>What to do</div>

            {selectedItem ? (
              <div style={listItemStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    type="button"
                    disabled={selectedItem.status === "Routed"}
                    onClick={() => {
                      setSelectedCityAction("confirm_routing");
                      if (selectedItem.status !== "Routed") {
                        applyCommandAction("confirm_routing");
                      }
                    }}
                    style={actionButtonStyle(
                      selectedCityAction === "confirm_routing",
                      selectedItem.status === "Routed"
                    )}
                  >
                    Confirm route
                  </button>

                  <button
                    type="button"
                    disabled={selectedItem.status === "Routed"}
                    onClick={() => {
                      if (selectedItem.status === "Routed") return;
                      setSelectedCityAction(
                        selectedCityAction === "reassign" ? "" : "reassign"
                      );
                    }}
                    style={actionButtonStyle(
                      selectedCityAction === "reassign",
                      selectedItem.status === "Routed"
                    )}
                  >
                    Send elsewhere
                  </button>

                  {selectedCityAction === "reassign" &&
                    selectedItem.status !== "Routed" && (
                      <div
                        style={{
                          display: "grid",
                          gap: 8,
                          padding: 10,
                          borderRadius: 12,
                          background: "#f8fbfe",
                          border: "1px solid #e5edf6",
                        }}
                      >
                        <select
                          value={commandForm.reassignDepartment}
                          onChange={(e) =>
                            updateCommandForm("reassignDepartment", e.target.value)
                          }
                          style={{
                            width: "100%",
                            borderRadius: 12,
                            border: "1px solid #d7e4f0",
                            padding: "12px 12px",
                            fontSize: 14,
                            background: "white",
                          }}
                        >
                          {ROUTING_DEPARTMENTS.map((department) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => applyCommandAction("reassign")}
                          style={primaryButtonStyle()}
                        >
                          Confirm reassignment
                        </button>
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCityAction("escalate");
                      applyCommandAction("escalate");
                    }}
                    style={actionButtonStyle(selectedCityAction === "escalate")}
                  >
                    Mark priority
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCityAction(
                        selectedCityAction === "multi_department"
                          ? ""
                          : "multi_department"
                      );
                    }}
                    style={actionButtonStyle(
                      selectedCityAction === "multi_department"
                    )}
                  >
                    Notify more teams
                  </button>

                  {selectedCityAction === "multi_department" && (
                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                        padding: 10,
                        borderRadius: 12,
                        background: "#f8fbfe",
                        border: "1px solid #e5edf6",
                      }}
                    >
                      <div style={{ display: "grid", gap: 8 }}>
                        {ROUTING_DEPARTMENTS.map((department) => (
                          <label
                            key={department}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              fontSize: 13,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={commandForm.multiDepartments.includes(department)}
                              onChange={() => toggleMultiDepartment(department)}
                            />
                            {department}
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => applyCommandAction("multi_department")}
                        style={primaryButtonStyle()}
                      >
                        Confirm departments
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCityAction(
                        selectedCityAction === "review_later" ? "" : "review_later"
                      );
                    }}
                    style={actionButtonStyle(selectedCityAction === "review_later")}
                  >
                    Review later
                  </button>

                  {selectedCityAction === "review_later" && (
                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                        padding: 10,
                        borderRadius: 12,
                        background: "#f8fbfe",
                        border: "1px solid #e5edf6",
                      }}
                    >
                      <select
                        value={remindLaterHours}
                        onChange={(e) => setRemindLaterHours(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          border: "1px solid #d7e4f0",
                          padding: "12px 12px",
                          fontSize: 14,
                          background: "white",
                        }}
                      >
                        <option value="24">24 hours</option>
                        <option value="168">7 days</option>
                        <option value="240">10 days</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => applyRemindLater(remindLaterHours)}
                        style={primaryButtonStyle()}
                      >
                        Set reminder
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#355a7f",
                      marginBottom: 6,
                    }}
                  >
                    Special instructions
                  </div>
                  <TextareaWithMic
                    value={commandForm.specialInstructions}
                    onChange={(e) =>
                      updateCommandForm("specialInstructions", e.target.value)
                    }
                    placeholder="Always-visible internal note or direction."
                    listening={listeningField === "city-special-instructions"}
                    onMicClick={() =>
                      startVoiceInput(
                        "city-special-instructions",
                        () => commandForm.specialInstructions,
                        (nextValue) =>
                          updateCommandForm("specialInstructions", nextValue)
                      )
                    }
                  />
                </div>
              </div>
            ) : (
              <div style={listItemStyle()}>Select an item to take action.</div>
            )}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800 }}>Insights</div>

            {selectedItem && (
              <>
                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Budget</div>
                  <div>Fund: {selectedItem.fund}</div>
                  <div style={{ marginTop: 8 }}>
                    Estimated impact: {formatMoney(estimateCost(selectedItem.category))}
                  </div>
                </div>

                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>
                    Issue snapshot
                  </div>
                  <div>Public status: {selectedItem.publicStatus}</div>
                  <div style={{ marginTop: 6 }}>
                    Updated: {formatShortDate(selectedItem.updatedAt)}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                    Community signals: {selectedItem.affectedCount}
                  </div>
                </div>
              </>
            )}

            {renderGenerateReportPanel()}

            <div style={listItemStyle()}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Notifications</div>
              {notifications.length ? (
                notifications.slice(0, 5).map((note) => (
                  <div key={note.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13 }}>{note.message}</div>
                    <div style={{ fontSize: 11, color: "#67819a", marginTop: 4 }}>
                      {note.department} • {note.severity}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: "#67819a" }}>
                  No notifications yet.
                </div>
              )}
            </div>

            <div style={listItemStyle()}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>City signals</div>
              {signals.map((signal) => (
                <div key={signal.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13 }}>{signal.text}</div>
                  <div style={{ fontSize: 11, color: "#67819a", marginTop: 4 }}>
                    {signal.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDepartmentOperations() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Department work
        </div>
        <div
          style={{
            color: "#63809b",
            fontSize: 13,
            lineHeight: 1.45,
            marginBottom: 14,
          }}
        >
          Review assigned work, update progress, and keep the public status moving.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800 }}>Issue</div>

            {selectedItem ? (
              <div style={listItemStyle()}>
                <div style={{ fontWeight: 800 }}>{selectedItem.title}</div>
                <div style={{ marginTop: 8 }}>{selectedItem.description}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                  {selectedItem.locationLabel} • {selectedItem.assignedDepartments.join(", ")}
                </div>
                <div style={{ marginTop: 10 }}>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>
            ) : (
              <div style={listItemStyle()}>Select an item from the queue.</div>
            )}

            <div style={{ fontWeight: 800, marginTop: 6 }}>Queue</div>

            {visibleDepartmentQueueItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                style={{
                  ...listItemStyle(selectedItemId === item.id),
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#67819a", marginTop: 4 }}>
                  {item.assignedDepartments.join(", ")} • {item.publicStatus}
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800 }}>Quick actions</div>

            {selectedItem ? (
              <div style={listItemStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    style={primaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("Routed")}
                  >
                    Accept work
                  </button>
                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("In Progress")}
                  >
                    Working on it
                  </button>
                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("Monitoring")}
                  >
                    Watching it
                  </button>
                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("Resolved")}
                  >
                    Done
                  </button>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#355a7f",
                      marginBottom: 6,
                    }}
                  >
                    Field notes
                  </div>
                  <TextareaWithMic
                    value={commandForm.specialInstructions}
                    onChange={(e) =>
                      updateCommandForm("specialInstructions", e.target.value)
                    }
                    placeholder="Operational note or department instruction."
                    listening={listeningField === "department-special-instructions"}
                    onMicClick={() =>
                      startVoiceInput(
                        "department-special-instructions",
                        () => commandForm.specialInstructions,
                        (nextValue) =>
                          updateCommandForm("specialInstructions", nextValue)
                      )
                    }
                  />
                </div>
              </div>
            ) : (
              <div style={listItemStyle()}>Select an item to update.</div>
            )}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800 }}>Insights</div>

            {selectedItem && (
              <>
                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Budget</div>
                  <div>Fund: {selectedItem.fund}</div>
                  <div style={{ marginTop: 8 }}>
                    Estimated impact: {formatMoney(estimateCost(selectedItem.category))}
                  </div>
                </div>

                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>
                    Work snapshot
                  </div>
                  <div>Public status: {selectedItem.publicStatus}</div>
                  <div style={{ marginTop: 6 }}>
                    Updated: {formatShortDate(selectedItem.updatedAt)}
                  </div>
                </div>

                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>
                    Department snapshot
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Assigned: {selectedItem.assignedDepartments.join(", ")}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#67819a" }}>
                    Community signals: {selectedItem.affectedCount}
                  </div>
                </div>
              </>
            )}

            <div style={listItemStyle()}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Notifications</div>
              {notifications.length ? (
                notifications.slice(0, 5).map((note) => (
                  <div key={note.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13 }}>{note.message}</div>
                    <div style={{ fontSize: 11, color: "#67819a", marginTop: 4 }}>
                      {note.department} • {note.severity}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: "#67819a" }}>
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderReportModal() {
    if (!showReportModal) return null;

    return (
      <Modal onClose={closeReportModal} title="New community report">
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#355a7f",
              marginBottom: 6,
            }}
          >
            What’s happening?
          </div>
          <TextareaWithMic
            value={reportForm.description}
            onChange={(e) =>
              setReportForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe the issue in your own words."
            listening={listeningField === "report-description"}
            onMicClick={() =>
              startVoiceInput(
                "report-description",
                () => reportForm.description,
                (nextValue) =>
                  setReportForm((prev) => ({ ...prev, description: nextValue }))
              )
            }
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#355a7f",
              marginBottom: 6,
            }}
          >
            Category
          </div>
          <select
            value={reportForm.category}
            onChange={(e) =>
              setReportForm((prev) => ({
                ...prev,
                category: e.target.value,
                categoryTouched: true,
              }))
            }
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid #d7e4f0",
              padding: "12px 12px",
              fontSize: 14,
              background: "white",
            }}
          >
            {PUBLIC_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 12, color: "#6b8399", marginBottom: 12 }}>
          AI suggested a category based on what you entered. Wrong category? Choose another.
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={primaryButtonStyle()} onClick={submitReport}>
            Submit report
          </button>
          <button style={secondaryButtonStyle()} onClick={closeReportModal}>
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  function renderThankYouModal() {
    if (!showThankYou) return null;

    return (
      <Modal onClose={() => setShowThankYou(false)} title="Report submitted">
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
          Thanks for sharing what you’re seeing.
        </div>

        <div style={{ color: "#5e778f", lineHeight: 1.5 }}>
          You’ll receive updates as the city reviews and responds.
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            style={primaryButtonStyle()}
            onClick={() => {
              setShowThankYou(false);
              setActiveTab(TABS.HOME);
            }}
          >
            Back to map
          </button>
        </div>
      </Modal>
    );
  }

  function renderCityInitiatedModal() {
    if (!showCityInitiatedModal) return null;

    return (
      <Modal onClose={closeCityInitiatedModal} title="New city initiated pin">
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#355a7f",
              marginBottom: 6,
            }}
          >
            Title
          </div>
          <TextInputWithMic
            value={cityInitiatedForm.title}
            onChange={(e) =>
              setCityInitiatedForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter a title."
            listening={listeningField === "city-initiated-title"}
            onMicClick={() =>
              startVoiceInput(
                "city-initiated-title",
                () => cityInitiatedForm.title,
                (nextValue) =>
                  setCityInitiatedForm((prev) => ({
                    ...prev,
                    title: nextValue,
                  }))
              )
            }
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#355a7f",
              marginBottom: 6,
            }}
          >
            Description
          </div>
          <TextareaWithMic
            value={cityInitiatedForm.description}
            onChange={(e) =>
              setCityInitiatedForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe the city initiated work."
            listening={listeningField === "city-initiated-description"}
            onMicClick={() =>
              startVoiceInput(
                "city-initiated-description",
                () => cityInitiatedForm.description,
                (nextValue) =>
                  setCityInitiatedForm((prev) => ({
                    ...prev,
                    description: nextValue,
                  }))
              )
            }
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#355a7f",
              marginBottom: 6,
            }}
          >
            Category
          </div>
          <select
            value={cityInitiatedForm.category}
            onChange={(e) =>
              setCityInitiatedForm((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid #d7e4f0",
              padding: "12px 12px",
              fontSize: 14,
              background: "white",
            }}
          >
            {PUBLIC_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#355a7f",
              marginBottom: 6,
            }}
          >
            Special instructions
          </div>
          <TextareaWithMic
            value={cityInitiatedForm.specialInstructions}
            onChange={(e) =>
              setCityInitiatedForm((prev) => ({
                ...prev,
                specialInstructions: e.target.value,
              }))
            }
            placeholder="Internal note or project direction."
            listening={listeningField === "city-initiated-special-instructions"}
            onMicClick={() =>
              startVoiceInput(
                "city-initiated-special-instructions",
                () => cityInitiatedForm.specialInstructions,
                (nextValue) =>
                  setCityInitiatedForm((prev) => ({
                    ...prev,
                    specialInstructions: nextValue,
                  }))
              )
            }
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={primaryButtonStyle()} onClick={submitCityInitiatedPin}>
            Save city initiated pin
          </button>
          <button style={secondaryButtonStyle()} onClick={closeCityInitiatedModal}>
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  function renderBottomNav() {
    let itemsForNav = [];

    if (persona === PERSONAS.PUBLIC) {
      itemsForNav = [
        { key: TABS.HOME, label: "Home" },
        { key: TABS.REPORT, label: "Report" },
      ];
    }

    if (persona === PERSONAS.ADMIN) {
      itemsForNav = [
        { key: TABS.HOME, label: "Map" },
        { key: TABS.CITY, label: "City" },
      ];
    }

    if (persona === PERSONAS.DEPARTMENT) {
      itemsForNav = [
        { key: TABS.HOME, label: "Map" },
        { key: TABS.DEPARTMENT, label: "Dept" },
      ];
    }

    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #dfe8f1",
          display: "grid",
          gridTemplateColumns: `repeat(${itemsForNav.length}, 1fr)`,
          gap: 8,
          padding: "10px 12px max(10px, env(safe-area-inset-bottom))",
          zIndex: 40,
        }}
      >
        {itemsForNav.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveTab(item.key);
              setReportMode(item.key === TABS.REPORT);
              if (item.key !== TABS.REPORT) setReportMode(false);
              if (item.key !== TABS.HOME) closeMapPopover();
            }}
            style={{
              border: "none",
              background: activeTab === item.key ? "#eef6ff" : "transparent",
              color: activeTab === item.key ? "#0f6ab7" : "#54728f",
              borderRadius: 14,
              padding: "10px 8px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#15304a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        paddingBottom: 88,
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(0.6);
              opacity: 0.4;
            }
            70% {
              transform: scale(1.6);
              opacity: 0;
            }
            100% {
              transform: scale(0.6);
              opacity: 0;
            }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: 16,
        }}
      >
        {renderTopBar()}
        {renderModeToggle()}
        {renderInsightBar()}

        {activeTab === TABS.HOME && (
          <div
            style={
              isMobile
                ? { display: "grid", gap: 16 }
                : {
                    display: "grid",
                    gridTemplateColumns: "1.45fr 0.75fr",
                    gap: 16,
                  }
            }
          >
            <div>{renderMap()}</div>
            <div>{renderRightRailCard()}</div>
          </div>
        )}

        {activeTab === TABS.REPORT && persona === PERSONAS.PUBLIC && (
          <div
            style={
              isMobile
                ? { display: "grid", gap: 16 }
                : {
                    display: "grid",
                    gridTemplateColumns: "1.4fr 0.85fr",
                    gap: 16,
                  }
            }
          >
            <div>{renderMap()}</div>
            <div>{renderReportSidebar()}</div>
          </div>
        )}

        {activeTab === TABS.CITY &&
          persona === PERSONAS.ADMIN &&
          renderCityCommandCenter()}

        {activeTab === TABS.DEPARTMENT &&
          persona === PERSONAS.DEPARTMENT &&
          renderDepartmentOperations()}
      </div>

      {renderReportModal()}
      {renderThankYouModal()}
      {renderCityInitiatedModal()}
      {renderBottomNav()}
    </div>
  );
}