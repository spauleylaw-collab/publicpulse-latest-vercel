import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   VERSION
========================= */

const BUILD_VERSION = "restore-full-ui-with-pin-upgrade-1";

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
    summary: "Large pothole causing traffic issues",
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
    updatedAt: new Date().toISOString(),
    affectedCount: 4,
    affectedByUser: false,
    fund: "Traffic Fund",
    source: "Resident",
  },
  {
    id: "item-4",
    type: "city_activity",
    title: "Planned park maintenance",
    summary: "City crews will perform scheduled maintenance in this park area.",
    description:
      "Parks staff will be completing scheduled maintenance and cleanup work in this park area.",
    category: "Parks",
    recommendedDepartment: "Parks",
    assignedDepartments: ["Parks"],
    confidence: 100,
    status: "Routed",
    publicStatus: "Planned city work",
    escalated: false,
    specialInstructions: "Routine spring maintenance.",
    x: 72,
    y: 28,
    locationLabel: "North park zone",
    updatedAt: new Date().toISOString(),
    affectedCount: 0,
    affectedByUser: false,
    fund: "Parks / Keno",
    source: "City Admin",
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
    updatedAt: new Date().toISOString(),
    affectedCount: 1,
    affectedByUser: false,
    fund: "Utility Fund",
    source: "Department",
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
  if (type === "city_activity" && status === "Routed") return "Planned city work";
  if (status === "Resolved") return "Resolved";
  if (status === "In Progress") return "City responding";
  if (status === "Monitoring") return "Monitoring";
  if (escalated) return "Priority review";
  if (status === "Routed") return "Routed to department";
  return "Under Review";
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
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

function getResidentStatusExplanation(status, publicStatus) {
  if (publicStatus === "Planned city work") {
    return "This location is tied to planned city work. It may already be scheduled or in preparation.";
  }

  switch (status) {
    case "Under Review":
      return "The city has received this issue and is reviewing location, severity, and routing.";
    case "Routed":
      return "This issue has been sent to the department best positioned to respond.";
    case "In Progress":
      return "City staff are actively working on this issue or preparing the response.";
    case "Monitoring":
      return "The city is watching this issue and may wait for more information, timing, or related work before acting.";
    case "Escalated":
      return "This issue has been marked as a higher-priority concern for additional review or response.";
    case "Resolved":
      return "The city has marked this issue as resolved. If conditions change, residents can report it again.";
    default:
      return "The city is tracking this issue and will update the public status as it moves forward.";
  }
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
   SHARED UI
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

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [budgetData] = useState(INITIAL_BUDGETS);
  const [signals] = useState(INITIAL_SIGNALS);
  const [notifications, setNotifications] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(INITIAL_ITEMS[0].id);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [listeningField, setListeningField] = useState(null);
  const [remindLaterHours, setRemindLaterHours] = useState("24");

  const [reportMode, setReportMode] = useState(false);
  const [reportPin, setReportPin] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [reportForm, setReportForm] = useState({
    description: "",
    category: "",
    specialInstructions: "",
  });

  const [cityActivityMode, setCityActivityMode] = useState(false);
  const [cityActivityPin, setCityActivityPin] = useState(null);
  const [showCityActivityModal, setShowCityActivityModal] = useState(false);
  const [cityActivityForm, setCityActivityForm] = useState({
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

  const mapItems = useMemo(
    () => items.filter((item) => item.x != null && item.y != null),
    [items]
  );

  const featuredItems = useMemo(
    () => items.filter((item) => item.type === "community_issue" || item.type === "city_activity"),
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

  const budgetInsights = useMemo(() => {
    return budgetData.map((fund) => {
      const remaining = fund.budgeted - fund.spent;
      const usedPct = clamp((fund.spent / fund.budgeted) * 100, 0, 100);
      return { ...fund, remaining, usedPct };
    });
  }, [budgetData]);

  const summary = useMemo(() => {
    return {
      open: items.filter((item) => item.status !== "Resolved").length,
      escalated: items.filter((item) => item.escalated).length,
      cityActivity: items.filter((item) => item.type === "city_activity").length,
    };
  }, [items]);

  useEffect(() => {
    if (!featuredItems.length) return undefined;

    const timer = window.setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % featuredItems.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [featuredItems.length]);

  function startVoiceInput(fieldName, getValue, setValue) {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      window.alert("Microphone input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

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

  function handleMapClick(event) {
    if ((!reportMode && !cityActivityMode) || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 8, 94);

    if (reportMode) {
      setReportPin({ x, y });
      setShowReportModal(true);
    }

    if (cityActivityMode) {
      setCityActivityPin({ x, y });
      setShowCityActivityModal(true);
    }
  }

  function closeReportModal() {
    setShowReportModal(false);
    setReportMode(false);
    setReportPin(null);
    setReportForm({
      description: "",
      category: "",
      specialInstructions: "",
    });
  }

  function closeCityActivityModal() {
    setShowCityActivityModal(false);
    setCityActivityMode(false);
    setCityActivityPin(null);
    setCityActivityForm({
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
      specialInstructions: reportForm.specialInstructions,
      x: reportPin.x,
      y: reportPin.y,
      locationLabel: "Resident-selected location",
      updatedAt: new Date().toISOString(),
      affectedCount: 1,
      affectedByUser: true,
      fund: CATEGORY_TO_FUND[category],
      source: "Resident",
    };

    setItems((prev) => [nextItem, ...prev]);
    setSelectedItemId(nextItem.id);

    addNotification(
      `AI recommended ${recommendedDepartment} for a new community report.`,
      recommendedDepartment,
      confidence >= 85 ? "high" : "medium"
    );

    closeReportModal();
    setActiveTab(TABS.HOME);
  }

  function submitCityActivity() {
    if (!cityActivityPin || !cityActivityForm.title.trim() || !cityActivityForm.description.trim()) {
      return;
    }

    const category = cityActivityForm.category;
    const department = CATEGORY_TO_DEPARTMENT[category];

    const nextItem = {
      id: makeId("item"),
      type: "city_activity",
      title: cityActivityForm.title,
      summary: cityActivityForm.description,
      description: cityActivityForm.description,
      category,
      recommendedDepartment: department,
      assignedDepartments: [department],
      confidence: 100,
      status: "Routed",
      publicStatus: "Planned city work",
      escalated: false,
      specialInstructions: cityActivityForm.specialInstructions,
      x: cityActivityPin.x,
      y: cityActivityPin.y,
      locationLabel: "City-selected project location",
      updatedAt: new Date().toISOString(),
      affectedCount: 0,
      affectedByUser: false,
      fund: CATEGORY_TO_FUND[category],
      source: "City Admin",
    };

    setItems((prev) => [nextItem, ...prev]);
    setSelectedItemId(nextItem.id);

    addNotification(
      `New city activity pin created for ${department}.`,
      department,
      "medium"
    );

    closeCityActivityModal();
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
    const specialInstructions = commandForm.specialInstructions.trim();

    if (action === "confirm_routing") {
      nextStatus = "Routed";
      nextDepartments = [selectedItem.recommendedDepartment];
    }

    if (action === "reassign") {
      nextStatus = "Routed";
      nextDepartments = [commandForm.reassignDepartment];
    }

    if (action === "escalate") {
      nextEscalated = true;
      nextStatus = "Escalated";
    }

    if (action === "multi_department") {
      const picked = commandForm.multiDepartments.length
        ? commandForm.multiDepartments
        : [selectedItem.recommendedDepartment];
      nextDepartments = picked;
      nextStatus = "Routed";
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              assignedDepartments: nextDepartments,
              status: nextStatus,
              escalated: nextEscalated,
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
  }

  function applyDepartmentStatus(status) {
    if (!selectedItem) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status,
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
              reviewReminderAt: remindAt.toISOString(),
              specialInstructions:
                commandForm.specialInstructions.trim() || item.specialInstructions,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    addNotification(
      `${selectedItem.title} set for follow-up in ${hours} hours.`,
      selectedItem.assignedDepartments[0] || selectedItem.recommendedDepartment,
      "medium"
    );

    setCommandForm((prev) => ({
      ...prev,
      specialInstructions: "",
    }));
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
            `${summary.escalated} escalated`,
            `${summary.cityActivity} city activity pins`,
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
              setCityActivityMode(false);
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

  function renderMap() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Live map
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          The map reflects both community concerns and city activity.
        </div>

        <div
          ref={mapRef}
          onClick={handleMapClick}
          style={{
            height: 520,
            borderRadius: 20,
            position: "relative",
            cursor: reportMode || cityActivityMode ? "crosshair" : "default",
            background:
              "linear-gradient(180deg, #cfe6fb 0%, #deefff 35%, #ecf6e6 35%, #f3f8ff 100%)",
            border:
              reportMode || cityActivityMode
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

          {reportMode && (
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

          {cityActivityMode && (
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
              Tap map to place city activity
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
                  zIndex: isSelected ? 5 : 4,
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

          {selectedItem && (
            <div
              style={{
                position: "absolute",
                left: `${selectedItem.x}%`,
                top: `calc(${selectedItem.y}% + 18px)`,
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #d7e4f0",
                borderRadius: 12,
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "#234763",
                pointerEvents: "none",
                boxShadow: "0 8px 18px rgba(15,23,42,0.1)",
                maxWidth: 180,
                textAlign: "center",
              }}
            >
              {selectedItem.title}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {persona === PERSONAS.PUBLIC && (
            <button
              onClick={() => {
                setActiveTab(TABS.REPORT);
                setReportMode(true);
                setCityActivityMode(false);
              }}
              style={primaryButtonStyle()}
            >
              Report
            </button>
          )}

          {persona === PERSONAS.ADMIN && (
            <button
              onClick={() => {
                setActiveTab(TABS.HOME);
                setCityActivityMode(true);
                setReportMode(false);
              }}
              style={secondaryButtonStyle()}
            >
              Add city activity
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderFeaturedCard() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          What’s going on in Hastings right now
        </div>

        {featuredItem ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {featuredItem.title}
                </div>
                <div style={{ fontSize: 13, color: "#67819a", marginTop: 4 }}>
                  {featuredItem.assignedDepartments[0]} • Updated{" "}
                  {formatShortDate(featuredItem.updatedAt)}
                </div>
              </div>
              <StatusBadge status={featuredItem.status} />
            </div>

            <div style={{ marginTop: 10, lineHeight: 1.45 }}>
              {featuredItem.summary}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, minmax(0, 1fr))",
                gap: 10,
                marginTop: 12,
              }}
            >
              {[
                ["Category", featuredItem.category],
                ["Department", featuredItem.assignedDepartments[0]],
                ["Public status", featuredItem.publicStatus],
                ["Residents affected", featuredItem.affectedCount],
                ["Confidence", `${featuredItem.confidence}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fbfe",
                    border: "1px solid #e5edf6",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#5b7590", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: "#63809b" }}>No active items to feature.</div>
        )}
      </div>
    );
  }

  function renderSelectedMapItem() {
    if (!selectedItem) return null;

    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Selected map item
        </div>

        <div style={{ fontWeight: 800 }}>{selectedItem.title}</div>
        <div style={{ marginTop: 8 }}>{selectedItem.description}</div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusBadge status={selectedItem.status} />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: "#f4f7fb",
              border: "1px solid #dbe5ef",
              color: "#496178",
            }}
          >
            {selectedItem.assignedDepartments.join(", ")}
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "#67819a" }}>
          {selectedItem.locationLabel} • Updated {formatShortDate(selectedItem.updatedAt)}
        </div>

        <div
          style={{
            marginTop: 14,
            background: "#f8fbfe",
            border: "1px solid #e5edf6",
            borderRadius: 14,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>What this means</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "#42586f" }}>
            {getResidentStatusExplanation(selectedItem.status, selectedItem.publicStatus)}
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <div
            style={{
              background: "#f8fbfe",
              border: "1px solid #e5edf6",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 12, color: "#5b7590", marginBottom: 4 }}>
              Public status
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {selectedItem.publicStatus}
            </div>
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
              Residents affected
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {selectedItem.affectedCount}
            </div>
          </div>
        </div>

        {selectedItem.type === "community_issue" && (
          <div style={{ marginTop: 14 }}>
            <button
              disabled={selectedItem.affectedByUser}
              onClick={() => markAffected(selectedItem.id)}
              style={{
                ...primaryButtonStyle(),
                opacity: selectedItem.affectedByUser ? 0.6 : 1,
                cursor: selectedItem.affectedByUser ? "default" : "pointer",
              }}
            >
              {selectedItem.affectedByUser
                ? "You’re marked as affected"
                : "I’m affected"}
            </button>

            <div style={{ marginTop: 8, fontSize: 13, color: "#67819a" }}>
              Residents affected: {selectedItem.affectedCount}
            </div>
          </div>
        )}
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
            <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
              Public categories
            </div>
            <div style={listItemStyle()}>
              {PUBLIC_CATEGORIES.join(" • ")}
            </div>
          </div>

          <button
            style={primaryButtonStyle()}
            onClick={() => {
              setActiveTab(TABS.HOME);
              setReportMode(true);
              setCityActivityMode(false);
            }}
          >
            Tap map to place report
          </button>
        </div>
      </div>
    );
  }

  function renderCityCommandCenter() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Command center
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45, marginBottom: 14 }}>
          City admin confirms routing, changes routing, escalates priorities, coordinates multiple departments, and places city activity pins.
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
                  AI recommended: {selectedItem.recommendedDepartment} • Confidence {selectedItem.confidence}%
                </div>
                {selectedItem.reviewReminderAt && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                    Reminder set for {formatShortDate(selectedItem.reviewReminderAt)}
                  </div>
                )}
              </div>
            ) : (
              <div style={listItemStyle()}>Select an item from the queue.</div>
            )}

            <div style={{ fontWeight: 800, marginTop: 6 }}>Queue</div>
            {items.map((item) => (
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
            <div style={{ fontWeight: 800 }}>Actions</div>

            {selectedItem ? (
              <div style={listItemStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    style={primaryButtonStyle()}
                    onClick={() => applyCommandAction("confirm_routing")}
                  >
                    Confirm Routing
                  </button>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
                      Reassign
                    </div>
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
                      style={{ ...secondaryButtonStyle(), marginTop: 8 }}
                      onClick={() => applyCommandAction("reassign")}
                    >
                      Reassign
                    </button>
                  </div>

                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyCommandAction("escalate")}
                  >
                    Escalate
                  </button>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
                      Multi-Department
                    </div>
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
                      style={{ ...secondaryButtonStyle(), marginTop: 8 }}
                      onClick={() => applyCommandAction("multi_department")}
                    >
                      Multi-Department
                    </button>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
                      Remind later
                    </div>
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
                      style={{ ...secondaryButtonStyle(), marginTop: 8 }}
                      onClick={() => applyRemindLater(remindLaterHours)}
                    >
                      Remind Later
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
                    Special Instructions
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
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Operational insight</div>
                  <div>Public status: {selectedItem.publicStatus}</div>
                  <div style={{ marginTop: 6 }}>
                    Updated: {formatShortDate(selectedItem.updatedAt)}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                    Residents affected: {selectedItem.affectedCount}
                  </div>
                </div>

                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Budget snapshot</div>
                  {budgetInsights.slice(0, 3).map((fund) => (
                    <div key={fund.fund} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fund.fund}</div>
                      <div style={{ fontSize: 12, color: "#67819a" }}>
                        {fund.usedPct.toFixed(0)}% used • {formatMoney(fund.remaining)} remaining
                      </div>
                    </div>
                  ))}
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
                <div style={{ fontSize: 13, color: "#67819a" }}>No notifications yet.</div>
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
    const departmentItems = selectedItem
      ? items.filter((item) =>
          item.assignedDepartments.includes(selectedItem.assignedDepartments[0])
        )
      : items;

    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Operations
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45, marginBottom: 14 }}>
          Department view for map awareness, assigned work, status updates, and operational notes.
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
            {departmentItems.map((item) => (
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
            <div style={{ fontWeight: 800 }}>Actions</div>

            {selectedItem ? (
              <div style={listItemStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    style={primaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("Routed")}
                  >
                    Confirm Routing
                  </button>
                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("In Progress")}
                  >
                    In Progress
                  </button>
                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("Monitoring")}
                  >
                    Monitoring
                  </button>
                  <button
                    style={secondaryButtonStyle()}
                    onClick={() => applyDepartmentStatus("Resolved")}
                  >
                    Resolved
                  </button>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
                    Special Instructions
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
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Operational insight</div>
                  <div>Public status: {selectedItem.publicStatus}</div>
                  <div style={{ marginTop: 6 }}>
                    Updated: {formatShortDate(selectedItem.updatedAt)}
                  </div>
                </div>

                <div style={listItemStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Department snapshot</div>
                  <div style={{ fontSize: 13 }}>
                    Assigned: {selectedItem.assignedDepartments.join(", ")}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#67819a" }}>
                    Residents affected: {selectedItem.affectedCount}
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
                <div style={{ fontSize: 13, color: "#67819a" }}>No notifications yet.</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
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

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
            Category
          </div>
          <select
            value={reportForm.category}
            onChange={(e) =>
              setReportForm((prev) => ({ ...prev, category: e.target.value }))
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
            <option value="">Let AI classify it</option>
            {PUBLIC_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
            Special Instructions
          </div>
          <TextareaWithMic
            value={reportForm.specialInstructions}
            onChange={(e) =>
              setReportForm((prev) => ({
                ...prev,
                specialInstructions: e.target.value,
              }))
            }
            placeholder="Anything city staff should know?"
            listening={listeningField === "report-special-instructions"}
            onMicClick={() =>
              startVoiceInput(
                "report-special-instructions",
                () => reportForm.specialInstructions,
                (nextValue) =>
                  setReportForm((prev) => ({
                    ...prev,
                    specialInstructions: nextValue,
                  }))
              )
            }
          />
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

  function renderCityActivityModal() {
    if (!showCityActivityModal) return null;

    return (
      <Modal onClose={closeCityActivityModal} title="New city activity pin">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
            Title
          </div>
          <TextInputWithMic
            value={cityActivityForm.title}
            onChange={(e) =>
              setCityActivityForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter a title."
            listening={listeningField === "city-activity-title"}
            onMicClick={() =>
              startVoiceInput(
                "city-activity-title",
                () => cityActivityForm.title,
                (nextValue) =>
                  setCityActivityForm((prev) => ({ ...prev, title: nextValue }))
              )
            }
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
            Description
          </div>
          <TextareaWithMic
            value={cityActivityForm.description}
            onChange={(e) =>
              setCityActivityForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe the city-led project or work."
            listening={listeningField === "city-activity-description"}
            onMicClick={() =>
              startVoiceInput(
                "city-activity-description",
                () => cityActivityForm.description,
                (nextValue) =>
                  setCityActivityForm((prev) => ({
                    ...prev,
                    description: nextValue,
                  }))
              )
            }
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
            Category
          </div>
          <select
            value={cityActivityForm.category}
            onChange={(e) =>
              setCityActivityForm((prev) => ({ ...prev, category: e.target.value }))
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#355a7f", marginBottom: 6 }}>
            Special Instructions
          </div>
          <TextareaWithMic
            value={cityActivityForm.specialInstructions}
            onChange={(e) =>
              setCityActivityForm((prev) => ({
                ...prev,
                specialInstructions: e.target.value,
              }))
            }
            placeholder="Internal note or project direction."
            listening={listeningField === "city-activity-special-instructions"}
            onMicClick={() =>
              startVoiceInput(
                "city-activity-special-instructions",
                () => cityActivityForm.specialInstructions,
                (nextValue) =>
                  setCityActivityForm((prev) => ({
                    ...prev,
                    specialInstructions: nextValue,
                  }))
              )
            }
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={primaryButtonStyle()} onClick={submitCityActivity}>
            Save city activity
          </button>
          <button style={secondaryButtonStyle()} onClick={closeCityActivityModal}>
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
        { key: TABS.CITY, label: "Command Center" },
      ];
    }

    if (persona === PERSONAS.DEPARTMENT) {
      itemsForNav = [
        { key: TABS.HOME, label: "Map" },
        { key: TABS.DEPARTMENT, label: "Operations" },
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

        {activeTab === TABS.HOME && (
          <div
            style={
              isMobile
                ? { display: "grid", gap: 16 }
                : { display: "grid", gridTemplateColumns: "1.4fr 0.85fr", gap: 16 }
            }
          >
            <div style={{ display: "grid", gap: 16 }}>
              {renderMap()}
              {renderFeaturedCard()}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {renderSelectedMapItem()}
            </div>
          </div>
        )}

        {activeTab === TABS.REPORT && persona === PERSONAS.PUBLIC && (
          <div
            style={
              isMobile
                ? { display: "grid", gap: 16 }
                : { display: "grid", gridTemplateColumns: "1.4fr 0.85fr", gap: 16 }
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
      {renderCityActivityModal()}
      {renderBottomNav()}
    </div>
  );
}