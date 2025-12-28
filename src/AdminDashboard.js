import React, { useState } from "react";
import AdminIncidentCard from "./AdminIncidentCard";
import AdminIncidentDetails from "./AdminIncidentDetails";

export default function AdminDashboard({ incidents, switchToUser }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f4f7fb",
        minHeight: "100vh",
      }}
    >
      {/* 🔝 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>🛂 Emergency Admin Dashboard</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Monitor incidents and track departmental response in real time
          </p>
        </div>

        <button
          onClick={switchToUser}
          style={{
            padding: "10px 16px",
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          👤 Back to Citizen View
        </button>
      </div>

      {/* 🧩 MAIN LAYOUT */}
      <div style={{ display: "flex", gap: "24px" }}>
        {/* 📋 LEFT PANEL — INCIDENT QUEUE */}
        <div
          style={{
            width: "28%",
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            maxHeight: "calc(100vh - 140px)",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>🚨 Incident Queue</h3>

          {incidents.length === 0 && (
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              No incidents reported yet.
            </p>
          )}

          {incidents.map((incident, index) => (
            <div
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              style={{
                cursor: "pointer",
                borderRadius: "10px",
                border:
                  selectedIncident?.id === incident.id
                    ? "2px solid #ef4444"
                    : "1px solid #e5e7eb",
                background:
                  selectedIncident?.id === incident.id
                    ? "#fff1f2"
                    : "#ffffff",
                marginBottom: "12px",
                padding: "12px",
              }}
            >
              <strong>Report {index + 1}</strong>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#475569",
                }}
              >
                Type: {incident.type}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {new Date(incident.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* 📄 RIGHT PANEL — DETAILS */}
        <div
          style={{
            width: "72%",
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          }}
        >
          {selectedIncident ? (
            <AdminIncidentDetails incident={selectedIncident} />
          ) : (
            <div style={{ color: "#64748b", fontSize: "15px" }}>
              <p style={{ fontWeight: "600" }}>
                👈 Select an incident from the left
              </p>
              <p>
                View full incident details, uploaded media, and update the
                response status of police, hospital, and fire departments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
