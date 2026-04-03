import React, { useEffect, useMemo, useRef, useState } from "react";

const DEPARTMENTS = ["Streets", "Utilities", "Parks", "Fire", "Other"];
const ACTION_TYPES = ["Inspect", "Repair", "Replace", "Monitor", "Clean Up", "Route"];
const ESCALATION_OPTIONS = [
  { label: "24 hours", value: 24 },
  { label: "48 hours", value: 48 },
  { label: "72 hours", value: 72 },
  { label: "5 days", value: 120 },
  { label: "7 days", value: 168 }
];

const REPORT_TYPES = [
  "Council Report",
  "Council Summary",
  "Escalation Summary",
  "Budget Insight",
  "Strategic Insight",
  "Department Snapshot"
];

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function formatTimeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString();
}

function detectCategory(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("pothole") || t.includes("road") || t.includes("sidewalk") || t.includes("street")) {
    return "Road Repair";
  }
  if (t.includes("water") || t.includes("drain") || t.includes("storm") || t.includes("sewer")) {
    return "Utilities";
  }
  if (t.includes("park") || t.includes("bench") || t.includes("playground") || t.includes("tree")) {
    return "Parks";
  }
  if (t.includes("fire") || t.includes("smoke")) {
    return "Fire";
  }
  return "General";
}

function defaultDepartmentForCategory(category) {
  if (category === "Road Repair") return "Streets";
  if (category === "Utilities") return "Utilities";
  if (category === "Parks") return "Parks";
  if (category === "Fire") return "Fire";
  return "Other";
}

function defaultActionForCategory(category) {
  if (category === "Road Repair") return "Repair";
  if (category === "Utilities") return "Inspect";
  if (category === "Parks") return "Inspect";
  if (category === "Fire") return "Inspect";
  return "Inspect";
}

function defaultEscalationForCategory(category) {
  if (category === "Utilities") return 24;
  if (category === "Road Repair") return 48;
  if (category === "Parks") return 72;
  return 48;
}

function getStatusMessage(issue) {
  if (issue.status === "Received") {
    return issue.source === "resident"
      ? `Resident reported this on PublicPulse ${formatTimeAgo(issue.createdAt)}`
      : "City initiated work to address this";
  }
  if (issue.status === "Under Review") {
    return "City is aware and determining the appropriate next step";
  }
  if (issue.status === "Assigned") {
    return "City has directed the appropriate department to address this";
  }
  if (issue.status === "Acknowledged") {
    return `${issue.department} acknowledged this item and provided a timeline`;
  }
  if (issue.status === "In Progress") {
    return `Work is underway: ${issue.progressSummary || issue.actionType?.toLowerCase() || "response in progress"}`;
  }
  if (issue.status === "Completed") {
    return "City has completed addressing the concern and the issue is closed";
  }
  if (issue.status === "Escalated") {
    return `Escalated: no activity within ${issue.escalationHours} hours`;
  }
  return issue.summary || "";
}

function getQueueColor(issue) {
  if (issue.status === "Escalated") return "#d64545";
  if (!issue.dueAt) return "#2d8cff";
  const now = Date.now();
  const due = new Date(issue.dueAt).getTime();
  const created = new Date(issue.lastActivityAt || issue.updatedAt || issue.createdAt).getTime();
  const total = Math.max(1, due - created);
  const remaining = due - now;
  if (remaining <= 0) return "#d64545";
  if (remaining <= total * 0.25) return "#d9a300";
  return "#2ca75f";
}

function getQueueBackground(issue) {
  const c = getQueueColor(issue);
  if (c === "#d64545") return "#fdecec";
  if (c === "#d9a300") return "#fff6df";
  return "#eaf7ef";
}

function getQueueLabel(issue) {
  const c = getQueueColor(issue);
  if (c === "#d64545") return "Late";
  if (c === "#d9a300") return "Approaching";
  return "On track";
}

