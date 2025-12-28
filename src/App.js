import React, { useState } from "react";
import IncidentReportForm from "./IncidentReportForm";
import AdminDashboard from "./AdminDashboard";

export default function App() {
  const [view, setView] = useState("user");
  const [allIncidents, setAllIncidents] = useState([]);

  if (view === "user") {
    return (
      <IncidentReportForm
        setAllIncidents={setAllIncidents}
        switchToAdmin={() => setView("admin")}
      />
    );
  }

  return (
    <AdminDashboard
      incidents={allIncidents}
      switchToUser={() => setView("user")}
    />
  );
}
