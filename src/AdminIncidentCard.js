import React from "react";

export default function AdminIncidentCard({ incident, index, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "8px",
        cursor: "pointer",
        background: "#f9f9f9",
      }}
    >
      <b>Report {index + 1}</b>
      <p>Type: {incident.type}</p>
      <p>{new Date(incident.timestamp).toLocaleString()}</p>
    </div>
  );
}