function sortDeptItems(a, b) {
  const order = (x) => {
    const c = getQueueColor(x);
    if (c === "#d64545") return 3;
    if (c === "#d9a300") return 2;
    return 1;
  };
  const diff = order(b) - order(a);
  if (diff !== 0) return diff;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export default function App() {
  const [mode, setMode] = useState("public"); // public | city | department
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedDepartmentIssueId, setSelectedDepartmentIssueId] = useState(null);
  const [selectedPublicIssueId, setSelectedPublicIssueId] = useState(null);
  const [reportFlowOpen, setReportFlowOpen] = useState(false);
  const [awaitingMapPin, setAwaitingMapPin] = useState(false);
  const [reportPinLocation, setReportPinLocation] = useState(null);
  const [toast, setToast] = useState("");

  const [reportType, setReportType] = useState("Council Report");

  const [reportForm, setReportForm] = useState({
    description: "",
    instructions: "",
    photoUrl: ""
  });

  const recognitionRef = useRef(null);

  const [issues, setIssues] = useState([
    {
      id: 1001,
      source: "resident",
      title: "Pothole near downtown crosswalk",
      description: "Large pothole near the downtown crosswalk causing rough traffic and safety concerns for drivers.",
      shortSummary: "Large pothole near the downtown crosswalk is affecting traffic flow and driver safety.",
      category: "Road Repair",
      department: "Streets",
      actionType: "Repair",
      status: "Received",
      queueState: "New",
      x: 46,
      y: 67,
      createdAt: hoursFromNow(-2),
      updatedAt: hoursFromNow(-2),
      lastActivityAt: hoursFromNow(-2),
      timestampLabel: "Reported 2 hours ago",
      support: 4,
      escalationHours: 48,
      dueAt: hoursFromNow(48),
      imageUrls: [],
      specialInstructions: "",
      publicVisible: true,
      cityHistory: [
        { time: hoursFromNow(-2), text: "Resident reported concern on PublicPulse." }
      ]
    },
    {
      id: 1002,
      source: "city",
      title: "Playground repair at Libs Park",
      description: "The city is addressing damaged playground equipment at Libs Park and plans to inspect and repair the affected area.",
      shortSummary: "City crews are addressing damaged playground equipment at Libs Park.",
      category: "Parks",
      department: "Parks",
      actionType: "Inspect",
      status: "In Progress",
      queueState: "Active",
      x: 71,
      y: 31,
      createdAt: hoursFromNow(-10),
      updatedAt: hoursFromNow(-1),
      lastActivityAt: hoursFromNow(-1),
      timestampLabel: "Updated 1 hour ago",
      support: 1,
      escalationHours: 72,
      dueAt: hoursFromNow(18),
      progressSummary: "parks crew inspecting damaged playground equipment at Libs Park",
      imageUrls: [],
      specialInstructions: "Post update after inspection and note any temporary closures.",
      publicVisible: true,
      cityHistory: [
        { time: hoursFromNow(-10), text: "City initiated visible park repair work." },
        { time: hoursFromNow(-1), text: "Parks team posted active work update." }
      ]
    },
    {
      id: 1003,
      source: "resident",
      title: "Stormwater pooling after rain",
      description: "Water is pooling near the intersection after rain and appears to be draining slowly, creating a traffic nuisance.",
      shortSummary: "Stormwater pooling near the intersection is creating a recurring drainage concern.",
      category: "Utilities",
      department: "Utilities",
      actionType: "Inspect",
      status: "Assigned",
      queueState: "Assigned",
      x: 56,
      y: 54,
      createdAt: hoursFromNow(-5),
      updatedAt: hoursFromNow(-4),
      lastActivityAt: hoursFromNow(-4),
      timestampLabel: "Assigned 4 hours ago",
      support: 2,
      escalationHours: 24,
      dueAt: hoursFromNow(6),
      imageUrls: [],
      specialInstructions: "Confirm whether this is recurring after storms.",
      publicVisible: true,
      cityHistory: [
        { time: hoursFromNow(-5), text: "Resident reported drainage concern." },
        { time: hoursFromNow(-4), text: "City assigned to Utilities." }
      ]
    }
  ]);

  const publicIssues = useMemo(
    () => issues.filter((i) => i.publicVisible),
    [issues]
  );

  const rotatingIssues = publicIssues;
  const [rotateIndex, setRotateIndex] = useState(0);

  useEffect(() => {
    if (!rotatingIssues.length) return;
    const timer = setInterval(() => {
      setRotateIndex((prev) => (prev + 1) % rotatingIssues.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [rotatingIssues.length]);

  const rotatingIssue = rotatingIssues.length ? rotatingIssues[rotateIndex] : null;

  const cityQueue = useMemo(
    () =>
      issues.filter(
        (i) =>
          i.status === "Received" ||
          i.status === "Under Review" ||
          i.status === "Escalated"
      ),
    [issues]
  );

  const departmentQueue = useMemo(
    () =>
      issues
        .filter((i) =>
          ["Assigned", "Acknowledged", "In Progress", "Escalated"].includes(i.status)
        )
        .sort(sortDeptItems),
    [issues]
  );

  useEffect(() => {
    if (!selectedIssueId && cityQueue.length) setSelectedIssueId(cityQueue[0].id);
    if (!selectedDepartmentIssueId && departmentQueue.length) {
      setSelectedDepartmentIssueId(departmentQueue[0].id);
    }
    if (!selectedPublicIssueId && publicIssues.length) setSelectedPublicIssueId(publicIssues[0].id);
  }, [cityQueue, departmentQueue, publicIssues, selectedIssueId, selectedDepartmentIssueId, selectedPublicIssueId]);

  const selectedCityIssue =
    cityQueue.find((i) => i.id === selectedIssueId) || null;
  const selectedDepartmentIssue =
    departmentQueue.find((i) => i.id === selectedDepartmentIssueId) || null;
  const selectedPublicIssue =
    publicIssues.find((i) => i.id === selectedPublicIssueId) || null;

  const [assignForm, setAssignForm] = useState({
    department: "Streets",
    actionType: "Inspect",
    escalationHours: 48,
    dueHours: 48,
    instructions: ""
  });

  const [ackForm, setAckForm] = useState({
    dueHours: 48,
    note: ""
  });

  useEffect(() => {
    if (selectedCityIssue) {
      setAssignForm({
        department: selectedCityIssue.department || "Streets",
        actionType: selectedCityIssue.actionType || "Inspect",
        escalationHours: selectedCityIssue.escalationHours || 48,
        dueHours: selectedCityIssue.escalationHours || 48,
        instructions: selectedCityIssue.specialInstructions || ""
      });
    }
  }, [selectedCityIssue?.id]);

  useEffect(() => {
    if (selectedDepartmentIssue) {
      setAckForm({
        dueHours: selectedDepartmentIssue.escalationHours || 48,
        note: ""
      });
    }
  }, [selectedDepartmentIssue?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIssues((prev) =>
        prev.map((issue) => {
          if (
            ["Assigned", "Acknowledged", "In Progress"].includes(issue.status) &&
            issue.escalationHours &&
            issue.lastActivityAt
          ) {
            const hoursSinceActivity =
              (Date.now() - new Date(issue.lastActivityAt).getTime()) / 36e5;
            if (hoursSinceActivity >= issue.escalationHours && issue.status !== "Escalated") {
              return {
                ...issue,
                status: "Escalated",
                queueState: "Escalated",
                updatedAt: new Date().toISOString(),
                cityHistory: [
                  ...(issue.cityHistory || []),
                  {
                    time: new Date().toISOString(),
                    text: `Automatically escalated after ${issue.escalationHours} hours with no activity.`
                  }
                ]
              };
            }
          }
          return issue;
        })
      );
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setReportForm((prev) => ({
        ...prev,
        description: prev.description
          ? `${prev.description} ${transcript}`.trim()
          : transcript
      }));
    };
    recognition.onerror = () => {
      setToast("Voice input did not work. Please try again.");
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const openReportFlow = () => {
    setSelectedPublicIssueId(null);
    setSelectedPinIdSafe(null);
    setReportFlowOpen(true);
    setAwaitingMapPin(true);
    setReportPinLocation(null);
    setReportForm({
      description: "",
      instructions: "",
      photoUrl: ""
    });
  };

  const setSelectedPinIdSafe = (id) => {
    setSelectedPublicIssueId(id);
  };

  const handlePublicMapClick = (e) => {
    if (!awaitingMapPin) {
      if (selectedPublicIssueId) setSelectedPublicIssueId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setReportPinLocation({ x, y });
    setAwaitingMapPin(false);
  };

  const submitReport = () => {
    if (!reportPinLocation || !reportForm.description.trim()) return;

    const category = detectCategory(reportForm.description);
    const dept = defaultDepartmentForCategory(category);
    const actionType = defaultActionForCategory(category);
    const escalationHours = defaultEscalationForCategory(category);
    const imageUrls = reportForm.photoUrl ? [reportForm.photoUrl] : [];

    const newIssue = {
      id: Date.now(),
      source: "resident",
      title: reportForm.description.trim().slice(0, 60),
      description: reportForm.description.trim(),
      shortSummary: reportForm.description.trim(),
      category,
      department: dept,
      actionType,
      status: "Received",
      queueState: "New",
      x: reportPinLocation.x,
      y: reportPinLocation.y,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      timestampLabel: "Reported just now",
      support: 0,
      escalationHours,
      dueAt: hoursFromNow(escalationHours),
      imageUrls,
      specialInstructions: reportForm.instructions.trim(),
      publicVisible: true,
      cityHistory: [
        { time: new Date().toISOString(), text: "Resident reported concern on PublicPulse." }
      ]
    };

    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    setSelectedPublicIssueId(newIssue.id);
    setReportFlowOpen(false);
    setAwaitingMapPin(false);
    setReportPinLocation(null);
    setToast("Thank you for letting your voice be heard. You will be receiving direct updates.");
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const assignSelectedIssue = () => {
    if (!selectedCityIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedCityIssue.id
          ? {
              ...issue,
              department: assignForm.department,
              actionType: assignForm.actionType,
              escalationHours: Number(assignForm.escalationHours),
              dueAt: hoursFromNow(Number(assignForm.dueHours)),
              specialInstructions: assignForm.instructions,
              status: "Assigned",
              queueState: "Assigned",
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: `Assigned to ${assignForm.department} for ${assignForm.actionType.toLowerCase()}.`
                }
              ]
            }
          : issue
      )
    );
    setToast("Issue assigned.");
  };

  const remindLater = () => {
    if (!selectedCityIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedCityIssue.id
          ? {
              ...issue,
              status: "Under Review",
              queueState: "Review Later",
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: "City scheduled this item for later review."
                }
              ]
            }
          : issue
      )
    );
    setToast("Review later saved.");
  };

  const closeNoAction = () => {
    if (!selectedCityIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedCityIssue.id
          ? {
              ...issue,
              status: "Completed",
              queueState: "Closed",
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: "City closed this issue with no further action required."
                }
              ]
            }
          : issue
      )
    );
    setToast("Issue closed.");
  };

  const manualEscalate = () => {
    if (!selectedCityIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedCityIssue.id
          ? {
              ...issue,
              status: "Escalated",
              queueState: "Escalated",
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: "City manually escalated this issue."
                }
              ]
            }
          : issue
      )
    );
    setToast("Issue escalated.");
  };

  const acknowledgeDeptItem = () => {
    if (!selectedDepartmentIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedDepartmentIssue.id
          ? {
              ...issue,
              status: "Acknowledged",
              dueAt: hoursFromNow(Number(ackForm.dueHours)),
              escalationHours: Number(ackForm.dueHours),
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              specialInstructions: issue.specialInstructions,
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: `${issue.department} acknowledged the assignment${ackForm.note ? `: ${ackForm.note}` : "."}`
                }
              ]
            }
          : issue
      )
    );
    setToast("Department acknowledged item.");
  };

  const startWork = () => {
    if (!selectedDepartmentIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedDepartmentIssue.id
          ? {
              ...issue,
              status: "In Progress",
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              progressSummary: `${issue.department.toLowerCase()} crew actively working on this item`,
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: `${issue.department} started work.`
                }
              ]
            }
          : issue
      )
    );
    setToast("Work started.");
  };

  const addDeptUpdate = () => {
    if (!selectedDepartmentIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedDepartmentIssue.id
          ? {
              ...issue,
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: `${issue.department} posted a progress update.`
                }
              ]
            }
          : issue
      )
    );
    setToast("Update posted.");
  };

  const completeDeptItem = () => {
    if (!selectedDepartmentIssue) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === selectedDepartmentIssue.id
          ? {
              ...issue,
              status: "Completed",
              queueState: "Completed",
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              cityHistory: [
                ...(issue.cityHistory || []),
                {
                  time: new Date().toISOString(),
                  text: `${issue.department} completed work on this item.`
                }
              ]
            }
          : issue
      )
    );
    setToast("Issue completed.");
  };

  const reportPreview = useMemo(() => {
    const open = issues.filter((i) => i.status !== "Completed");
    const completed = issues.filter((i) => i.status === "Completed");
    const escalated = issues.filter((i) => i.status === "Escalated");
    const inProgress = issues.filter((i) => i.status === "In Progress");
    const awaiting = issues.filter((i) => ["Received", "Under Review", "Assigned", "Acknowledged"].includes(i.status));

    if (reportType === "Council Report") {
      return [
        "1. What happened since the last council report:",
        `${open.length + completed.length} total visible issues were tracked, with ${completed.length} completed and ${inProgress.length} actively in progress.`,
        "",
        "2. What still needs to be addressed:",
        `${awaiting.length} items remain open and require additional review, assignment, or work completion.`,
        "",
        "3. What is currently being addressed:",
        `${inProgress.length} items are actively being worked by departments at this time.`,
        "",
        "4. What needs to happen before the next meeting:",
        `City staff should review ${awaiting.length} open items and prioritize any approaching or escalated concerns.`,
        "",
        "5. Budget insight:",
        "Recurring roadway and drainage concerns suggest ongoing maintenance pressure and may justify targeted budget attention.",
        "",
        "6. Strategic plan insight:",
        "PublicPulse activity indicates where visible public concerns align with service response, helping the city connect resident experience to planning priorities."
      ].join("\n");
    }

    if (reportType === "Council Summary") {
      return `Open: ${open.length}. In progress: ${inProgress.length}. Completed: ${completed.length}. Escalated: ${escalated.length}.`;
    }

    if (reportType === "Escalation Summary") {
      return escalated.length
        ? escalated.map((e) => `• ${e.title || e.description} — ${e.department}`).join("\n")
        : "No escalated items at this time.";
    }

    if (reportType === "Budget Insight") {
      return "Road, drainage, and park maintenance patterns suggest where recurring public concerns may influence budget prioritization.";
    }

    if (reportType === "Strategic Insight") {
      return "The strongest value of PublicPulse is the closed loop between public concern, visible map activity, department action, and city-level strategic decision making.";
    }

    return "Department-level snapshot is ready to generate.";
  }, [issues, reportType]);

  return (
    <div style={styles.app}>
      <style>{css}</style>

      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.appTitle}>PublicPulse</div>
          <div style={styles.appSubtitle}>Hastings</div>
        </div>

        <div style={styles.topNav}>
          <button
            style={navBtn(mode === "public")}
            onClick={() => setMode("public")}
          >
            Public
          </button>
          <button
            style={navBtn(mode === "city")}
            onClick={() => setMode("city")}
          >
            City
          </button>
          <button
            style={navBtn(mode === "department")}
            onClick={() => setMode("department")}
          >
            Department
          </button>
        </div>
      </div>

      {mode === "public" && (
        <div style={styles.publicPage}>
          <div style={styles.publicBanner}>
            <div style={styles.publicBannerLabel}>What’s going on in Hastings right now</div>
            {rotatingIssue && (
              <div className="fade-rotator" key={rotatingIssue.id}>
                <div style={styles.publicBannerTitle}>{rotatingIssue.title}</div>
                <div style={styles.publicBannerText}>
                  {rotatingIssue.shortSummary}
                </div>
              </div>
            )}
          </div>

          <div style={styles.mapShell}>
            <div
              style={{
                ...styles.mapArea,
                opacity: selectedPublicIssue ? 0.45 : 1
              }}
              onClick={handlePublicMapClick}
            >
              <div style={styles.mapBackdrop} />
              <div style={styles.mapRoadV} />
              <div style={styles.mapRoadH} />
              <div style={styles.mapPark1} />
              <div style={styles.mapPark2} />
              <div style={styles.mapZone1}>Downtown</div>
              <div style={styles.mapZone2}>Libs Park</div>
              <div style={styles.mapZone3}>North Hastings</div>

              {publicIssues.map((issue) => (
                <button
                  key={issue.id}
                  style={{
                    ...styles.pinWrap,
                    left: `${issue.x}%`,
                    top: `${issue.y}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPublicIssueId(issue.id);
                  }}
                  title={issue.title}
                >
                  <div
                    className="pin-ring"
                    style={{ background: getPinColor(issue.status) }}
                  />
                  <div
                    className="pin-ring pin-ring-2"
                    style={{ background: getPinColor(issue.status) }}
                  />
                  <div
                    style={{
                      ...styles.pinCore,
                      background: getPinColor(issue.status)
                    }}
                  />
                </button>
              ))}

              {awaitingMapPin && (
                <div style={styles.mapInstruction}>
                  Tap the map to drop your pin
                </div>
              )}

              {reportPinLocation && reportFlowOpen && (
                <div
                  style={{
                    ...styles.tempPin,
                    left: `${reportPinLocation.x}%`,
                    top: `${reportPinLocation.y}%`
                  }}
                />
              )}
            </div>

            {selectedPublicIssue && (
              <div
                style={styles.publicIssueOverlay}
                onClick={() => setSelectedPublicIssueId(null)}
              >
                <div
                  style={styles.publicIssueCard}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={styles.issueCardHeader}>
                    <div>
                      <div style={styles.issueCardTitle}>{selectedPublicIssue.title}</div>
                      <div style={styles.issueCardMeta}>
                        {selectedPublicIssue.category} • {selectedPublicIssue.department}
                      </div>
                    </div>
                    <button
                      style={styles.closeBtn}
                      onClick={() => setSelectedPublicIssueId(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div style={styles.issueStatusRow}>
                    <span style={tagStyle("#edf4ff", "#2458a9")}>{selectedPublicIssue.status}</span>
                    <span style={tagStyle("#f5f7fa", "#5f7285")}>
                      {formatDateTime(selectedPublicIssue.updatedAt)}
                    </span>
                  </div>

                  <div style={styles.issueDescription}>{selectedPublicIssue.description}</div>
                  <div style={styles.issueSummary}>{getStatusMessage(selectedPublicIssue)}</div>

                  {!!selectedPublicIssue.imageUrls?.length && (
                    <div style={styles.photoRow}>
                      {selectedPublicIssue.imageUrls.map((url, idx) => (
                        <img key={idx} src={url} alt="report" style={styles.issuePhoto} />
                      ))}
                    </div>
                  )}

                  {selectedPublicIssue.specialInstructions && (
                    <div style={styles.specialInstructions}>
                      <strong>Notes:</strong> {selectedPublicIssue.specialInstructions}
                    </div>
                  )}

                  <button
                    style={styles.noticeBtn}
                    onClick={() => {
                      setIssues((prev) =>
                        prev.map((issue) =>
                          issue.id === selectedPublicIssue.id
                            ? { ...issue, support: (issue.support || 0) + 1 }
                            : issue
                        )
                      );
                      setSelectedPublicIssueId(selectedPublicIssue.id);
                    }}
                  >
                    I noticed this too ({selectedPublicIssue.support || 0})
                  </button>
                </div>
              </div>
            )}

            {reportFlowOpen && (
              <div style={styles.reportOverlay}>
                <div style={styles.reportPanel}>
                  <div style={styles.reportHeader}>
                    <div style={styles.reportTitle}>New Report</div>
                    <button
                      style={styles.closeBtn}
                      onClick={() => {
                        setReportFlowOpen(false);
                        setAwaitingMapPin(false);
                        setReportPinLocation(null);
                      }}
                    >
                      Close
                    </button>
                  </div>

                  <div style={styles.reportStep}>
                    {reportPinLocation
                      ? "Pin placed. Add details below."
                      : "Start by dropping a pin on the map."}
                  </div>

                  <div style={styles.fieldLabel}>Describe what happened</div>
                  <div style={styles.micRow}>
                    <textarea
                      value={reportForm.description}
                      onChange={(e) =>
                        setReportForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      style={styles.textarea}
                      placeholder="Describe the concern..."
                    />
                    <button style={styles.micBtn} onClick={startVoiceInput}>
                      🎤
                    </button>
                  </div>

                  <div style={styles.fieldLabel}>Would you like to attach a picture?</div>
                  <input
                    type="text"
                    placeholder="Paste image URL here for now"
                    value={reportForm.photoUrl}
                    onChange={(e) =>
                      setReportForm((prev) => ({ ...prev, photoUrl: e.target.value }))
                    }
                    style={styles.input}
                  />

                  <div style={styles.fieldLabel}>Special instructions</div>
                  <textarea
                    value={reportForm.instructions}
                    onChange={(e) =>
                      setReportForm((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    style={{ ...styles.textarea, minHeight: 86 }}
                    placeholder="Optional notes"
                  />

                  <button
                    style={{
                      ...styles.submitBtn,
                      opacity: reportPinLocation && reportForm.description.trim() ? 1 : 0.5
                    }}
                    onClick={submitReport}
                    disabled={!reportPinLocation || !reportForm.description.trim()}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.publicBottomRow}>
            <button style={styles.reportMainBtn} onClick={openReportFlow}>
              Report
            </button>
          </div>
        </div>
      )}

      {mode === "city" && (
        <div style={styles.dashboardPage}>
          <div style={styles.dashboardTitle}>Command Center</div>
          <div style={styles.threeCol}>
            <div style={styles.col}>
              <div style={styles.colHeader}>Citizen Concern Queue</div>
              <div style={styles.queueList}>
                {cityQueue.length === 0 ? (
                  <div style={styles.emptyState}>No items waiting for city action.</div>
                ) : (
                  cityQueue.map((issue) => (
                    <button
                      key={issue.id}
                      style={{
                        ...styles.queueCard,
                        border:
                          selectedCityIssue?.id === issue.id
                            ? "2px solid #0c5fd7"
                            : "1px solid #dbe3ec"
                      }}
                      onClick={() => setSelectedIssueId(issue.id)}
                    >
                      <div style={styles.queueCardTitle}>{issue.title}</div>
                      <div style={styles.queueCardText}>{issue.category}</div>
                      <div style={styles.queueCardText}>{formatTimeAgo(issue.createdAt)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div style={styles.col}>
              <div style={styles.colHeader}>Actions</div>
              {selectedCityIssue ? (
                <div style={styles.actionPanel}>
                  <div style={styles.actionIssueTitle}>{selectedCityIssue.title}</div>
                  <div style={styles.actionIssueText}>{selectedCityIssue.description}</div>

                  <label style={styles.fieldLabel}>Assign department</label>
                  <select
                    value={assignForm.department}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, department: e.target.value }))
                    }
                    style={styles.input}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>

                  <label style={styles.fieldLabel}>Action</label>
                  <select
                    value={assignForm.actionType}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, actionType: e.target.value }))
                    }
                    style={styles.input}
                  >
                    {ACTION_TYPES.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>

                  <label style={styles.fieldLabel}>When should work be done?</label>
                  <select
                    value={assignForm.dueHours}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, dueHours: Number(e.target.value) }))
                    }
                    style={styles.input}
                  >
                    {ESCALATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <label style={styles.fieldLabel}>Escalate if no activity in</label>
                  <select
                    value={assignForm.escalationHours}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        escalationHours: Number(e.target.value)
                      }))
                    }
                    style={styles.input}
                  >
                    {ESCALATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <label style={styles.fieldLabel}>Instructions</label>
                  <textarea
                    value={assignForm.instructions}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    style={styles.textareaSmall}
                  />

                  <div style={styles.btnGrid}>
                    <button style={styles.primaryBtn} onClick={assignSelectedIssue}>
                      Assign
                    </button>
                    <button style={styles.secondaryBtn} onClick={remindLater}>
                      Remind Me Later
                    </button>
                    <button style={styles.secondaryBtn} onClick={manualEscalate}>
                      Escalate
                    </button>
                    <button style={styles.secondaryBtn} onClick={closeNoAction}>
                      Close / No Action
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>Select an item from the queue.</div>
              )}
            </div>

            <div style={styles.col}>
              <div style={styles.colHeader}>Insights & Reports</div>

              <label style={styles.fieldLabel}>Choose report</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.input}
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              <button style={styles.primaryBtnFull}>Create Report</button>

              <div style={styles.insightBox}>
                <div style={styles.insightTitle}>{reportType}</div>
                <pre style={styles.reportPreview}>{reportPreview}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "department" && (
        <div style={styles.dashboardPage}>
          <div style={styles.dashboardTitle}>Department Center</div>
          <div style={styles.threeCol}>
            <div style={styles.col}>
              <div style={styles.colHeader}>Department Queue</div>
              <div style={styles.queueList}>
                {departmentQueue.length === 0 ? (
                  <div style={styles.emptyState}>No department work items right now.</div>
                ) : (
                  departmentQueue.map((issue) => (
                    <button
                      key={issue.id}
                      style={{
                        ...styles.queueCard,
                        border:
                          selectedDepartmentIssue?.id === issue.id
                            ? "2px solid #0c5fd7"
                            : "1px solid #dbe3ec",
                        background: getQueueBackground(issue)
                      }}
                      onClick={() => setSelectedDepartmentIssueId(issue.id)}
                    >
                      <div style={styles.queueCardTitle}>{issue.title}</div>
                      <div style={styles.queueCardText}>
                        {issue.department} • {issue.status}
                      </div>
                      <div
                        style={{
                          ...styles.queueHealth,
                          color: getQueueColor(issue)
                        }}
                      >
                        {getQueueLabel(issue)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div style={styles.col}>
              <div style={styles.colHeader}>Department Actions</div>
              {selectedDepartmentIssue ? (
                <div style={styles.actionPanel}>
                  <div style={styles.actionIssueTitle}>{selectedDepartmentIssue.title}</div>
                  <div style={styles.actionIssueText}>{selectedDepartmentIssue.description}</div>

                  <label style={styles.fieldLabel}>Timeline / expectation</label>
                  <select
                    value={ackForm.dueHours}
                    onChange={(e) =>
                      setAckForm((prev) => ({ ...prev, dueHours: Number(e.target.value) }))
                    }
                    style={styles.input}
                  >
                    {ESCALATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <label style={styles.fieldLabel}>Reason or update</label>
                  <textarea
                    value={ackForm.note}
                    onChange={(e) =>
                      setAckForm((prev) => ({ ...prev, note: e.target.value }))
                    }
                    style={styles.textareaSmall}
                  />

                  <div style={styles.btnGrid}>
                    <button style={styles.primaryBtn} onClick={acknowledgeDeptItem}>
                      Acknowledge
                    </button>
                    <button style={styles.secondaryBtn} onClick={startWork}>
                      Start Work
                    </button>
                    <button style={styles.secondaryBtn} onClick={addDeptUpdate}>
                      Add Update
                    </button>
                    <button style={styles.secondaryBtn} onClick={completeDeptItem}>
                      Complete
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>Select a department item.</div>
              )}
            </div>

            <div style={styles.col}>
              <div style={styles.colHeader}>Accountability</div>
              {selectedDepartmentIssue ? (
                <div style={styles.insightBox}>
                  <div style={styles.insightTitle}>Current status</div>
                  <div style={styles.simpleLine}>{selectedDepartmentIssue.status}</div>

                  <div style={styles.insightTitle}>Escalation</div>
                  <div style={styles.simpleLine}>
                    Escalates if no activity in {selectedDepartmentIssue.escalationHours} hours
                  </div>

                  <div style={styles.insightTitle}>Timeline health</div>
                  <div
                    style={{
                      ...styles.simpleLine,
                      color: getQueueColor(selectedDepartmentIssue),
                      fontWeight: 800
                    }}
                  >
                    {getQueueLabel(selectedDepartmentIssue)}
                  </div>

                  <div style={styles.insightTitle}>Last activity</div>
                  <div style={styles.simpleLine}>
                    {formatDateTime(selectedDepartmentIssue.lastActivityAt)}
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>Select an item to view accountability details.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

function getPinColor(status) {
  if (status === "Escalated") return "#d64545";
  if (status === "In Progress") return "#d9a300";
  if (status === "Assigned" || status === "Acknowledged") return "#2d8cff";
  if (status === "Completed") return "#2ca75f";
  return "#4663ff";
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#eef3f8",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#17324d"
  },
  topBar: {
    background: "linear-gradient(135deg, #0a3d91 0%, #0c5fd7 100%)",
    color: "white",
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    boxShadow: "0 10px 24px rgba(12,95,215,0.18)"
  },
  topBarLeft: { display: "flex", flexDirection: "column", gap: 2 },
  appTitle: { fontSize: 24, fontWeight: 800 },
  appSubtitle: { fontSize: 14, opacity: 0.95 },
  topNav: { display: "flex", gap: 8, flexWrap: "wrap" },

  publicPage: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "16px 14px 36px"
  },
  publicBanner: {
    background: "white",
    borderRadius: 22,
    padding: 16,
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    marginBottom: 12
  },
  publicBannerLabel: {
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 8
  },
  publicBannerTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 6
  },
  publicBannerText: {
    fontSize: 15,
    color: "#53687b",
    lineHeight: 1.5
  },
  mapShell: {
    position: "relative"
  },
  mapArea: {
    position: "relative",
    height: 640,
    borderRadius: 22,
    overflow: "hidden",
    border: "1px solid #d9e1ea",
    background:
      "linear-gradient(to bottom, #cfe7ff 0%, #d8eeff 56%, #eef2e5 56%, #f5f7ef 100%)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
  },
  mapBackdrop: {
    position: "absolute",
    inset: 0
  },
  mapRoadV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "52%",
    width: 5,
    background: "#8795a3"
  },
  mapRoadH: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "69%",
    height: 5,
    background: "#8795a3"
  },
  mapPark1: {
    position: "absolute",
    top: "17%",
    left: "68%",
    width: "20%",
    height: "17%",
    background: "#b9d8cf",
    borderRadius: 24
  },
  mapPark2: {
    position: "absolute",
    top: "14%",
    left: "10%",
    width: "18%",
    height: "18%",
    background: "#b8d5c8",
    borderRadius: 24
  },
  mapZone1: {
    position: "absolute",
    top: "74%",
    left: "42%",
    background: "rgba(255,255,255,0.93)",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800
  },
  mapZone2: {
    position: "absolute",
    top: "25%",
    left: "73%",
    background: "rgba(255,255,255,0.93)",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800
  },
  mapZone3: {
    position: "absolute",
    top: "12%",
    left: "9%",
    background: "rgba(255,255,255,0.93)",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800
  },
  pinWrap: {
    position: "absolute",
    transform: "translate(-50%, -100%)",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer"
  },
  pinCore: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "3px solid white",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
    position: "relative",
    zIndex: 2
  },
  mapInstruction: {
    position: "absolute",
    top: 14,
    left: 14,
    background: "rgba(10,61,145,0.94)",
    color: "white",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 13
  },
  tempPin: {
    position: "absolute",
    transform: "translate(-50%, -100%)",
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "3px solid white",
    background: "#0c5fd7",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)"
  },
  publicBottomRow: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 14
  },
  reportMainBtn: {
    border: "none",
    background: "#0c5fd7",
    color: "white",
    borderRadius: 999,
    padding: "14px 26px",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(12,95,215,0.24)"
  },

  publicIssueOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    zIndex: 30
  },
  publicIssueCard: {
    width: "min(760px, 100%)",
    background: "white",
    borderRadius: 22,
    boxShadow: "0 20px 44px rgba(0,0,0,0.22)",
    padding: 18
  },
  issueCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "start",
    marginBottom: 10
  },
  issueCardTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 4
  },
  issueCardMeta: {
    fontSize: 13,
    color: "#607487"
  },
  closeBtn: {
    border: "1px solid #d8e0e9",
    background: "white",
    borderRadius: 12,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700
  },
  issueStatusRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12
  },
  issueDescription: {
    fontSize: 15,
    lineHeight: 1.55,
    marginBottom: 10
  },
  issueSummary: {
    fontSize: 14,
    color: "#576c7f",
    marginBottom: 12
  },
  photoRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12
  },
  issuePhoto: {
    width: 160,
    height: 110,
    objectFit: "cover",
    borderRadius: 14,
    border: "1px solid #d8e0e9"
  },
  specialInstructions: {
    fontSize: 14,
    marginBottom: 12
  },
  noticeBtn: {
    border: "none",
    background: "#0c5fd7",
    color: "white",
    borderRadius: 14,
    padding: "11px 14px",
    fontWeight: 800,
    cursor: "pointer"
  },

  reportOverlay: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    zIndex: 40,
    display: "flex",
    justifyContent: "center"
  },
  reportPanel: {
    width: "min(680px, 100%)",
    background: "white",
    borderRadius: 22,
    boxShadow: "0 20px 44px rgba(0,0,0,0.22)",
    padding: 18
  },
  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 8
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 800
  },
  reportStep: {
    fontSize: 14,
    color: "#5e7386",
    marginBottom: 12
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 6,
    marginTop: 6,
    color: "#32495f"
  },
  micRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "start"
  },
  micBtn: {
    border: "none",
    background: "#eef5ff",
    color: "#0c5fd7",
    borderRadius: 14,
    width: 52,
    height: 52,
    fontSize: 22,
    cursor: "pointer"
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid #d7dfe8",
    fontSize: 14
  },
  textarea: {
    width: "100%",
    minHeight: 110,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d7dfe8",
    fontSize: 14,
    resize: "vertical"
  },
  textareaSmall: {
    width: "100%",
    minHeight: 88,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d7dfe8",
    fontSize: 14,
    resize: "vertical"
  },
  submitBtn: {
    marginTop: 14,
    width: "100%",
    border: "none",
    background: "#0c5fd7",
    color: "white",
    borderRadius: 14,
    padding: "13px 16px",
    fontWeight: 800,
    cursor: "pointer"
  },

  dashboardPage: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "18px 14px 30px"
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 14
  },
  threeCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr 0.95fr",
    gap: 14
  },
  col: {
    background: "white",
    borderRadius: 22,
    padding: 16,
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    minHeight: 700
  },
  colHeader: {
    fontSize: 17,
    fontWeight: 800,
    marginBottom: 12
  },
  queueList: {
    display: "grid",
    gap: 10
  },
  queueCard: {
    textAlign: "left",
    borderRadius: 16,
    padding: 14,
    background: "#fbfcfe",
    cursor: "pointer"
  },
  queueCardTitle: {
    fontWeight: 800,
    marginBottom: 6,
    fontSize: 14
  },
  queueCardText: {
    fontSize: 13,
    color: "#607487",
    marginBottom: 4
  },
  queueHealth: {
    fontSize: 13,
    fontWeight: 800
  },
  actionPanel: {
    display: "grid",
    gap: 8
  },
  actionIssueTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 2
  },
  actionIssueText: {
    fontSize: 14,
    color: "#5c7083",
    lineHeight: 1.5,
    marginBottom: 10
  },
  btnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10
  },
  primaryBtn: {
    border: "none",
    background: "#0c5fd7",
    color: "white",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryBtn: {
    border: "1px solid #d8e0e9",
    background: "#f6f8fb",
    color: "#29425d",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  },
  primaryBtnFull: {
    width: "100%",
    border: "none",
    background: "#0c5fd7",
    color: "white",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 10,
    marginBottom: 12
  },
  insightBox: {
    border: "1px solid #dbe3ec",
    background: "#fbfcfe",
    borderRadius: 18,
    padding: 14
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 8
  },
  reportPreview: {
    whiteSpace: "pre-wrap",
    fontSize: 13,
    lineHeight: 1.55,
    color: "#566b7e",
    margin: 0,
    fontFamily: "inherit"
  },
  simpleLine: {
    fontSize: 14,
    color: "#566b7e",
    marginBottom: 10
  },
  emptyState: {
    color: "#617588",
    fontSize: 14
  },
  toast: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#17324d",
    color: "white",
    padding: "12px 16px",
    borderRadius: 14,
    boxShadow: "0 14px 26px rgba(0,0,0,0.22)",
    zIndex: 100,
    fontWeight: 700
  }
};

function navBtn(active) {
  return {
    border: active ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.18)",
    background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
    color: "white",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer"
  };
}

function tagStyle(bg, color) {
  return {
    background: bg,
    color,
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 800
  };
}

const css = `
  * { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; }
  .pin-ring {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.22;
    animation: pulseRing 2.2s infinite ease-out;
    pointer-events: none;
  }
  .pin-ring-2 {
    animation-delay: 0.9s;
  }
  @keyframes pulseRing {
    0% { transform: translate(-50%, -50%) scale(0.65); opacity: 0.24; }
    60% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
    100% { transform: translate(-50%, -50%) scale(2.05); opacity: 0; }
  }
  .fade-rotator {
    animation: fadeInOut 4.5s ease-in-out;
  }
  @keyframes fadeInOut {
    0% { opacity: 0.3; }
    18% { opacity: 1; }
    82% { opacity: 1; }
    100% { opacity: 0.3; }
  }
  @media (max-width: 1080px) {
    .responsive-three-col {
      grid-template-columns: 1fr !important;
    }
  }
`;