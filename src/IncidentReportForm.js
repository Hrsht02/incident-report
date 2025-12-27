import React, { useState } from "react";

/* 📐 Distance calculation (Haversine) */
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function IncidentReportForm() {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [media, setMedia] = useState(null);

  const [existingIncidents, setExistingIncidents] = useState([]);
  const [nearbyIncident, setNearbyIncident] = useState(null);
  const [forceSubmit, setForceSubmit] = useState(false);

  /* 📍 Get GPS */
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );
  };

  /* 🚨 Final submit */
  const submitIncident = () => {
    const newIncident = {
      id: Date.now().toString(),
      type,
      description,
      location,
      timestamp: new Date().toISOString(),
      media,
    };

    setExistingIncidents([...existingIncidents, newIncident]);
    setNearbyIncident(null);
    setForceSubmit(false);

    alert("Incident reported successfully");

    // reset form
    setType("");
    setDescription("");
    setMedia(null);
  };

  /* 🧠 Submit handler */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!type || !description || !location) {
      alert("Please fill all required fields");
      return;
    }

    if (!forceSubmit) {
      for (let incident of existingIncidents) {
        const distance = getDistanceInMeters(
          location.latitude,
          location.longitude,
          incident.location.latitude,
          incident.location.longitude
        );

        if (distance <= 100) {
          setNearbyIncident(incident);
          return;
        }
      }
    }

    submitIncident();
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <label>Incident Type *</label>
        <select
          value={type}
          required
          onChange={(e) => setType(e.target.value)}
        >
          <option value="" disabled>
            -- Select Incident Type --
          </option>
          <option value="fire">Fire</option>
          <option value="accident">Accident</option>
          <option value="medical">Medical Emergency</option>
          <option value="infrastructure">Infrastructure Issue</option>
          <option value="public_safety">Public Safety</option>
        </select>

        <label>Description *</label>
        <textarea
          placeholder="Describe the incident"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Location (GPS) *</label>
        <button type="button" onClick={getLocation}>
          Get My Location
        </button>

        {location && (
          <p>
            Lat: {location.latitude}, Lng: {location.longitude}
          </p>
        )}

        <label>Upload Media (Image / Video)</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMedia(e.target.files[0])}
        />

        <button type="submit">Submit Incident</button>
      </form>

      {/* ⚠ DUPLICATE INCIDENT WARNING */}
      {nearbyIncident && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px",
            border: "2px solid red",
            borderRadius: "6px",
            background: "#fff0f0",
          }}
        >
          <p>
            ⚠ <b>An incident is already reported within 100 meters.</b>
          </p>

          <p>
            <b>Type:</b> {nearbyIncident.type}
            <br />
            <b>Description:</b> {nearbyIncident.description}
            <br />
            <b>Reported At:</b>{" "}
            {new Date(nearbyIncident.timestamp).toLocaleString()}
          </p>

          <button onClick={submitIncident}>
            Yes, this is the same incident
          </button>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setForceSubmit(true);
              submitIncident();
            }}
          >
            Other incident
          </button>
        </div>
      )}
    </>
  );
}
