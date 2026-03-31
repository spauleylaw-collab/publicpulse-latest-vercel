import React, { useEffect, useMemo, useRef, useState } from "react";

const CITY_NAME = "Hastings";

const PERSONAS = {
  PUBLIC: "public",
  DEPARTMENT: "department",
  ADMIN: "admin",
};

const TABS = {
  HOME: "home",
  REPORT: "report",
  COMMAND: "command",
  BUDGET: "budget",
};

const DEPARTMENTS = [
  "Street Department",
  "Utilities",
  "Parks & Recreation",
  "Police",
  "Hastings Fire",
  "Code Enforcement",
  "Administration",
];

const CATEGORY_CONFIG = {
  roads: {
    label: "Roads",
    department: "Street Department",
    fund: "Street Fund",
    icon: "🛣️",
    estimatedCost: 1800,
    strategicTag: "Infrastructure reliability",
  },
  utilities: {
    label: "Utilities",
    department: "Utilities",
    fund: "Utility Fund",
    icon: "💧",
    estimatedCost: 4200,
    strategicTag: "Core service continuity",
  },
  parks: {
    label: "Parks",
    department: "Parks & Recreation",
    fund: "Parks / Keno",
    icon: "🌳",
    estimatedCost: 1200,
    strategicTag: "Quality of life",
  },
  safety: {
    label: "Public Safety",
    department: "Police",
    fund: "General Fund",
    icon: "🚓",
    estimatedCost: 2000,
    strategicTag: "Public safety",
  },
  fire: {
    label: "Fire",
    department: "Hastings Fire",
    fund: "General Fund",
    icon: "🚒",
    estimatedCost: 2000,
    strategicTag: "Public safety",
  },
  code: {
    label: "Code / Property",
    department: "Code Enforcement",
    fund: "General Fund",
    icon: "🏚️",
    estimatedCost: 800,
    strategicTag: "Neighborhood condition",
  },
  admin: {
    label: "Administration",
    department: "Administration",
    fund: "General Fund",
    icon: "🏛️",
    estimatedCost: 950,
    strategicTag: "Operational awareness",
  },
  other: {
    label: "Other",
    department: "Administration",
    fund: "General Fund",
    icon: "📌",
    estimatedCost: 950,
    strategicTag: "Operational awareness",
  },
};

const INITIAL_BUDGETS = [
  { fund: "General Fund", budgeted: 5600000, spent: 3985000 },
  { fund: "Street Fund", budgeted: 2400000, spent: 1735000 },
  { fund: "Utility Fund", budgeted: 4200000, spent: 2875000 },
  { fund: "Parks / Keno", budgeted: 1450000, spent: 910000 },
];

const INITIAL_FEED = [
  {
    id: "feed-1",
    source: "City of Hastings Facebook",
    text: "Road work expected near Burlington and 3rd this week. Please use caution.",
    timestamp: "2026-03-31T08:30:00",
  },
  {
    id: "feed-2",
    source: "Hastings Utilities Department Facebook",
    text: "Water main break reported near 7th and Lincoln. Crews are responding.",
    timestamp: "2026-03-31T09:10:00",
  },
  {
    id: "feed-3",
    source: "Hastings Parks & Recreation Facebook",
    text: "Mowing schedule and spring cleanup activities continue across city parks.",
    timestamp: "2026-03-31T10:00:00",
  },
  {
    id: "feed-4",
    source: "City of Hastings Facebook",
    text: "City Council meeting tonight at City Hall.",
    timestamp: "2026-03-31T11:15:00",
  },
];

