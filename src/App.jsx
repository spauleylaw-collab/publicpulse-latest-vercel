import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HASTINGS_CENTER = [40.5863, -98.3899];
const CATEGORIES = ['All', 'Roads', 'Drainage', 'Traffic', 'Parks', 'Gas / Sewer', 'General'];

const seedIssues = [
  {
    id: 101,
    title: 'Flooding is worsening on Burlington Ave.',
    description: 'Water pooling near curb after recent rain.',
    locationName: 'Burlington Ave & W 2nd St',
    category: 'Drainage',
    status: 'Responding',
    department: 'Hastings Utilities',
    reports: 18,
    traffic: 'High',
    safety: 'Moderate',
    lat: 40.5858,
    lng: -98.3818,
    updatedAt: Date.now() - 1000 * 60 * 18,
    source: 'city',
    requiresApproval: true,
    estimatedCost: '$$',
    delayCost: '$$$',
    lastCost: '$12,000',
    flagship: true,
    recommendation: {
      title: 'Inspect drainage and clear storm intake',
      reasons: ['Repeat issue', 'High traffic area', 'Lower-cost first step'],
      delay: 'If delayed, roadway damage and repair cost will increase.'
    }
  },
  {
    id: 102,
    title: 'Traffic is backing up near the middle school.',
    description: 'Pickup traffic is spilling into through lanes.',
    locationName: 'Middle school pickup lane',
    category: 'Traffic',
    status: 'Under Review',
    department: 'Hastings Police',
    reports: 11,
    traffic: 'High',
    safety: 'Moderate',
    lat: 40.5796,
    lng: -98.3977,
    updatedAt: Date.now() - 1000 * 60 * 42,
    source: 'resident',
    requiresApproval: true,
    estimatedCost: '$',
    delayCost: '$$',
    lastCost: '$0',
    flagship: true,
    recommendation: {
      title: 'Adjust traffic flow at pickup time',
      reasons: ['Peak-hour backup', 'School zone safety', 'Fast operational fix'],
      delay: 'If delayed, congestion is likely to worsen tomorrow.'
    }
  },
  {
    id: 103,
    title: "Lighting is out at Lib's Park.",
    description: 'Several lights are out after dark.',
    locationName: "Lib's Park",
    category: 'Parks',
    status: 'In Progress',
    department: 'City Parks',
    reports: 6,
    traffic: 'Low',
    safety: 'Low',
    lat: 40.5901,
    lng: -98.3776,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    source: 'city',
    requiresApproval: false,
    estimatedCost: '$',
    delayCost: '$$',
    lastCost: '$800',
    flagship: true,
    recommendation: {
      title: 'Replace failed lighting fixture',
      reasons: ['Visible after dark', 'Repeated resident concern', 'Low-cost fix'],
      delay: 'If delayed, park visibility remains poor after dark.'
    }
  },
  {
    id: 104,
    title: 'Pothole reports are increasing on the north side.',
    description: 'Road surface is breaking up near lane center.',
    locationName: 'N Denver Ave',
    category: 'Roads',
    status: 'Concern Received',
    department: 'Public Works',
    reports: 9,
    traffic: 'Moderate',
    safety: 'Moderate',
    lat: 40.5948,
    lng: -98.3920,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    source: 'resident',
    requiresApproval: false,
    estimatedCost: '$',
    delayCost: '$$',
    lastCost: '$2,500',
    flagship: false,
    recommendation: {
      title: 'Patch damaged roadway section',
      reasons: ['Growing damage', 'Moderate traffic', 'Visible issue'],
      delay: 'If delayed, roadway damage and resident complaints will increase.'
    }
  }
];

function toUpdatedLabel(ts) {
  const hours = Math.round((Date.now() - ts) / (1000 * 60 * 60));
  if (hours < 24) return 'Updated today';
  if (hours < 48) return 'Updated 1 day ago';
  return `Updated ${Math.round(hours / 24)} days ago`;
}

