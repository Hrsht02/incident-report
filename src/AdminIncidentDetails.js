import React, { useMemo } from "react";

/* 🎨 STATUS CONFIG */
const STATUS_CONFIG = {
  Pending: { color: "#ef4444", label: "Pending" },
  Acknowledged: { color: "#facc15", label: "Acknowledged" },
  Dispatched: { color: "#3b82f6", label: "Dispatched" },
  Resolved: { color: "#22c55e", label: "Resolved" },
};

const STATUS_LIST = Object.keys(STATUS_CONFIG);

/* 🎲 Random status generator */
function randomStatus() {
  return STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)];
}

export default function AdminIncidentDetails({ incident }) {
  /* 🚓 Random but stable status per render */
  const departmentStatus = useMemo(
    () => ({
      police: randomStatus(),
      hospital: randomStatus(),
      fire: randomStatus(),
    }),
    [incident.id]
  );

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          🚨 Incident Details
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Live monitoring of reported incident and department response
        </p>
      </div>

      {/* INCIDENT INFO */}
      <div
        style={{
          background: "#f8fafc",
          padding: "18px",
          borderRadius: "14px",
          marginBottom: "20px",
        }}
      >
        <p>
          <b>Type:</b>{" "}
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            {incident.type.toUpperCase()}
          </span>
        </p>

        <p>
          <b>Description:</b> {incident.description || "—"}
        </p>

        <p>
          <b>Location:</b>
          <br />
          Lat: {incident.location.latitude}
          <br />
          Lng: {incident.location.longitude}
        </p>

        <p>
          <b>Reported At:</b>{" "}
          {new Date(incident.timestamp).toLocaleString()}
        </p>
      </div>

      {/* MEDIA SECTION */}
      {(incident.media || incident.audio) && (
        <div style={{ marginBottom: "20px" }}>
          <h4>📂 Evidence Submitted</h4>

          {incident.media && (
            <div style={{ marginBottom: "12px" }}>
              <img
                src={incident.media}
                alt="incident"
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>
          )}

          {incident.audio && (
            <div>
              <p style={{ fontWeight: 600 }}>🎧 Audio Recording</p>
              <audio controls style={{ width: "100%" }}>
                <source src={incident.audio} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>
      )}

      {/* DEPARTMENT STATUS */}
      <div>
        <h3 style={{ marginBottom: "12px" }}>
          🚓 Department Response Status
        </h3>

        {Object.entries(departmentStatus).map(([dept, status]) => {
          const cfg = STATUS_CONFIG[status];

          return (
            <div
              key={dept}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <b style={{ fontSize: "15px" }}>
                  {dept.toUpperCase()}
                </b>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  Auto-updated system status
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: cfg.color,
                  }}
                />
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