const INITIAL_ISSUES = [
  {
    id: "issue-1",
    title: "Pothole cluster reported",
    description: "Multiple potholes causing rough driving conditions.",
    x: 28,
    y: 43,
    category: "roads",
    department: "Street Department",
    fund: "Street Fund",
    status: "Under Review",
    source: "Resident",
    confidence: 72,
    urgency: 66,
    impact: 62,
    affectedCount: 4,
    visibleOnMap: true,
    locationLabel: "Near south central Hastings",
    specialInstructions: "",
    estimatedCost: 1800,
    strategicTag: "Infrastructure reliability",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "issue-2",
    title: "Playground equipment concern",
    description: "Possible damage to a ladder on a park structure.",
    x: 63,
    y: 31,
    category: "parks",
    department: "Parks & Recreation",
    fund: "Parks / Keno",
    status: "Assigned",
    source: "Resident",
    confidence: 61,
    urgency: 42,
    impact: 50,
    affectedCount: 2,
    visibleOnMap: true,
    locationLabel: "Neighborhood park",
    specialInstructions: "",
    estimatedCost: 1200,
    strategicTag: "Quality of life",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "issue-3",
    title: "Water leak near intersection",
    description: "Standing water observed along curb line.",
    x: 49,
    y: 55,
    category: "utilities",
    department: "Utilities",
    fund: "Utility Fund",
    status: "Work in Progress",
    source: "Department",
    confidence: 87,
    urgency: 84,
    impact: 72,
    affectedCount: 1,
    visibleOnMap: true,
    locationLabel: "Central corridor",
    specialInstructions: "Monitor adjacent properties for additional pooling.",
    estimatedCost: 4200,
    strategicTag: "Core service continuity",
    lastUpdated: new Date().toISOString(),
  },
];

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function inferCategory(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("water") ||
    lower.includes("sewer") ||
    lower.includes("power") ||
    lower.includes("utility") ||
    lower.includes("outage") ||
    lower.includes("main break")
  ) {
    return "utilities";
  }

  if (
    lower.includes("pothole") ||
    lower.includes("road") ||
    lower.includes("street") ||
    lower.includes("intersection") ||
    lower.includes("traffic")
  ) {
    return "roads";
  }

  if (
    lower.includes("park") ||
    lower.includes("playground") ||
    lower.includes("mowing") ||
    lower.includes("trail")
  ) {
    return "parks";
  }

  if (lower.includes("fire")) return "fire";
  if (lower.includes("police")) return "safety";

  if (
    lower.includes("property") ||
    lower.includes("trash") ||
    lower.includes("code")
  ) {
    return "code";
  }

  if (lower.includes("city hall") || lower.includes("council")) {
    return "admin";
  }

  return "other";
}

function inferLocationFromText(text) {
  const lower = text.toLowerCase();

  if (lower.includes("burlington") && lower.includes("3rd")) {
    return { x: 35, y: 46, label: "3rd & Burlington" };
  }

  if (lower.includes("7th") && lower.includes("lincoln")) {
    return { x: 58, y: 44, label: "7th & Lincoln" };
  }

  if (lower.includes("city hall")) {
    return { x: 51, y: 50, label: "City Hall" };
  }

  return null;
}