function statusColor(status) {
  if (status === 'Concern Received') return '#d92d20';
  if (status === 'Under Review') return '#f59e0b';
  if (status === 'Responding') return '#2563eb';
  if (status === 'Scheduled') return '#7c3aed';
  if (status === 'In Progress') return '#0ea5e9';
  if (status === 'Resolved') return '#16a34a';
  return '#64748b';
}

function statusLine(issue) {
  if (issue.status === 'Concern Received') return 'Concern has been received.';
  if (issue.status === 'Under Review') return 'Area is under review.';
  if (issue.status === 'Responding') return `${issue.department} is responding.`;
  if (issue.status === 'Scheduled') return `${issue.department} has scheduled work.`;
  if (issue.status === 'In Progress') return `${issue.department} is working on repairs.`;
  if (issue.status === 'Resolved') return 'Issue resolved.';
  return 'Area is under review.';
}

function iconFactory(color) {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background:${color}; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,.18);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function Haptics() {
  const tap = () => {
    try { if (navigator.vibrate) navigator.vibrate(10); } catch {}
  };
  const success = () => {
    try { if (navigator.vibrate) navigator.vibrate([12, 24, 12]); } catch {}
  };
  return { tap, success };
}

function FlyToTarget({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 0.6 });
  }, [target, map]);
  return null;
}

function MapTapLayer({ onTap }) {
  useMapEvents({
    click(e) {
      if (onTap) onTap(e.latlng);
    },
  });

  return null;
}

function SwipeShell({ page, setPage, children }) {
  const startX = useRef(null);
  return (
    <div
      className="app-shell"
      onTouchStart={(e) => { startX.current = e.changedTouches[0].clientX; }}
      onTouchEnd={(e) => {
        if (startX.current == null) return;
        const delta = e.changedTouches[0].clientX - startX.current;
        if (delta < -70 && page === 'home') setPage('command');
        if (delta > 70 && page === 'command') setPage('home');
        startX.current = null;
      }}
    >
      {children}
    </div>
  );
}

