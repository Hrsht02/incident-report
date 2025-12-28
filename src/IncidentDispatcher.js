import React, { useEffect, useState } from "react";

/* 🌍 Find nearest place using OpenStreetMap (Nominatim) */
async function findNearestPlace(lat, lon, placeType) {
  const query = `
    https://nominatim.openstreetmap.org/search
    ?q=${placeType}
    &format=json
    &limit=1
    &lat=${lat}
    &lon=${lon}
  `.replace(/\s+/g, "");

  const response = await fetch(query, {
    headers: {
      "User-Agent": "incident-reporting-app"
    }
  });

  const data = await response.json();

  if (data.length === 0) return null;

  return {
    name: data[0].display_name,
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

/* 🏢 Dummy station object */
function createDummyStation(type, location, incident) {
  return {
    stationType: type,
    stationName: `${type} Station (Auto-Generated)`,
    stationLocation: location,
    receivedIncident: incident,
    receivedAt: new Date().toISOString(),
  };
}

export default function IncidentDispatcher({ incident }) {
  const [dispatchedTo, setDispatchedTo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!incident || !incident.location) return;

    const dispatchIncident = async () => {
      setLoading(true);
      const targets = [];

      const { latitude, longitude } = incident.location;

      /* 🎯 Routing logic based on incident type */
      if (incident.type === "accident") {
        targets.push("police station", "hospital");
      } else if (incident.type === "medical") {
        targets.push("hospital", "ambulance");
      } else if (incident.type === "fire") {
        targets.push("fire station", "police station");
      } else {
        targets.push("police station");
      }

      const results = [];

      for (let target of targets) {
        const nearest = await findNearestPlace(latitude, longitude, target);

        const dummyStation = createDummyStation(
          target,
          nearest || { latitude, longitude },
          incident
        );

        results.push(dummyStation);
      }

      setDispatchedTo(results);
      setLoading(false);
    };

    dispatchIncident();
  }, [incident]);

  if (!incident) return null;

  return (
    <div style={{ marginTop: "20px", padding: "16px", border: "2px solid #2563eb" }}>
      <h3>🚨 Incident Auto-Dispatched</h3>

      {loading && <p>Finding nearest emergency services...</p>}

      {!loading &&
        dispatchedTo.map((station, index) => (
          <div
            key={index}
            style={{
              marginTop: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <p><b>Department:</b> {station.stationType}</p>
            <p><b>Station Name:</b> {station.stationName}</p>
            <p>
              <b>Station Location:</b><br />
              Lat: {station.stationLocation.latitude}, <br />
              Lng: {station.stationLocation.longitude}
            </p>
            <p><b>Incident Received At:</b> {new Date(station.receivedAt).toLocaleString()}</p>
          </div>
        ))}
    </div>
  );
}
