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

const reportTemplates = {
  "Council Brief": "Council Brief",
  "Operations Snapshot": "Operations Snapshot",
  "Budget & Planning": "Budget & Planning",
  "Strategic Focus": "Strategic Focus",
};

const initialReports = [
  {
    id: 1001,
    title: "Pothole causing rough traffic near downtown.",
    locationName: "Burlington Avenue near Elm",
    text: "A resident reported a large pothole that is affecting traffic flow near downtown.",
    publicSummary:
      "A resident reported a large pothole that is affecting traffic flow near downtown.",
    publicActionText:
      "Streets has been assigned to review the road surface and determine whether patching can be completed in the current maintenance cycle.",
    publicUpdateText:
      "Added to the Streets work queue for field review.",
    category: "Pothole",
    department: "Streets",
    actionType: "Inspect and repair",
    instructions: "Review lane condition and patch if possible.",
    escalationChoice: "48 hours",
    escalationMs: 48 * 60 * 60 * 1000,
    status: "Assigned",
    createdAt: Date.now() - 7 * 60 * 60 * 1000,
    assignedAt: Date.now() - 6 * 60 * 60 * 1000,
    lastActivityAt: Date.now() - 6 * 60 * 60 * 1000,
    resolvedAt: null,
    remindLaterAt: null,
    priorityLabel: "Standard",
    photo: null,
    photoName: "",
    meTooCount: 0,
    x: 28,
    y: 58,
    updates: [
      {
        id: "u1001-1",
        type: "Assigned",
        text: "Assigned to Streets for review.",
        publicText: "Added to the Streets work queue for field review.",
        at: Date.now() - 6 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 1002,
    title: "Playground equipment inspection and repair planned.",
    locationName: "Brickyard Park Playground",
    text: "A resident reported loose playground equipment near the slide.",
    publicSummary:
      "A resident reported loose playground equipment near the slide.",
    publicActionText:
      "Parks has been assigned to inspect the equipment and determine whether repair or temporary safety steps are needed.",
    publicUpdateText:
      "Inspection has been added to the department work queue.",
    category: "Parks",
    department: "Parks",
    actionType: "Inspect",
    instructions: "Check equipment and post update after inspection.",
    escalationChoice: "72 hours",
    escalationMs: 72 * 60 * 60 * 1000,
    status: "Assigned",
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
    assignedAt: Date.now() - 3 * 60 * 60 * 1000,
    lastActivityAt: Date.now() - 3 * 60 * 60 * 1000,
    resolvedAt: null,
    remindLaterAt: null,
    priorityLabel: "Routine",
    photo: null,
    photoName: "",
    meTooCount: 0,
    x: 69,
    y: 48,
    updates: [
      {
        id: "u1002-1",
        type: "Assigned",
        text: "Assigned to Parks for inspection.",
        publicText: "Inspection has been added to the department work queue.",
        at: Date.now() - 3 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 1003,
    title: "Stormwater pooling near intersection after recent rain.",
    locationName: "Kansas Avenue and 9th Street",
    text: "Standing water is remaining near the curb several hours after rainfall.",
    publicSummary:
      "Standing water is remaining near the curb several hours after rainfall.",
    publicActionText:
      "Utilities is reviewing whether the issue is tied to drainage flow or nearby infrastructure conditions.",
    publicUpdateText:
      "Utilities has started field review.",
    category: "Utilities",
    department: "Utilities",
    actionType: "Investigate drainage",
    instructions: "Check drainage path and utility infrastructure.",
    escalationChoice: "24 hours",
    escalationMs: 24 * 60 * 60 * 1000,
    status: "In Progress",
    createdAt: Date.now() - 20 * 60 * 60 * 1000,
    assignedAt: Date.now() - 18 * 60 * 60 * 1000,
    lastActivityAt: Date.now() - 2 * 60 * 60 * 1000,
    resolvedAt: null,
    remindLaterAt: null,
    priorityLabel: "High",
    photo: null,
    photoName: "",
    meTooCount: 0,
    x: 52,
    y: 73,
    updates: [
      {
        id: "u1003-1",
        type: "Assigned",
        text: "Assigned to Utilities.",
        publicText: "Utilities added the issue to its review queue.",
        at: Date.now() - 18 * 60 * 60 * 1000,
      },
      {
        id: "u1003-2",
        type: "In Progress",
        text: "Field review started.",
        publicText: "Utilities has started field review.",
        at: Date.now() - 2 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 1004,
    title: "Sidewalk section near school needs inspection.",
    locationName: "North Pine near Hastings Middle School",
    text: "Sidewalk cracking is creating an uneven walking surface near the school route.",
    publicSummary:
      "Sidewalk cracking is creating an uneven walking surface near a school route.",
    publicActionText:
      "City staff directed Streets to inspect the sidewalk condition and determine whether repair scheduling is needed.",
    publicUpdateText:
      "Assigned to Streets for site review.",
    category: "Sidewalk",
    department: "Streets",
    actionType: "Inspect",
    instructions: "Evaluate pedestrian safety and repair timing.",
    escalationChoice: "48 hours",
    escalationMs: 48 * 60 * 60 * 1000,
    status: "Assigned",
    createdAt: Date.now() - 9 * 60 * 60 * 1000,
    assignedAt: Date.now() - 8 * 60 * 60 * 1000,
    lastActivityAt: Date.now() - 8 * 60 * 60 * 1000,
    resolvedAt: null,
    remindLaterAt: null,
    priorityLabel: "Needs Review",
    photo: null,
    photoName: "",
    meTooCount: 0,
    x: 36,
    y: 32,
    updates: [
      {
        id: "u1004-1",
        type: "Assigned",
        text: "Assigned to Streets.",
        publicText: "Assigned to Streets for site review.",
        at: Date.now() - 8 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: 1005,
    title: "Park bench replacement requested along walking path.",
    locationName: "Libs Park Walking Path",
    text: "Bench damage is making it difficult for residents to use the path rest area.",
    publicSummary:
      "A damaged bench was reported along the walking path rest area.",
    publicActionText:
      "Parks has been asked to review the bench condition and decide whether repair or replacement is the better option.",
    publicUpdateText:
      "Awaiting city review and routing confirmation.",
    category: "Parks",
    department: "Parks",
    actionType: "Review and schedule",
    instructions: "Inspect bench condition and replacement need.",
    escalationChoice: "72 hours",
    escalationMs: 72 * 60 * 60 * 1000,
    status: "Received",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    assignedAt: null,
    lastActivityAt: Date.now() - 2 * 60 * 60 * 1000,
    resolvedAt: null,
    remindLaterAt: null,
    priorityLabel: "Routine",
    photo: null,
    photoName: "",
    meTooCount: 0,
    x: 74,
    y: 28,
    updates: [],
  },
];

function getRouteFromText(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("pothole") ||
    lower.includes("street") ||
    lower.includes("road") ||
    lower.includes("sidewalk") ||
    lower.includes("traffic")
  ) {
    return { department: "Streets", category: "Roadway", actionType: "Inspect" };
  }

  if (
    lower.includes("park") ||
    lower.includes("playground") ||
    lower.includes("bench") ||
    lower.includes("trail") ||
    lower.includes("tree")
  ) {
    return { department: "Parks", category: "Parks", actionType: "Inspect" };
  }

  if (
    lower.includes("water") ||
    lower.includes("drain") ||
    lower.includes("sewer") ||
    lower.includes("utility") ||
    lower.includes("pooling")
  ) {
    return { department: "Utilities", category: "Utilities", actionType: "Investigate" };
  }

  return { department: "City Review", category: "General", actionType: "Inspect" };
}

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function getStatusBadgeText(report) {
  if (report.status === "Escalated") return "Escalated";
  if (report.status === "In Progress") return "In Progress";
  if (report.status === "Assigned") return "Assigned";
  if (report.status === "Completed") return "Completed";
  return "Received";
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

function buildReportContent(type, reports) {
  const active = reports.filter((r) => r.status !== "Completed");
  const completed = reports.filter((r) => r.status === "Completed");
  const escalated = reports.filter((r) => r.status === "Escalated");
  const inProgress = reports.filter((r) => r.status === "In Progress");

  const byDept = reports.reduce((acc, r) => {
    acc[r.department] = (acc[r.department] || 0) + 1;
    return acc;
  }, {});

  const topDept = Object.entries(byDept).sort((a, b) => b[1] - a[1])[0];
  const topIssues = sortQueue(
    active.filter((r) => r.status === "Escalated" || r.status === "Assigned" || r.status === "Received")
  ).slice(0, 4);

  if (type === "Council Brief") {
    return {
      title: "Council Brief",
      sections: [
        {
          heading: "Since Last Review",
          body: `PublicPulse currently shows ${active.length} active concerns, ${inProgress.length} in progress, ${escalated.length} escalated, and ${completed.length} completed.`,
        },
        {
          heading: "Top Items Requiring Attention",
          body:
            topIssues.length > 0
              ? topIssues.map((r) => `• ${r.locationName}: ${r.publicSummary}`).join("\n")
              : "• No urgent items are currently awaiting attention.",
        },
        {
          heading: "Operational Focus",
          body: `The heaviest concentration is currently with ${topDept ? topDept[0] : "city review"}, suggesting that leadership should review workload alignment and turnaround expectations.`,
        },
        {
          heading: "Recommended Next Actions",
          body:
            "• Prioritize escalated items first.\n• Confirm next visible action on all assigned concerns.\n• Use completed items in public accountability messaging.",
        },
      ],
    };
  }

  if (type === "Operations Snapshot") {
    return {
      title: "Operations Snapshot",
      sections: [
        {
          heading: "Current Queue Health",
          body: `Received: ${reports.filter((r) => r.status === "Received").length}\nAssigned: ${reports.filter((r) => r.status === "Assigned").length}\nIn Progress: ${inProgress.length}\nEscalated: ${escalated.length}`,
        },
        {
          heading: "Pressure Points",
          body:
            topIssues.length > 0
              ? topIssues.map((r) => `• ${r.department} — ${r.locationName}`).join("\n")
              : "• No major pressure points right now.",
        },
        {
          heading: "Action Guidance",
          body:
            "• Move long-idle assigned items forward.\n• Ensure field teams post visible updates.\n• Watch repeated issue categories for routing efficiency.",
        },
      ],
    };
  }

  if (type === "Budget & Planning") {
    return {
      title: "Budget & Planning",
      sections: [
        {
          heading: "Budget Signal",
          body:
            "Issue activity suggests where maintenance pressure is building. Repeated roadway, drainage, and park repair concerns should inform seasonal maintenance allocation and near-term repair budgeting.",
        },
        {
          heading: "Potential Cost Avoidance",
          body:
            "Earlier intervention on recurring roadway and park issues may reduce larger future replacement costs and improve visible service outcomes.",
        },
        {
          heading: "Planning Recommendation",
          body:
            "Use PublicPulse issue clustering to compare current field concerns against past budget priorities and strategic planning goals before the next budget cycle.",
        },
      ],
    };
  }

  return {
    title: "Strategic Focus",
    sections: [
      {
        heading: "What the System Is Showing",
        body:
          "PublicPulse is surfacing where residents are seeing visible friction points and where city response patterns are strongest or weakest.",
      },
      {
        heading: "What Leadership Should Watch",
        body:
          "Look for repeated location types, recurring department bottlenecks, and any gap between assigned work and visible public-facing updates.",
      },
      {
        heading: "Year-Ahead Strategic Use",
        body:
          "Use issue clusters, completion patterns, and repeated concerns to guide strategic planning, grant narratives, seasonal maintenance focus, and public accountability reporting.",
      },
    ],
  };
}

export default function App() {
  const [view, setView] = useState("public");
  const [reports, setReports] = useState([]);
  const [publicSelectedId, setPublicSelectedId] = useState(null);
  const [commandSelectedId, setCommandSelectedId] = useState(null);
  const [departmentSelectedId, setDepartmentSelectedId] = useState(null);

  const [reportMode, setReportMode] = useState(false);
  const [placePinMode, setPlacePinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);

  const [reportForm, setReportForm] = useState({
    description: "",
    locationName: "",
    specialInstructions: "",
    photo: null,
    photoName: "",
  });

  const [departmentUpdateText, setDepartmentUpdateText] = useState("");
  const [commandInstructions, setCommandInstructions] = useState("");
  const [remindLaterValue, setRemindLaterValue] = useState("Tomorrow");
  const [reportType, setReportType] = useState("Council Brief");
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
        if (parsed.length > 0) {
          setPublicSelectedId(parsed[0].id);
          setCommandSelectedId(parsed[0].id);
          const firstDepartment = parsed.find(
            (r) => r.status === "Assigned" || r.status === "In Progress" || r.status === "Escalated"
          );
          setDepartmentSelectedId(firstDepartment ? firstDepartment.id : parsed[0].id);
        }
        return;
      } catch (err) {
        console.error("Storage parse error", err);
      }
    }

    setReports(initialReports);
    setPublicSelectedId(initialReports[0].id);
    setCommandSelectedId(initialReports[0].id);
    const firstDepartment = initialReports.find(
      (r) => r.status === "Assigned" || r.status === "In Progress" || r.status === "Escalated"
    );
    setDepartmentSelectedId(firstDepartment ? firstDepartment.id : initialReports[0].id);
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  }, [reports]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReports((prev) =>
        prev.map((report) => {
          if (
            report.status !== "Completed" &&
            report.status !== "Escalated" &&
            report.assignedAt &&
            report.escalationMs &&
            Date.now() - (report.lastActivityAt || report.assignedAt) > report.escalationMs
          ) {
            const escalatedUpdate = {
              id: `up-${report.id}-${Date.now()}`,
              type: "Escalated",
              text: "Item escalated due to inactivity.",
              publicText: report.publicUpdateText,
              at: Date.now(),
            };

            return {
              ...report,
              status: "Escalated",
              lastActivityAt: Date.now(),
              updates: [...report.updates, escalatedUpdate],
            };
          }
          return report;
        })
      );
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const publicSelected = reports.find((r) => r.id === publicSelectedId) || null;
  const commandSelected = reports.find((r) => r.id === commandSelectedId) || null;
  const departmentSelected = reports.find((r) => r.id === departmentSelectedId) || null;

  const rotatingInsights = useMemo(() => {
    const openCount = reports.filter((r) => r.status !== "Completed").length;
    const inProgressCount = reports.filter((r) => r.status === "In Progress").length;
    const escalatedCount = reports.filter((r) => r.status === "Escalated").length;

    return [
      `There are ${openCount} open items across the shared city map.`,
      `${inProgressCount} items are actively being worked right now.`,
      `${escalatedCount} items currently need higher visibility.`,
      "PublicPulse is helping show what residents are seeing and what the city is doing next.",
    ];
  }, [reports]);

  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % rotatingInsights.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [rotatingInsights.length]);

  const commandQueue = useMemo(() => {
    const items = reports.filter((r) => r.status !== "Completed");
    return sortQueue(items);
  }, [reports]);

  const departmentLiveQueue = useMemo(() => {
    const items = reports.filter(
      (r) => r.status === "Assigned" || r.status === "Escalated"
    );
    return sortQueue(items);
  }, [reports]);

  const departmentWorkedItems = useMemo(() => {
    const items = reports.filter(
      (r) => r.status === "In Progress" || r.status === "Completed"
    );
    return sortQueue(items);
  }, [reports]);

  useEffect(() => {
    if (!commandSelected && commandQueue.length > 0) {
      setCommandSelectedId(commandQueue[0].id);
    }
  }, [commandQueue, commandSelected]);

  useEffect(() => {
    if (!departmentSelected && departmentLiveQueue.length > 0) {
      setDepartmentSelectedId(departmentLiveQueue[0].id);
    }
  }, [departmentLiveQueue, departmentSelected]);

  const resetReportForm = () => {
    setReportForm({
      description: "",
      locationName: "",
      specialInstructions: "",
      photo: null,
      photoName: "",
    });
    setPendingPin(null);
    setPlacePinMode(false);
  };

  const openReportFlow = () => {
    setReportMode(true);
    setPlacePinMode(false);
    setPendingPin(null);
  };

  const closeReportFlow = () => {
    setReportMode(false);
    resetReportForm();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReportForm((prev) => ({
        ...prev,
        photo: reader.result,
        photoName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleStartPlacePin = () => {
    if (!reportForm.description.trim()) {
      alert("Please describe what is happening before placing the pin.");
      return;
    }

    setPlacePinMode(true);
  };

  const handleMapClick = (e) => {
    if (!reportMode || !placePinMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingPin({
      x: Math.max(4, Math.min(96, x)),
      y: Math.max(6, Math.min(92, y)),
    });
  };

  const handleSubmitReport = () => {
    if (!reportForm.description.trim()) {
      alert("Please describe what is happening.");
      return;
    }

    if (!pendingPin) {
      alert("Please place the pin on the map before submitting.");
      return;
    }

    const route = getRouteFromText(reportForm.description);
    const escalation = escalationOptions[1];

    const locationName =
      reportForm.locationName.trim() || "Community concern reported";

    const newItem = {
      id: Date.now(),
      title: reportForm.description.trim(),
      locationName,
      text: reportForm.description.trim(),
      publicSummary: reportForm.description.trim(),
      publicActionText:
        "City staff will review this concern, confirm the appropriate department, and post the next visible step.",
      publicUpdateText: "Your report has been received and added for city review.",
      category: route.category,
      department: route.department,
      actionType: route.actionType,
      instructions: reportForm.specialInstructions.trim(),
      escalationChoice: escalation.label,
      escalationMs: escalation.ms,
      status: "Received",
      createdAt: Date.now(),
      assignedAt: null,
      lastActivityAt: Date.now(),
      resolvedAt: null,
      remindLaterAt: null,
      priorityLabel: route.department === "City Review" ? "Needs Review" : "Routine",
      photo: reportForm.photo,
      photoName: reportForm.photoName,
      meTooCount: 0,
      x: pendingPin.x,
      y: pendingPin.y,
      updates: [],
    };

    setReports((prev) => [newItem, ...prev]);
    setPublicSelectedId(newItem.id);
    setCommandSelectedId(newItem.id);
    closeReportFlow();
  };

  const updateReport = (id, updater) => {
    setReports((prev) =>
      prev.map((item) => (item.id === id ? updater(item) : item))
    );
  };

  const assignFromCommand = () => {
    if (!commandSelected) return;

    const chosenEscalation =
      escalationOptions.find((x) => x.label === commandSelected.escalationChoice) ||
      escalationOptions[1];

    updateReport(commandSelected.id, (item) => ({
      ...item,
      status: "Assigned",
      assignedAt: Date.now(),
      lastActivityAt: Date.now(),
      instructions: commandInstructions.trim() || item.instructions,
      publicActionText:
        item.department === "Parks"
          ? `Parks has been assigned to inspect the issue at ${item.locationName} and determine the next field action.`
          : item.department === "Utilities"
          ? `Utilities has been assigned to review the issue at ${item.locationName} and determine the next field action.`
          : item.department === "Streets"
          ? `Streets has been assigned to review the issue at ${item.locationName} and determine the next field action.`
          : `City staff has routed this item for department review at ${item.locationName}.`,
      publicUpdateText: `Assigned to ${item.department} for next-step review.`,
      escalationMs: chosenEscalation.ms,
      updates: [
        ...item.updates,
        {
          id: `up-${item.id}-${Date.now()}`,
          type: "Assigned",
          text: `Assigned to ${item.department}.`,
          publicText: `Assigned to ${item.department} for next-step review.`,
          at: Date.now(),
        },
      ],
    }));

    setCommandInstructions("");
  };

  const escalateFromCommand = () => {
    if (!commandSelected) return;

    updateReport(commandSelected.id, (item) => ({
      ...item,
      status: "Escalated",
      lastActivityAt: Date.now(),
      updates: [
        ...item.updates,
        {
          id: `up-${item.id}-${Date.now()}`,
          type: "Escalated",
          text: "City admin escalated item.",
          publicText: item.publicUpdateText,
          at: Date.now(),
        },
      ],
    }));
  };

  const remindLater = () => {
    if (!commandSelected) return;

    const map = {
      Tomorrow: 24 * 60 * 60 * 1000,
      "In 2 days": 2 * 24 * 60 * 60 * 1000,
      "This week": 5 * 24 * 60 * 60 * 1000,
    };

    updateReport(commandSelected.id, (item) => ({
      ...item,
      remindLaterAt: Date.now() + map[remindLaterValue],
      lastActivityAt: Date.now(),
      updates: [
        ...item.updates,
        {
          id: `up-${item.id}-${Date.now()}`,
          type: "Review Later",
          text: `Review later set for ${remindLaterValue}.`,
          publicText: item.publicUpdateText,
          at: Date.now(),
        },
      ],
    }));
  };

  const setCommandField = (field, value) => {
    if (!commandSelected) return;
    updateReport(commandSelected.id, (item) => ({
      ...item,
      [field]: value,
    }));
  };

  const departmentSelectNextLiveItem = (updatedReports) => {
    const nextLive = sortQueue(
      updatedReports.filter((r) => r.status === "Assigned" || r.status === "Escalated")
    )[0];

    if (nextLive) {
      setDepartmentSelectedId(nextLive.id);
    } else {
      const fallback = sortQueue(
        updatedReports.filter((r) => r.status === "In Progress" || r.status === "Completed")
      )[0];
      setDepartmentSelectedId(fallback ? fallback.id : null);
    }
  };

  const handleDepartmentAction = (action) => {
    if (!departmentSelected) return;

    let updatedReports = [];

    setReports((prev) => {
      updatedReports = prev.map((item) => {
        if (item.id !== departmentSelected.id) return item;

        if (action === "Acknowledge") {
          return {
            ...item,
            lastActivityAt: Date.now(),
            publicUpdateText: `${item.department} has acknowledged the concern and will post the next visible step.`,
            updates: [
              ...item.updates,
              {
                id: `up-${item.id}-${Date.now()}`,
                type: "Acknowledged",
                text: `${item.department} acknowledged the item.`,
                publicText: `${item.department} has acknowledged the concern.`,
                at: Date.now(),
              },
            ],
          };
        }

        if (action === "Start Work") {
          return {
            ...item,
            status: "In Progress",
            lastActivityAt: Date.now(),
            publicUpdateText: `${item.department} has started work on this issue.`,
            publicActionText:
              item.department === "Parks"
                ? `Parks is actively working on the issue at ${item.locationName}.`
                : item.department === "Utilities"
                ? `Utilities is actively working on the issue at ${item.locationName}.`
                : `Streets is actively working on the issue at ${item.locationName}.`,
            updates: [
              ...item.updates,
              {
                id: `up-${item.id}-${Date.now()}`,
                type: "In Progress",
                text: "Work is underway.",
                publicText: `${item.department} has started work on this issue.`,
                at: Date.now(),
              },
            ],
          };
        }

        if (action === "Add Update") {
          const cleanText = departmentUpdateText.trim();
          if (!cleanText) return item;

          return {
            ...item,
            status: "In Progress",
            lastActivityAt: Date.now(),
            publicUpdateText: cleanText,
            updates: [
              ...item.updates,
              {
                id: `up-${item.id}-${Date.now()}`,
                type: "Update",
                text: cleanText,
                publicText: cleanText,
                at: Date.now(),
              },
            ],
          };
        }

        if (action === "Complete") {
          return {
            ...item,
            status: "Completed",
            resolvedAt: Date.now(),
            lastActivityAt: Date.now(),
            publicUpdateText: `${item.department} has completed work on this issue.`,
            updates: [
              ...item.updates,
              {
                id: `up-${item.id}-${Date.now()}`,
                type: "Completed",
                text: "Work completed.",
                publicText: `${item.department} has completed work on this issue.`,
                at: Date.now(),
              },
            ],
          };
        }

        return item;
      });

      return updatedReports;
    });

    if (action === "Add Update" && !departmentUpdateText.trim()) {
      alert("Please enter an update before clicking Add Update.");
      return;
    }

    if (action === "Start Work" || action === "Complete") {
      setTimeout(() => {
        departmentSelectNextLiveItem(updatedReports);
      }, 0);
    }

    if (action === "Add Update") {
      setDepartmentUpdateText("");
    }
  };

  const incrementMeToo = (id) => {
    updateReport(id, (item) => ({
      ...item,
      meTooCount: (item.meTooCount || 0) + 1,
    }));
  };

  const generateSelectedReport = () => {
    setGeneratedReport(buildReportContent(reportType, reports));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>PublicPulse</h1>
          <p>Hastings — real-time visibility, response, and decision support</p>
        </div>

        <div className="topbar-actions">
          <button
            className={view === "public" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("public")}
          >
            Public
          </button>
          <button
            className={view === "command" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("command")}
          >
            Command Center
          </button>
          <button
            className={view === "department" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("department")}
          >
            Department
          </button>
        </div>
      </header>

      {view === "public" && (
        <main className="page public-page">
          <section className="public-hero">
            <div className="hero-text">
              <h2>One shared city map</h2>
              <p>
                Visibility for residents. Accountability for the city. Better decision
                support over time.
              </p>
            </div>

            <div className="insight-chip">
              <span>What’s going on in Hastings right now</span>
              <strong>{rotatingInsights[insightIndex]}</strong>
            </div>
          </section>

          <section className="public-map-card">
            <div className="map-header">
              <div>
                <h3>Live city map</h3>
                <p>Tap a pin to see what is happening and how the city is responding.</p>
              </div>
            </div>

            <div
              className={`map-stage ${placePinMode ? "placing-pin" : ""}`}
              onClick={handleMapClick}
            >
              <div className="map-label north">North Hastings</div>
              <div className="map-label parks">Parks Corridor</div>
              <div className="road vertical" />
              <div className="road horizontal" />
              <div className="road diagonal" />

              {reports.map((report) => (
                <button
                  key={report.id}
                  className={`map-pin ${statusClass(report.status)} ${
                    publicSelectedId === report.id ? "selected" : ""
                  }`}
                  style={{ left: `${report.x}%`, top: `${report.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPublicSelectedId(report.id);
                  }}
                  title={report.locationName}
                />
              ))}

              {pendingPin && (
                <div
                  className="pending-pin"
                  style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                />
              )}

              {placePinMode && !pendingPin && (
                <div className="place-pin-banner">
                  Click inside the map to place the pin
                </div>
              )}
            </div>

            {publicSelected && (
              <div className="public-popup">
                <div className="public-popup-header">
                  <div>
                    <h3>{publicSelected.locationName}</h3>
                    <p>{publicSelected.publicSummary}</p>
                  </div>
                  <button
                    className="small-light-btn"
                    onClick={() => setPublicSelectedId(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="public-badges">
                  <span className={`status-badge ${statusClass(publicSelected.status)}`}>
                    {getStatusBadgeText(publicSelected)}
                  </span>
                  <span className="plain-badge">{publicSelected.department}</span>
                </div>

                <div className="public-popup-body">
                  <div className="public-line">
                    <strong>What the city is doing:</strong> {publicSelected.publicActionText}
                  </div>
                  <div className="public-line">
                    <strong>Latest update:</strong> {publicSelected.publicUpdateText}
                  </div>
                  {publicSelected.instructions && (
                    <div className="public-line">
                      <strong>More detail:</strong> {publicSelected.instructions}
                    </div>
                  )}
                </div>

                {publicSelected.photo && (
                  <div className="public-photo-wrap">
                    <img
                      src={publicSelected.photo}
                      alt={publicSelected.photoName || "uploaded report"}
                      className="public-photo"
                    />
                  </div>
                )}

                <div className="public-popup-actions">
                  <button
                    className="primary-btn"
                    onClick={() => incrementMeToo(publicSelected.id)}
                  >
                    I noticed this too ({publicSelected.meTooCount || 0})
                  </button>
                </div>
              </div>
            )}
          </section>

          {reportMode && (
            <section className="report-flow-card">
              <div className="report-flow-header">
                <h3>New Report</h3>
                <button className="small-light-btn" onClick={closeReportFlow}>
                  Close
                </button>
              </div>

              <div className="report-flow-grid">
                <div className="report-flow-left">
                  <label>Description of what is happening *</label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what is happening..."
                  />

                  <label>Location name for the public card</label>
                  <input
                    type="text"
                    value={reportForm.locationName}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,
                        locationName: e.target.value,
                      }))
                    }
                    placeholder="Example: Brickyard Park Playground"
                  />

                  <label>Special instructions or extra detail</label>
                  <textarea
                    value={reportForm.specialInstructions}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,
                        specialInstructions: e.target.value,
                      }))
                    }
                    placeholder="Optional extra detail..."
                  />
                </div>

                <div className="report-flow-right">
                  <label>Add photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} />

                  {reportForm.photo && (
                    <div className="photo-preview-wrap">
                      <img
                        src={reportForm.photo}
                        alt="preview"
                        className="photo-preview"
                      />
                      <p>{reportForm.photoName}</p>
                    </div>
                  )}

                  <div className="report-steps">
                    <div className={reportForm.description.trim() ? "step done" : "step"}>
                      1. Add description
                    </div>
                    <div className={reportForm.photo ? "step done" : "step"}>
                      2. Add photo if available
                    </div>
                    <div className={pendingPin ? "step done" : "step"}>
                      3. Place pin on map
                    </div>
                    <div className="step final">4. Submit report</div>
                  </div>

                  <div className="report-action-row">
                    <button className="secondary-btn" onClick={handleStartPlacePin}>
                      Place Pin
                    </button>
                    <button className="primary-btn" onClick={handleSubmitReport}>
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <button className="floating-report-btn" onClick={openReportFlow}>
            + Report
          </button>
        </main>
      )}

      {view === "command" && (
        <main className="page dashboard-page">
          <section className="summary-strip">
            <div className="summary-pill">
              {reports.filter((r) => r.status !== "Completed").length} open items
            </div>
            <div className="summary-pill">
              {reports.filter((r) => r.status === "In Progress").length} in progress
            </div>
            <div className="summary-pill">
              {reports.filter((r) => r.status === "Escalated").length} escalated
            </div>
            <div className="summary-pill">One shared city map</div>
          </section>

          <section className="three-column">
            <div className="panel">
              <h3>Incoming & Active Queue</h3>
              <p className="panel-subtitle">
                New concerns, active items, escalations, and items scheduled for later
                review.
              </p>

              <div className="queue-list">
                {commandQueue.map((report) => (
                  <button
                    key={report.id}
                    className={`queue-card ${
                      commandSelectedId === report.id ? "selected" : ""
                    } ${statusClass(report.status)}`}
                    onClick={() => setCommandSelectedId(report.id)}
                  >
                    <div className="queue-title">{report.title}</div>
                    <div className="queue-sub">{report.locationName}</div>
                    <div className="queue-row">
                      <span className="queue-chip">{report.department}</span>
                      <span className="queue-chip">{report.priorityLabel}</span>
                      <span className="queue-chip status">{report.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel center-panel">
              <h3>Selected Issue & Actions</h3>

              {commandSelected ? (
                <>
                  <div className="selected-summary-card">
                    <h4>{commandSelected.locationName}</h4>
                    <p>{commandSelected.publicSummary}</p>

                    <div className="selected-summary-row">
                      <span className={`status-badge ${statusClass(commandSelected.status)}`}>
                        {commandSelected.status}
                      </span>
                      <span className="plain-badge">{commandSelected.department}</span>
                      <span className="plain-badge">
                        Last updated {formatTime(commandSelected.lastActivityAt)}
                      </span>
                    </div>
                  </div>

                  <div className="action-section">
                    <label>Assign Department</label>
                    <select
                      value={commandSelected.department}
                      onChange={(e) => setCommandField("department", e.target.value)}
                    >
                      <option>City Review</option>
                      <option>Streets</option>
                      <option>Parks</option>
                      <option>Utilities</option>
                    </select>

                    <label>Action Type</label>
                    <select
                      value={commandSelected.actionType}
                      onChange={(e) => setCommandField("actionType", e.target.value)}
                    >
                      <option>Inspect</option>
                      <option>Inspect and repair</option>
                      <option>Investigate drainage</option>
                      <option>Review and schedule</option>
                      <option>Road Repair</option>
                    </select>

                    <label>Escalate If No Activity In</label>
                    <select
                      value={commandSelected.escalationChoice}
                      onChange={(e) => {
                        const choice = escalationOptions.find(
                          (opt) => opt.label === e.target.value
                        );
                        setCommandField("escalationChoice", e.target.value);
                        setCommandField("escalationMs", choice ? choice.ms : escalationOptions[1].ms);
                      }}
                    >
                      {escalationOptions.map((opt) => (
                        <option key={opt.label}>{opt.label}</option>
                      ))}
                    </select>

                    <label>Special Instructions</label>
                    <textarea
                      value={commandInstructions || commandSelected.instructions}
                      onChange={(e) => setCommandInstructions(e.target.value)}
                      placeholder="Add instructions..."
                    />

                    <div className="action-row">
                      <button className="primary-btn" onClick={assignFromCommand}>
                        Assign
                      </button>
                      <button className="secondary-btn danger-soft" onClick={escalateFromCommand}>
                        Escalate
                      </button>
                    </div>

                    <div className="remind-later-wrap">
                      <h4>Review Later</h4>
                      <div className="remind-later-row">
                        <select
                          value={remindLaterValue}
                          onChange={(e) => setRemindLaterValue(e.target.value)}
                        >
                          <option>Tomorrow</option>
                          <option>In 2 days</option>
                          <option>This week</option>
                        </select>
                        <button className="small-blue-btn" onClick={remindLater}>
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p>No item selected.</p>
              )}
            </div>

            <div className="panel">
              <h3>Reports & Insights</h3>
              <p className="panel-subtitle">
                High-level visibility, priorities, budget signal, and decision support.
              </p>

              <div className="report-controls-card">
                <label>Choose Report</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  {Object.keys(reportTemplates).map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
                <button className="primary-btn full-width" onClick={generateSelectedReport}>
                  Generate Report
                </button>
              </div>

              {generatedReport && (
                <div className="generated-report-card">
                  <h4>{generatedReport.title}</h4>
                  {generatedReport.sections.map((section, idx) => (
                    <div className="generated-report-section" key={`${section.heading}-${idx}`}>
                      <strong>{section.heading}</strong>
                      <pre>{section.body}</pre>
                    </div>
                  ))}
                </div>
              )}

              {!generatedReport && (
                <div className="insight-placeholder-card">
                  <h4>Current Snapshot</h4>
                  <p>
                    Open concerns: {reports.filter((r) => r.status !== "Completed").length}
                  </p>
                  <p>Escalated items: {reports.filter((r) => r.status === "Escalated").length}</p>
                  <p>In progress: {reports.filter((r) => r.status === "In Progress").length}</p>
                  <div className="placeholder-divider" />
                  <h4>Budget / Planning Signal</h4>
                  <p>
                    Repeated roadway, drainage, and park concerns should help guide
                    maintenance planning and budget timing.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {view === "department" && (
        <main className="page dashboard-page">
          <section className="summary-strip">
            <div className="summary-pill">
              {departmentLiveQueue.length} assigned items
            </div>
            <div className="summary-pill">
              {departmentWorkedItems.filter((r) => r.status === "In Progress").length} in progress
            </div>
            <div className="summary-pill">
              {reports.filter((r) => r.status === "Escalated").length} escalated
            </div>
            <div className="summary-pill">One shared city map</div>
          </section>

          <section className="three-column">
            <div className="panel">
              <h3>Department Queue</h3>
              <p className="panel-subtitle">
                Assigned items remain here until action moves them into active work.
              </p>

              <div className="queue-list">
                {departmentLiveQueue.map((report) => (
                  <button
                    key={report.id}
                    className={`queue-card ${
                      departmentSelectedId === report.id ? "selected" : ""
                    } ${statusClass(report.status)}`}
                    onClick={() => setDepartmentSelectedId(report.id)}
                  >
                    <div className="queue-title">{report.title}</div>
                    <div className="queue-sub">{report.locationName}</div>
                    <div className="queue-row">
                      <span className="queue-chip">{report.department}</span>
                      <span className="queue-chip status">{report.status}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="worked-history">
                <h4>Worked Items</h4>
                <div className="history-list">
                  {departmentWorkedItems.map((report) => (
                    <button
                      key={report.id}
                      className={`history-card ${
                        departmentSelectedId === report.id ? "selected" : ""
                      }`}
                      onClick={() => setDepartmentSelectedId(report.id)}
                    >
                      <div className="queue-title">{report.locationName}</div>
                      <div className="queue-row">
                        <span className="queue-chip">{report.department}</span>
                        <span className="queue-chip status">{report.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel center-panel">
              <h3>Selected Work Item</h3>

              {departmentSelected ? (
                <>
                  <div className="selected-summary-card">
                    <h4>{departmentSelected.locationName}</h4>
                    <p>{departmentSelected.publicSummary}</p>

                    <div className="selected-summary-row">
                      <span
                        className={`status-badge ${statusClass(departmentSelected.status)}`}
                      >
                        {departmentSelected.status}
                      </span>
                      <span className="plain-badge">{departmentSelected.department}</span>
                    </div>

                    <div className="department-detail-lines">
                      <div>
                        <strong>Current public update:</strong> {departmentSelected.publicUpdateText}
                      </div>
                      <div>
                        <strong>Next action:</strong>{" "}
                        {departmentSelected.status === "Completed"
                          ? "Completed"
                          : "Post work update or complete"}
                      </div>
                    </div>
                  </div>

                  <div className="department-actions">
                    <button className="primary-btn" onClick={() => handleDepartmentAction("Acknowledge")}>
                      Acknowledge
                    </button>
                    <button className="secondary-btn" onClick={() => handleDepartmentAction("Start Work")}>
                      Start Work
                    </button>

                    <textarea
                      value={departmentUpdateText}
                      onChange={(e) => setDepartmentUpdateText(e.target.value)}
                      placeholder="Add update for residents and city staff..."
                    />

                    <button className="secondary-btn" onClick={() => handleDepartmentAction("Add Update")}>
                      Add Update
                    </button>
                    <button className="complete-btn" onClick={() => handleDepartmentAction("Complete")}>
                      Complete
                    </button>
                  </div>
                </>
              ) : (
                <p>No work item selected.</p>
              )}
            </div>

            <div className="panel">
              <h3>Timeline & Accountability</h3>
              <p className="panel-subtitle">
                Track progress, visible updates, and overall work status.
              </p>

              {departmentSelected ? (
                <div className="timeline-stack">
                  <div className="timeline-card">
                    <h4>Current Timeline</h4>
                    <p>{departmentSelected.status}</p>
                  </div>
                  <div className="timeline-card">
                    <h4>Last Activity</h4>
                    <p>{formatTime(departmentSelected.lastActivityAt)}</p>
                  </div>
                  <div className="timeline-card">
                    <h4>Work Status</h4>
                    <p>{departmentSelected.status}</p>
                  </div>
                  <div className="timeline-card">
                    <h4>Recent Updates</h4>
                    <div className="timeline-updates">
                      {departmentSelected.updates.length > 0 ? (
                        [...departmentSelected.updates]
                          .sort((a, b) => b.at - a.at)
                          .slice(0, 5)
                          .map((update) => (
                            <div key={update.id} className="timeline-update-item">
                              <strong>{update.type}</strong>
                              <span>{update.text}</span>
                            </div>
                          ))
                      ) : (
                        <p>No updates yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No timeline available.</p>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}