function HomeMap({ issues, filter, setFilter, setSelectedIssue, mapMode, onMapTap, target }) {
  const visible = filter === 'All' ? issues : issues.filter((issue) => issue.category === filter);

  return (
    <div className="map-wrap">
      <div className="weather-corner">☀️ 75°</div>

      <div className="legend-inline">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`legend-chip ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <MapContainer
        center={HASTINGS_CENTER}
        zoom={14}
        className="map-container"
        style={{ height: '420px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToTarget target={target} />
        <MapTapLayer onTap={onMapTap} />

        {visible.map((issue) => (
          <React.Fragment key={issue.id}>
            <Circle
              center={[issue.lat, issue.lng]}
              radius={issue.status === 'Resolved' ? 46 : 60}
              pathOptions={{
                color: statusColor(issue.status),
                fillColor: statusColor(issue.status),
                fillOpacity: issue.status === 'Resolved' ? 0.12 : 0.18,
                weight: 0,
              }}
            />
            <Marker
              position={[issue.lat, issue.lng]}
              icon={iconFactory(statusColor(issue.status))}
              eventHandlers={{
                click: () => setSelectedIssue(issue),
              }}
            >
              <Popup>{issue.title}</Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      <div className="map-hint">
        {mapMode === 'report' && 'Tap where the problem is'}
        {mapMode === 'update' && 'Tap a location or pin to update status'}
        {mapMode === 'view' && 'Tap a pin to view details'}
      </div>
    </div>
  );
}

function SummaryBox({ issues }) {
  const lines = useMemo(() => {
    const flagship = issues.filter((issue) => issue.flagship).slice(0, 3);
    if (flagship.length) return flagship.map((issue) => `${issue.title} ${statusLine(issue)}`);
    return ['Most areas look stable right now.', 'One issue is under review.', 'The city is updating work as it happens.'];
  }, [issues]);

  return (
    <div className="ai-summary-clean">
      <div className="summary-label">Right Now in Hastings</div>
      {lines.map((line) => <div key={line} className="summary-line">{line}</div>)}
    </div>
  );
}

function Rolodex({ issues, active, setActive, onExpand }) {
  const touchStart = useRef(null);

  if (!active || !issues.length) return null;

  const index = issues.findIndex((issue) => issue.id === active.id);
  if (index < 0) return null;

  const current = issues[index];
  const prev = issues[(index - 1 + issues.length) % issues.length];
  const next = issues[(index + 1) % issues.length];

  return (
    <div
      className="rolodex-wrap"
      onTouchStart={(e) => { touchStart.current = e.changedTouches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const delta = e.changedTouches[0].clientX - touchStart.current;
        if (delta < -40) setActive(next);
        if (delta > 40) setActive(prev);
        touchStart.current = null;
      }}
    >
      <div className="stack-card behind">{prev.title}</div>
      <div className="stack-card behind right">{next.title}</div>
      <div className="stack-card front" onClick={() => onExpand(current)}>
        <div className="stack-status" style={{ color: statusColor(current.status) }}>{current.status}</div>
        <div className="stack-title">{current.title}</div>
        <div className="stack-line">{statusLine(current)}</div>
        <div className="stack-foot">{toUpdatedLabel(current.updatedAt)}</div>
      </div>
    </div>
  );
}

function DetailSheet({ issue, onClose }) {
  if (!issue) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="sheet-image">{issue.locationName}</div>
        <div className="sheet-title">{issue.title}</div>
        <div className="sheet-status" style={{ color: statusColor(issue.status) }}>{issue.status}</div>
        <div className="sheet-body">{issue.description}</div>
        <div className="sheet-body">{statusLine(issue)}</div>
        <div className="sheet-body subtle">{toUpdatedLabel(issue.updatedAt)}</div>
      </div>
    </div>
  );
}

function ReportFlow({ open, point, setPoint, onClose, onSubmit }) {
  const { tap, success } = Haptics();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [voiceError, setVoiceError] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(0);
      setCategory('');
      setText('');
      setPhotoName('');
      setVoiceError('');
    }
  }, [open]);

  useEffect(() => {
    if (open && point && step === 0) {
      tap();
      setStep(1);
    }
  }, [open, point, step]);

  if (!open) return null;

  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError('Voice input is not available on this browser.');
      return;
    }

    const rec = new Recognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      setText(event.results[0][0].transcript || '');
      tap();
    };
    rec.onerror = () => setVoiceError('Voice input did not work. You can type instead.');
    rec.start();
  };

  return (
    <div
      onClick={() => {
        setPoint(null);
        onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          padding: '24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={() => {
            setPoint(null);
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '999px',
            border: 'none',
            background: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '22px',
            lineHeight: '36px',
          }}
        >
          ×
        </button>

        {step === 0 && (
          <>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              Tap where the problem is
            </div>
            <div style={{ color: '#475569' }}>Tap the map to place a pin.</div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
              What’s happening here?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    tap();
                    setStep(2);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: category === cat ? '#0f172a' : '#fff',
                    color: category === cat ? '#fff' : '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
              Describe briefly
            </div>
            <button
              onClick={startVoice}
              style={{
                border: 'none',
                background: '#e2e8f0',
                borderRadius: '999px',
                width: '52px',
                height: '52px',
                fontSize: '22px',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              🎤
            </button>
            <div
              onClick={() => document.getElementById('report-text')?.focus()}
              style={{ marginBottom: '12px', color: '#2563eb', cursor: 'pointer' }}
            >
              or type instead
            </div>
            <textarea
              id="report-text"
              placeholder="Describe briefly…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                padding: '12px',
                fontSize: '16px',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />
            {voiceError && <div style={{ color: '#dc2626', marginBottom: '12px' }}>{voiceError}</div>}
            <button
              disabled={!text.trim()}
              onClick={() => {
                tap();
                setStep(3);
              }}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: !text.trim() ? '#cbd5e1' : '#0f172a',
                color: '#ffffff',
                cursor: !text.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
              Add a photo (optional)
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setPhotoName(e.target.files?.[0]?.name || '');
                tap();
              }}
              style={{ marginBottom: '12px' }}
            />
            {photoName && <div style={{ color: '#475569', marginBottom: '12px' }}>{photoName}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
              Confirm & submit
            </div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div><strong>Category:</strong> {category}</div>
              <div><strong>Description:</strong> {text}</div>
              <div><strong>Location:</strong> {point ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : 'Map pin selected'}</div>
            </div>
            <button
              onClick={() => {
                success();
                onSubmit({ category, text, point, photoName });
                setStep(5);
              }}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              Thanks—your report helps improve Hastings
            </div>
            <div style={{ color: '#475569', marginBottom: '16px' }}>Report received</div>
            <button
              onClick={() => {
                setPoint(null);
                onClose();
              }}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UpdateFlow({ open, point, selectedIssue, setPoint, onClose, onSubmit }) {
  const { tap, success } = Haptics();
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setStatus('');
      setNote('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="sheet-backdrop">
      <div className="report-card">
        <button className="close-btn" onClick={() => { setPoint(null); onClose(); }}>×</button>
        <div className="report-title">Update what’s happening</div>
        <div className="report-sub">
          {selectedIssue ? selectedIssue.title : 'Tap a location or pin, then choose a status.'}
        </div>

        <div className="tile-grid">
          {['Responding', 'In Progress', 'Resolved'].map((itemStatus) => (
            <button
              key={itemStatus}
              className={`tile ${status === itemStatus ? 'active' : ''}`}
              onClick={() => {
                setStatus(itemStatus);
                tap();
              }}
            >
              {itemStatus}
            </button>
          ))}
        </div>

        <textarea
          className="text-input"
          placeholder="Add note (optional)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          className="primary-btn"
          disabled={!status}
          onClick={() => {
            success();
            onSubmit({ point, selectedIssue, status, note });
            setPoint(null);
            onClose();
          }}
        >
          Update city now
        </button>
      </div>
    </div>
  );
}

function CommandCenter({ issuesNeedingReview, onApprove, onHold, onBack }) {
  const [selected, setSelected] = useState(issuesNeedingReview[0] || null);

  useEffect(() => {
    if (!selected && issuesNeedingReview.length) setSelected(issuesNeedingReview[0]);
    if (selected && !issuesNeedingReview.find((i) => i.id === selected.id)) {
      setSelected(issuesNeedingReview[0] || null);
    }
  }, [issuesNeedingReview, selected]);

  if (!selected) {
    return (
      <div className="command-screen">
        <div className="topbar">
          <div className="brand-title">Hastings Community Pulse</div>
          <div className="brand-sub">Powered by PublicPulse • Pilot</div>
        </div>
        <div className="command-header">
          <div>
            <div className="panel-kicker">Command Center</div>
            <div className="panel-title">Nothing needs review right now</div>
          </div>
          <button className="back-pill" onClick={onBack}>Back to map</button>
        </div>
      </div>
    );
  }

  return (
    <div className="command-screen">
      <div className="topbar">
        <div className="brand-title">Hastings Community Pulse</div>
        <div className="brand-sub">Powered by PublicPulse • Pilot</div>
      </div>

      <div className="command-header">
        <div>
          <div className="panel-kicker">Command Center</div>
          <div className="panel-title">Next best decision</div>
        </div>
        <button className="back-pill" onClick={onBack}>Back to map</button>
      </div>

      <div className="command-grid">
        <section className="panel">
          <div className="panel-kicker">What needs attention</div>
          {issuesNeedingReview.map((issue) => (
            <button
              key={issue.id}
              className={`issue-row ${selected.id === issue.id ? 'active' : ''}`}
              onClick={() => setSelected(issue)}
            >
              <div className="issue-row-title">{issue.title}</div>
              <div className="issue-row-meta">{issue.reports} reports • {issue.traffic} traffic • {issue.safety} risk</div>
            </button>
          ))}
        </section>

        <section className="panel center-panel">
          <div className="panel-kicker">Next move</div>
          <div className="decision-note">Based on current conditions</div>
          <div className="decision-option">
            <div className="decision-option-title">{selected.recommendation.title}</div>
            <div className="decision-option-sub">{selected.locationName}</div>
          </div>
          <div className="reason-list">
            {selected.recommendation.reasons.map((r) => <div key={r} className="reason-pill">{r}</div>)}
          </div>
          <div className="delay-box">{selected.recommendation.delay}</div>
          <div className="row-actions">
            <button className="primary-btn compact" onClick={() => onApprove(selected.id)}>Approve</button>
            <button className="ghost-btn compact" onClick={() => onHold(selected.id)}>Hold</button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-kicker">Budget impact</div>
          <div className="budget-line"><span>Estimated cost</span><strong>{selected.estimatedCost}</strong></div>
          <div className="budget-line"><span>If delayed</span><strong>{selected.delayCost}</strong></div>
          <div className="budget-line"><span>Last similar repair</span><strong>{selected.lastCost}</strong></div>
          <div className="budget-box">
            <div className="budget-box-kicker">Needs review</div>
            <div className="budget-box-value">{selected.department}</div>
            <div className="budget-box-sub">Approve work or hold for later.</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [issues, setIssues] = useState(seedIssues);
  const [filter, setFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [detailIssue, setDetailIssue] = useState(null);
  const [mapMode, setMapMode] = useState('view');
  const [mapTarget, setMapTarget] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportPoint, setReportPoint] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updatePoint, setUpdatePoint] = useState(null);
  const [updateIssue, setUpdateIssue] = useState(null);
  const [toast, setToast] = useState('');

  const visibleIssues = filter === 'All'
    ? issues
    : issues.filter((issue) => issue.category === filter);

  const issuesNeedingReview = useMemo(
    () => issues.filter(
      (issue) => issue.requiresApproval && (
        issue.status === 'Concern Received' || issue.status === 'Under Review'
      )
    ),
    [issues]
  );

  const showToast = (message) => {
    setToast(message);
    clearTimeout(window.__pp_toast);
    window.__pp_toast = setTimeout(() => setToast(''), 2200);
  };

  const handleMapTap = (latlng) => {
    if (mapMode === 'report') {
      setReportPoint(latlng);
      setMapTarget([latlng.lat, latlng.lng]);
      setReportOpen(true);
      showToast('Location selected');
    } else if (mapMode === 'update') {
      setUpdatePoint(latlng);
      setMapTarget([latlng.lat, latlng.lng]);
      setUpdateIssue(null);
      setUpdateOpen(true);
    }
  };

  const handleReportSubmit = ({ category, text, point }) => {
    const department =
      category === 'Drainage' || category === 'Gas / Sewer'
        ? 'Hastings Utilities'
        : category === 'Traffic'
          ? 'Hastings Police'
          : category === 'Parks'
            ? 'City Parks'
            : 'Public Works';

    const newIssue = {
      id: Date.now(),
      title: text.charAt(0).toUpperCase() + text.slice(1),
      description: text,
      locationName: 'New report location',
      category,
      status: 'Concern Received',
      department,
      reports: 1,
      traffic: 'Low',
      safety: 'Low',
      lat: point?.lat ?? HASTINGS_CENTER[0],
      lng: point?.lng ?? HASTINGS_CENTER[1],
      updatedAt: Date.now(),
      source: 'resident',
      requiresApproval: true,
      estimatedCost: '$',
      delayCost: '$$',
      lastCost: '$0',
      flagship: false,
      recommendation: {
        title: 'Review reported concern',
        reasons: ['New report', 'Needs verification', 'Public-facing issue'],
        delay: 'If delayed, resident frustration and repeat reports will increase.'
      }
    };

    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssue(newIssue);
    setMapMode('view');
    setReportOpen(false);
    showToast('Report received.');
  };

  const handleDepartmentUpdate = ({ point, selectedIssue: chosenIssue, status, note }) => {
    if (chosenIssue) {
      setIssues((prev) => prev.map((issue) => (
        issue.id === chosenIssue.id
          ? {
              ...issue,
              status,
              updatedAt: Date.now(),
              description: note?.trim() ? note : issue.description
            }
          : issue
      )));
      showToast('City update posted.');
      return;
    }

    const newUpdate = {
      id: Date.now(),
      title: note?.trim() ? note : 'City work is underway in this area.',
      description: note?.trim() ? note : 'Visible city work has been posted.',
      locationName: 'City update',
      category: 'General',
      status,
      department: 'City team',
      reports: 0,
      traffic: 'Low',
      safety: 'Low',
      lat: point?.lat ?? HASTINGS_CENTER[0],
      lng: point?.lng ?? HASTINGS_CENTER[1],
      updatedAt: Date.now(),
      source: 'department',
      requiresApproval: status === 'Under Review',
      estimatedCost: '$$',
      delayCost: '$$$',
      lastCost: '$0',
      flagship: false,
      recommendation: {
        title: 'Review department update',
        reasons: ['Department-initiated', 'Visible city work', 'Needs city awareness'],
        delay: 'If delayed, public confusion and duplicate reports may increase.'
      }
    };

    setIssues((prev) => [newUpdate, ...prev]);
    setSelectedIssue(newUpdate);
    showToast('City update posted.');
  };

  const handleApprove = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? {
            ...issue,
            status: issue.status === 'Concern Received' ? 'Under Review' : 'Responding',
            updatedAt: Date.now(),
            requiresApproval: false
          }
        : issue
    )));
    showToast('Approved.');
  };

  const handleHold = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId ? { ...issue, updatedAt: Date.now() } : issue
    )));
    showToast('Held for later review.');
  };

  return (
    <SwipeShell page={page} setPage={setPage}>
      {page === 'home' ? (
        <div className="home-screen">
          <div className="topbar home-topbar">
            <div className="brand-title">Hastings Community Pulse</div>
            <div className="brand-sub">Powered by PublicPulse • Pilot</div>
          </div>

          <div className="homepage-map-shell">
            <HomeMap
              issues={issues.map((issue) => ({ ...issue, updatedLabel: toUpdatedLabel(issue.updatedAt) }))}
              filter={filter}
              setFilter={setFilter}
              setSelectedIssue={(issue) => {
                setSelectedIssue(issue);
                if (mapMode === 'update') {
                  setUpdateIssue(issue);
                  setUpdateOpen(true);
                }
              }}
              mapMode={mapMode}
              onMapTap={handleMapTap}
              target={mapTarget}
            />
          </div>

          <SummaryBox issues={issues} />

          {selectedIssue && mapMode === 'view' && (
            <Rolodex
              issues={visibleIssues}
              active={selectedIssue}
              setActive={setSelectedIssue}
              onExpand={setDetailIssue}
            />
          )}

          <div className="home-footer">
            <button
              className={`nav-pill report ${mapMode === 'report' ? 'active-alt' : ''}`}
              onClick={() => {
                setMapMode('report');
                setReportOpen(false);
                setReportPoint(null);
                setSelectedIssue(null);
                showToast('Tap the map to place a pin.');
              }}
            >
              Report
            </button>
          </div>
        </div>
      ) : (
        <CommandCenter
          issuesNeedingReview={issuesNeedingReview.map((issue) => ({ ...issue, updatedLabel: toUpdatedLabel(issue.updatedAt) }))}
          onApprove={handleApprove}
          onHold={handleHold}
          onBack={() => setPage('home')}
        />
      )}

      <ReportFlow
        open={reportOpen}
        point={reportPoint}
        setPoint={setReportPoint}
        onClose={() => {
          setReportOpen(false);
          setMapMode('view');
        }}
        onSubmit={handleReportSubmit}
      />

      <UpdateFlow
        open={updateOpen}
        point={updatePoint}
        selectedIssue={updateIssue}
        setPoint={setUpdatePoint}
        onClose={() => {
          setUpdateOpen(false);
          setMapMode('view');
        }}
        onSubmit={handleDepartmentUpdate}
      />

      <DetailSheet
        issue={detailIssue ? { ...detailIssue, updatedLabel: toUpdatedLabel(detailIssue.updatedAt) } : null}
        onClose={() => setDetailIssue(null)}
      />

      {toast && <div className="toast">{toast}</div>}
    </SwipeShell>
  );
}