function scoreSignal(text, source) {
  const lower = text.toLowerCase();

  let urgency = 34;
  let impact = 34;
  let confidence = source.includes("Facebook") ? 58 : 64;

  if (
    lower.includes("break") ||
    lower.includes("crews are responding") ||
    lower.includes("downed") ||
    lower.includes("closed") ||
    lower.includes("flood")
  ) {
    urgency += 34;
    impact += 22;
    confidence += 18;
  }

  if (
    lower.includes("reported") ||
    lower.includes("observed") ||
    lower.includes("confirmed")
  ) {
    confidence += 10;
  }

  if (
    lower.includes("reminder") ||
    lower.includes("meeting") ||
    lower.includes("schedule")
  ) {
    urgency -= 18;
    impact -= 10;
  }

  if (
    lower.includes("this week") ||
    lower.includes("ongoing") ||
    lower.includes("continue")
  ) {
    impact += 4;
  }

  return {
    urgency: clamp(urgency, 0, 100),
    impact: clamp(impact, 0, 100),
    confidence: clamp(confidence, 0, 100),
  };
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

function softDangerButtonStyle() {
  return {
    border: "1px solid #ffd7d3",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 700,
    cursor: "pointer",
    background: "#fff4f2",
    color: "#a64337",
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

function listItemStyle() {
  return {
    background: "#f8fbfe",
    border: "1px solid #e5edf6",
    borderRadius: 14,
    padding: 12,
  };
}

function buttonRowStyle() {
  return {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  };
}

function inputStyle() {
  return {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #d7e4f0",
    padding: "12px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "white",
  };
}

function progressTrackStyle() {
  return {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e8f0f7",
    overflow: "hidden",
    marginTop: 8,
  };
}

function progressBarStyle(pct) {
  return {
    width: `${pct}%`,
    height: "100%",
    background: pct > 85 ? "#d84315" : pct > 65 ? "#ef6c00" : "#0f6ab7",
    borderRadius: 999,
  };
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function MicButton({ onClick, listening }) {
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
    <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle()}
      />
      <MicButton onClick={onMicClick} listening={listening} />
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
    <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...inputStyle(),
          minHeight,
          resize: "vertical",
        }}
      />
      <MicButton onClick={onMicClick} listening={listening} />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Under Review": {
      background: "#FFF4DB",
      color: "#7A5600",
      border: "1px solid #F3DE9C",
    },
    Assigned: {
      background: "#EAF2FF",
      color: "#1F4E9D",
      border: "1px solid #CDE0FF",
    },
    "Work in Progress": {
      background: "#E8F7EC",
      color: "#146C2E",
      border: "1px solid #BFE3C9",
    },
    Resolved: {
      background: "#EEF0F2",
      color: "#495057",
      border: "1px solid #D9E0E5",
    },
  };

  const style = styles[status] || styles["Under Review"];

  return (
    <span
      style={{
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

export default function App() {
  const isMobile = useIsMobile();
  const mapRef = useRef(null);

  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [persona, setPersona] = useState(PERSONAS.PUBLIC);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [intelligenceItems, setIntelligenceItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(INITIAL_ISSUES[0]?.id ?? null);
  const [reportMode, setReportMode] = useState(false);
  const [reportPoint, setReportPoint] = useState(null);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [listeningField, setListeningField] = useState(null);

  const [reportForm, setReportForm] = useState({
    description: "",
    categoryChoice: "ai",
    routeMode: "standard",
    chosenDepartment: "Administration",
    specialInstructions: "",
  });

  const [adminDraft, setAdminDraft] = useState({
    updateNote: "",
    specialInstructions: "",
  });

  const visibleIssues = useMemo(
    () => issues.filter((issue) => issue.visibleOnMap),
    [issues]
  );

  const selectedIssue = useMemo(
    () =>
      issues.find((issue) => issue.id === selectedIssueId) ||
      visibleIssues[0] ||
      null,
    [issues, selectedIssueId, visibleIssues]
  );

  const rotatingIssue = useMemo(() => {
    if (!visibleIssues.length) return null;
    return visibleIssues[rotationIndex % visibleIssues.length];
  }, [visibleIssues, rotationIndex]);

  const budgetInsights = useMemo(() => {
    return budgets.map((fund) => {
      const remaining = fund.budgeted - fund.spent;
      const usedPct = clamp((fund.spent / fund.budgeted) * 100, 0, 100);
      return {
        ...fund,
        remaining,
        usedPct,
      };
    });
  }, [budgets]);

  const summary = useMemo(() => {
    const open = issues.filter((issue) => issue.status !== "Resolved").length;
    const highPriority = issues.filter(
      (issue) => issue.urgency >= 70 || issue.impact >= 70
    ).length;

    return {
      total: issues.length,
      open,
      highPriority,
      intelligence: intelligenceItems.length,
      notifications: notifications.length,
    };
  }, [issues, intelligenceItems, notifications]);

  useEffect(() => {
    if (!visibleIssues.length) return undefined;

    const timer = window.setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % visibleIssues.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [visibleIssues.length]);

  useEffect(() => {
    ingestFeedItems(INITIAL_FEED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    recognition.onerror = () => {
      setListeningField(null);
    };

    recognition.onend = () => {
      setListeningField(null);
    };

    recognition.start();
  }

  function addNotification(type, message, department = "Administration", severity = "info") {
    setNotifications((prev) => [
      {
        id: makeId("note"),
        type,
        message,
        department,
        severity,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  }

  function ingestFeedItems(items) {
    const intelligenceAdds = [];
    const mapAdds = [];
    const boostIds = [];
    const currentIssues = [...issues];

    items.forEach((item) => {
      const category = inferCategory(item.text);
      const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
      const location = inferLocationFromText(item.text);
      const score = scoreSignal(item.text, item.source);

      const mapLevel =
        Boolean(location) &&
        score.urgency >= 55 &&
        score.impact >= 45 &&
        score.confidence >= 58;

      if (mapLevel) {
        const similar = currentIssues.find(
          (issue) =>
            issue.locationLabel === location.label && issue.category === category
        );

        if (similar) {
          boostIds.push(similar.id);
        } else {
          const newIssue = {
            id: makeId("issue"),
            title:
              item.text.length > 58
                ? `${config.label}: ${item.text.slice(0, 58)}…`
                : `${config.label}: ${item.text}`,
            description: item.text,
            x: location.x,
            y: location.y,
            category,
            department: config.department,
            fund: config.fund,
            status: "Under Review",
            source: item.source,
            confidence: score.confidence,
            urgency: score.urgency,
            impact: score.impact,
            affectedCount: 0,
            visibleOnMap: true,
            locationLabel: location.label,
            specialInstructions: "",
            estimatedCost: config.estimatedCost,
            strategicTag: config.strategicTag,
            lastUpdated: item.timestamp,
          };

          mapAdds.push(newIssue);
          currentIssues.unshift(newIssue);

          if (score.urgency >= 70 || score.impact >= 70) {
            addNotification(
              "important_concern",
              `${config.department} should review: ${item.text}`,
              config.department,
              "high"
            );
          }
        }
      } else {
        intelligenceAdds.push({
          id: makeId("intel"),
          source: item.source,
          text: item.text,
          category: config.label,
          recommendedUse:
            score.confidence >= 58
              ? "Supports confidence and decision making"
              : "Informational only",
          timestamp: item.timestamp,
        });
      }
    });

    if (boostIds.length) {
      const boostedIssues = currentIssues.filter((issue) => boostIds.includes(issue.id));

      setIssues((prev) =>
        prev.map((issue) =>
          boostIds.includes(issue.id)
            ? {
                ...issue,
                confidence: clamp(issue.confidence + 8, 0, 100),
                urgency: clamp(issue.urgency + 4, 0, 100),
                impact: clamp(issue.impact + 4, 0, 100),
                lastUpdated: new Date().toISOString(),
              }
            : issue
        )
      );

      boostedIssues.forEach((issue) => {
        addNotification(
          "confidence_update",
          `Confidence increased for ${issue.title}.`,
          issue.department,
          "medium"
        );
      });
    }

    if (mapAdds.length) {
      setIssues((prev) => [...mapAdds, ...prev]);
      if (!selectedIssueId && mapAdds[0]) {
        setSelectedIssueId(mapAdds[0].id);
      }
    }

    if (intelligenceAdds.length) {
      setIntelligenceItems((prev) => [...intelligenceAdds, ...prev]);
    }
  }

  function handleMapClick(event) {
    if (!reportMode || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 8, 94);

    setReportPoint({ x, y });
  }

  function handleSubmitReport() {
    if (!reportPoint || !reportForm.description.trim()) return;

    const aiCategory = inferCategory(reportForm.description);
    const category =
      reportForm.categoryChoice === "ai" ? aiCategory : reportForm.categoryChoice;
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;

    const department =
      category === "other" || reportForm.routeMode === "manual"
        ? reportForm.chosenDepartment
        : config.department;

    const newIssue = {
      id: makeId("issue"),
      title:
        reportForm.description.length > 52
          ? `${reportForm.description.slice(0, 52)}…`
          : reportForm.description,
      description: reportForm.description,
      x: reportPoint.x,
      y: reportPoint.y,
      category,
      department,
      fund: config.fund,
      status: "Assigned",
      source: "Resident",
      confidence: reportForm.categoryChoice === "ai" ? 68 : 76,
      urgency: category === "utilities" ? 74 : 58,
      impact: 56,
      affectedCount: 1,
      visibleOnMap: true,
      locationLabel: "Resident-selected location",
      specialInstructions: reportForm.specialInstructions,
      estimatedCost: config.estimatedCost,
      strategicTag: config.strategicTag,
      lastUpdated: new Date().toISOString(),
    };

    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);

    setBudgets((prev) =>
      prev.map((fund) =>
        fund.fund === newIssue.fund
          ? { ...fund, spent: fund.spent + newIssue.estimatedCost }
          : fund
      )
    );

    addNotification(
      "new_issue",
      `New issue routed to ${department}: ${newIssue.title}`,
      department,
      newIssue.urgency >= 70 ? "high" : "medium"
    );

    setReportMode(false);
    setReportPoint(null);
    setActiveTab(TABS.HOME);
    setReportForm({
      description: "",
      categoryChoice: "ai",
      routeMode: "standard",
      chosenDepartment: "Administration",
      specialInstructions: "",
    });
  }

  function handleAffected(issueId) {
    const issue = issues.find((item) => item.id === issueId);

    setIssues((prev) =>
      prev.map((entry) =>
        entry.id === issueId
          ? {
              ...entry,
              affectedCount: entry.affectedCount + 1,
              confidence: clamp(entry.confidence + 3, 0, 100),
              impact: clamp(entry.impact + 2, 0, 100),
              lastUpdated: new Date().toISOString(),
            }
          : entry
      )
    );

    if (issue) {
      addNotification(
        "affected_update",
        `More residents are affected by ${issue.title}.`,
        issue.department,
        issue.affectedCount + 1 >= 5 ? "high" : "medium"
      );
    }
  }

  function updateIssueStatus(issueId, status) {
    const issue = issues.find((item) => item.id === issueId);

    setIssues((prev) =>
      prev.map((entry) =>
        entry.id === issueId
          ? { ...entry, status, lastUpdated: new Date().toISOString() }
          : entry
      )
    );

    if (issue) {
      addNotification(
        "status_update",
        `${issue.title} updated to ${status}.`,
        issue.department,
        "medium"
      );
    }
  }

  function routeIssue(issueId, department) {
    const issue = issues.find((item) => item.id === issueId);

    setIssues((prev) =>
      prev.map((entry) =>
        entry.id === issueId
          ? { ...entry, department, lastUpdated: new Date().toISOString() }
          : entry
      )
    );

    if (issue) {
      addNotification(
        "routing_update",
        `${issue.title} routed to ${department}.`,
        department,
        "medium"
      );
    }
  }

  function markNotificationRead(notificationId) {
    setNotifications((prev) =>
      prev.map((note) =>
        note.id === notificationId ? { ...note, read: true } : note
      )
    );
  }

  function addAdminUpdateToIssue() {
    if (!selectedIssue || !adminDraft.updateNote.trim()) return;

    const updatedDescription = `${selectedIssue.description}\n\nUpdate: ${adminDraft.updateNote.trim()}`;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedIssue.id
          ? {
              ...issue,
              description: updatedDescription,
              specialInstructions: adminDraft.specialInstructions.trim()
                ? adminDraft.specialInstructions.trim()
                : issue.specialInstructions,
              lastUpdated: new Date().toISOString(),
            }
          : issue
      )
    );

    addNotification(
      "admin_update",
      `Administrative update added to ${selectedIssue.title}.`,
      selectedIssue.department,
      "medium"
    );

    setAdminDraft({
      updateNote: "",
      specialInstructions: "",
    });
  }

  function unreadNotificationsForPersona() {
    if (persona === PERSONAS.PUBLIC) return [];

    if (persona === PERSONAS.ADMIN) {
      return notifications.filter((note) => !note.read);
    }

    if (!selectedIssue) return [];

    return notifications.filter(
      (note) => !note.read && note.department === selectedIssue.department
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
          We care, we listen, we act. A live city decision platform for residents,
          departments, and leadership.
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
            `${summary.open} open issues`,
            `${summary.highPriority} important concerns`,
            `${summary.notifications} notifications`,
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

  function renderMapSection() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          What’s going on in {CITY_NAME} right now
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          Residents, departments, and city signals feed the same live picture.
        </div>

        <div
          ref={mapRef}
          onClick={handleMapClick}
          style={{
            position: "relative",
            height: 560,
            borderRadius: 18,
            overflow: "hidden",
            marginTop: 14,
            background:
              "radial-gradient(circle at 20% 20%, #cfe9ff 0, #dcefff 26%, #eef6ff 55%, #f6fbff 100%)",
            border: "1px solid #dbe8f4",
            cursor: reportMode ? "crosshair" : "default",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(13,106,183,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(13,106,183,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />

          {[
            { label: "North Hastings", left: "10%", top: "12%" },
            { label: "Downtown", left: "44%", top: "48%" },
            { label: "Parks Corridor", left: "72%", top: "22%" },
          ].map((label) => (
            <div
              key={label.label}
              style={{
                position: "absolute",
                left: label.left,
                top: label.top,
                padding: "6px 10px",
                background: "rgba(255,255,255,0.84)",
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

          {visibleIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIssueId(issue.id);
              }}
              title={issue.title}
              style={{
                position: "absolute",
                left: `${issue.x}%`,
                top: `${issue.y}%`,
                transform: "translate(-50%, -100%)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: selectedIssueId === issue.id ? "#0f6ab7" : "#f44336",
                  border: "3px solid white",
                  boxShadow: "0 8px 18px rgba(244,67,54,0.28)",
                }}
              />
              <div
                style={{
                  width: 4,
                  height: 16,
                  background: selectedIssueId === issue.id ? "#0f6ab7" : "#f44336",
                  margin: "0 auto",
                  borderRadius: "0 0 5px 5px",
                  marginTop: -2,
                }}
              />
            </div>
          ))}

          {reportMode && reportPoint && (
            <div
              style={{
                position: "absolute",
                left: `${reportPoint.x}%`,
                top: `${reportPoint.y}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "#0f6ab7",
                  border: "3px solid white",
                  boxShadow: "0 8px 18px rgba(15,106,183,0.28)",
                }}
              />
              <div
                style={{
                  width: 4,
                  height: 16,
                  background: "#0f6ab7",
                  margin: "0 auto",
                  borderRadius: "0 0 5px 5px",
                  marginTop: -2,
                }}
              />
            </div>
          )}
        </div>

        <div style={buttonRowStyle()}>
          <button
            onClick={() => {
              setActiveTab(TABS.REPORT);
              setReportMode(true);
            }}
            style={primaryButtonStyle()}
          >
            Report an issue
          </button>

          <button onClick={() => setPersona(PERSONAS.PUBLIC)} style={secondaryButtonStyle()}>
            Public view
          </button>
          <button
            onClick={() => setPersona(PERSONAS.DEPARTMENT)}
            style={secondaryButtonStyle()}
          >
            Department view
          </button>
          <button onClick={() => setPersona(PERSONAS.ADMIN)} style={secondaryButtonStyle()}>
            City admin view
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e5edf6",
            padding: 14,
            minHeight: 148,
            boxShadow: "0 8px 22px rgba(25,42,70,0.06)",
          }}
        >
          {rotatingIssue ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>
                    {rotatingIssue.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#67819a" }}>
                    {rotatingIssue.locationLabel} • {rotatingIssue.department}
                  </div>
                </div>
                <StatusBadge status={rotatingIssue.status} />
              </div>

              <div style={{ marginBottom: 10, lineHeight: 1.45 }}>
                {rotatingIssue.description}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                {[
                  ["Confidence", `${rotatingIssue.confidence}%`],
                  ["Urgency", `${rotatingIssue.urgency}%`],
                  ["Affected", `${rotatingIssue.affectedCount}`],
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
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: "#63809b" }}>No active issues yet.</div>
          )}
        </div>
      </div>
    );
  }

  function renderIssueDetails() {
    if (!selectedIssue) {
      return (
        <div style={panelStyle()}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
            Issue details
          </div>
          <div style={{ color: "#63809b", fontSize: 13 }}>
            Select a map issue to see details.
          </div>
        </div>
      );
    }

    const fund = budgetInsights.find((item) => item.fund === selectedIssue.fund);

    return (
      <div style={panelStyle()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
              {selectedIssue.title}
            </div>
            <div style={{ fontSize: 12, color: "#67819a" }}>
              {selectedIssue.locationLabel} • {selectedIssue.source}
            </div>
          </div>
          <StatusBadge status={selectedIssue.status} />
        </div>

        <div style={{ marginBottom: 12, lineHeight: 1.5 }}>
          {selectedIssue.description}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={listItemStyle()}>
            <strong>Department:</strong> {selectedIssue.department}
            <br />
            <strong>Fund:</strong> {selectedIssue.fund}
            <br />
            <strong>Strategic focus:</strong> {selectedIssue.strategicTag}
          </div>

          <div style={listItemStyle()}>
            <strong>Confidence:</strong> {selectedIssue.confidence}%
            <br />
            <strong>Urgency:</strong> {selectedIssue.urgency}%
            <br />
            <strong>Impact:</strong> {selectedIssue.impact}%
            <br />
            <strong>I’m Affected:</strong> {selectedIssue.affectedCount}
          </div>

          <div style={listItemStyle()}>
            <strong>Special Instructions:</strong>
            <div style={{ marginTop: 6 }}>
              {selectedIssue.specialInstructions || "None provided"}
            </div>
          </div>

          {fund && (
            <div style={listItemStyle()}>
              <strong>Budget intelligence</strong>
              <div style={{ marginTop: 8 }}>
                {fund.fund}: {formatMoney(fund.spent)} spent of{" "}
                {formatMoney(fund.budgeted)}
              </div>
              <div style={progressTrackStyle()}>
                <div style={progressBarStyle(fund.usedPct)} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                Remaining: {formatMoney(fund.remaining)}
              </div>
            </div>
          )}
        </div>

        <div style={buttonRowStyle()}>
          <button
            style={primaryButtonStyle()}
            onClick={() => handleAffected(selectedIssue.id)}
          >
            I’m Affected
          </button>

          {(persona === PERSONAS.ADMIN || persona === PERSONAS.DEPARTMENT) && (
            <>
              <button
                style={secondaryButtonStyle()}
                onClick={() => updateIssueStatus(selectedIssue.id, "Under Review")}
              >
                Under Review
              </button>
              <button
                style={secondaryButtonStyle()}
                onClick={() => updateIssueStatus(selectedIssue.id, "Assigned")}
              >
                Assigned
              </button>
              <button
                style={secondaryButtonStyle()}
                onClick={() => updateIssueStatus(selectedIssue.id, "Work in Progress")}
              >
                Work in Progress
              </button>
              <button
                style={softDangerButtonStyle()}
                onClick={() => updateIssueStatus(selectedIssue.id, "Resolved")}
              >
                Resolved
              </button>
            </>
          )}
        </div>

        {persona === PERSONAS.ADMIN && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#355a7f",
                marginBottom: 6,
              }}
            >
              Route this issue
            </div>
            <div style={buttonRowStyle()}>
              {DEPARTMENTS.map((department) => (
                <button
                  key={department}
                  style={secondaryButtonStyle()}
                  onClick={() => routeIssue(selectedIssue.id, department)}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>
        )}

        {(persona === PERSONAS.ADMIN || persona === PERSONAS.DEPARTMENT) && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
              Add update
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
                Update note
              </div>
              <TextareaWithMic
                value={adminDraft.updateNote}
                onChange={(e) =>
                  setAdminDraft((prev) => ({ ...prev, updateNote: e.target.value }))
                }
                placeholder="Enter an update for this issue."
                listening={listeningField === "admin-update-note"}
                onMicClick={() =>
                  startVoiceInput(
                    "admin-update-note",
                    () => adminDraft.updateNote,
                    (nextValue) =>
                      setAdminDraft((prev) => ({ ...prev, updateNote: nextValue }))
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
                Special instructions
              </div>
              <TextareaWithMic
                value={adminDraft.specialInstructions}
                onChange={(e) =>
                  setAdminDraft((prev) => ({
                    ...prev,
                    specialInstructions: e.target.value,
                  }))
                }
                placeholder="Enter additional operational instructions."
                listening={listeningField === "admin-special-instructions"}
                onMicClick={() =>
                  startVoiceInput(
                    "admin-special-instructions",
                    () => adminDraft.specialInstructions,
                    (nextValue) =>
                      setAdminDraft((prev) => ({
                        ...prev,
                        specialInstructions: nextValue,
                      }))
                  )
                }
              />
            </div>

            <button style={primaryButtonStyle()} onClick={addAdminUpdateToIssue}>
              Save update
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderReportPanel() {
    return (
      <div style={panelStyle(true)}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Report an issue
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          Tap the map to set the location. AI can categorize the issue for the resident.
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
              Location
            </div>
            <div style={listItemStyle()}>
              {reportPoint
                ? `Selected at ${reportPoint.x.toFixed(1)}%, ${reportPoint.y.toFixed(1)}%`
                : "Tap the map to choose the location."}
            </div>
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
              value={reportForm.categoryChoice}
              onChange={(e) =>
                setReportForm((prev) => ({ ...prev, categoryChoice: e.target.value }))
              }
              style={inputStyle()}
            >
              <option value="ai">Let AI categorize it</option>
              <option value="roads">Roads</option>
              <option value="utilities">Utilities</option>
              <option value="parks">Parks</option>
              <option value="safety">Public Safety</option>
              <option value="fire">Fire</option>
              <option value="code">Code / Property</option>
              <option value="admin">Administration</option>
              <option value="other">Other</option>
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
              Routing
            </div>
            <select
              value={reportForm.routeMode}
              onChange={(e) =>
                setReportForm((prev) => ({ ...prev, routeMode: e.target.value }))
              }
              style={inputStyle()}
            >
              <option value="standard">Standard routing</option>
              <option value="manual">Manual routing</option>
            </select>
          </div>

          {(reportForm.categoryChoice === "other" ||
            reportForm.routeMode === "manual") && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#355a7f",
                  marginBottom: 6,
                }}
              >
                Choose department
              </div>
              <select
                value={reportForm.chosenDepartment}
                onChange={(e) =>
                  setReportForm((prev) => ({
                    ...prev,
                    chosenDepartment: e.target.value,
                  }))
                }
                style={inputStyle()}
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          <div style={buttonRowStyle()}>
            <button style={primaryButtonStyle()} onClick={handleSubmitReport}>
              Submit report
            </button>
            <button
              style={secondaryButtonStyle()}
              onClick={() => {
                setReportMode(false);
                setReportPoint(null);
                setActiveTab(TABS.HOME);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderCommandCenter() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Command center
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          Budget-aware, strategic, and operational view for admins and departments.
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
            Recommended actions
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={listItemStyle()}>
              Prioritize utility response near 7th & Lincoln due to high urgency and
              confirmed department signal.
            </div>
            <div style={listItemStyle()}>
              Monitor recurring road reports and prepare a streets package for the next
              planning cycle.
            </div>
            <div style={listItemStyle()}>
              Use parks trend items as planning support rather than public map clutter.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
            Important notifications
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {unreadNotificationsForPersona().length ? (
              unreadNotificationsForPersona().map((note) => (
                <div key={note.id} style={listItemStyle()}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <strong>{note.department}</strong>
                      <div style={{ marginTop: 6 }}>{note.message}</div>
                      <div style={{ fontSize: 12, color: "#67819a", marginTop: 6 }}>
                        Severity: {note.severity}
                      </div>
                    </div>
                    <button
                      style={secondaryButtonStyle()}
                      onClick={() => markNotificationRead(note.id)}
                    >
                      Mark read
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={listItemStyle()}>No unread notifications.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderIntelligence() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Intelligence layer
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          Signals that support confidence and decision making without automatically
          becoming public map pins.
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {intelligenceItems.length ? (
            intelligenceItems.map((item) => (
              <div key={item.id} style={listItemStyle()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <strong>{item.category}</strong>
                  <span style={{ fontSize: 12, color: "#67819a" }}>
                    {item.source}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>{item.text}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                  {item.recommendedUse}
                </div>
              </div>
            ))
          ) : (
            <div style={listItemStyle()}>No intelligence items yet.</div>
          )}
        </div>
      </div>
    );
  }

  function renderBudgetPanel() {
    return (
      <div style={panelStyle()}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
          Budget and planning
        </div>
        <div style={{ color: "#63809b", fontSize: 13, lineHeight: 1.45 }}>
          Budget-aware decisions, council support, and year-ahead planning live here.
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {budgetInsights.map((fund) => (
            <div key={fund.fund} style={listItemStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <strong>{fund.fund}</strong>
                <span style={{ fontSize: 12, color: "#67819a" }}>
                  {fund.usedPct.toFixed(0)}% used
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                {formatMoney(fund.spent)} of {formatMoney(fund.budgeted)}
              </div>
              <div style={progressTrackStyle()}>
                <div style={progressBarStyle(fund.usedPct)} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#67819a" }}>
                Remaining: {formatMoney(fund.remaining)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
            Planning output
          </div>
          <div style={listItemStyle()}>
            AI can use prior budgets, city plans, and live issue activity to produce
            council-ready summaries, grant support language, year-ahead
            recommendations, and budget-conscious prioritization.
          </div>
        </div>
      </div>
    );
  }

  function renderBottomNav() {
    const items = [
      { key: TABS.HOME, label: "Home" },
      { key: TABS.REPORT, label: "Report" },
      { key: TABS.COMMAND, label: "Command" },
      { key: TABS.BUDGET, label: "Budget" },
    ];

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
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          padding: "10px 12px max(10px, env(safe-area-inset-bottom))",
          zIndex: 40,
        }}
      >
        {items.map((item) => (
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
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: 16,
        }}
      >
        {renderTopBar()}

        <div
          style={
            isMobile
              ? { display: "block" }
              : {
                  display: "grid",
                  gridTemplateColumns: "1.45fr 0.85fr",
                  gap: 16,
                  alignItems: "start",
                }
          }
        >
          <div style={{ display: "grid", gap: 16 }}>
            {renderMapSection()}
            {(activeTab === TABS.COMMAND || activeTab === TABS.HOME) && renderCommandCenter()}
            {activeTab === TABS.COMMAND && renderIntelligence()}
            {activeTab === TABS.BUDGET && renderBudgetPanel()}
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              marginTop: isMobile ? 16 : 0,
            }}
          >
            {activeTab === TABS.REPORT ? renderReportPanel() : renderIssueDetails()}
          </div>
        </div>
      </div>

      {renderBottomNav()}
    </div>
  );
}