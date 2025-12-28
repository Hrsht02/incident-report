import React, { useState, useRef } from "react";
import IncidentDispatcher from "./IncidentDispatcher";

/* 📐 Distance */
function getDistance(lat1, lon1, lat2, lon2) {
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

export default function IncidentReportForm({
  setAllIncidents,
  switchToAdmin,
}) {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  const [mediaFile, setMediaFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const [existingIncidents, setExistingIncidents] = useState([]);
  const [nearbyIncident, setNearbyIncident] = useState(null);
  const [pendingIncident, setPendingIncident] = useState(null);

  const [submittedIncident, setSubmittedIncident] = useState(null);

  /* 🎙 Speech-to-text */
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startSpeech = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech not supported");

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setDescription(text);
    };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopSpeech = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  /* 🎧 Audio recorder */
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [recording, setRecording] = useState(false);

  const startAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      audioChunks.current = [];
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopAudio = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* 📍 GPS */
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );
  };

  /* ☁️ Upload helper */
  const uploadToCloudinary = async (file, resourceType = "auto") => {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "incident_upload");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dujdkhbb0/${resourceType}/upload`,
      { method: "POST", body: fd }
    );
    const data = await res.json();
    return data.secure_url;
  };

  /* 🧠 Prepare incident but DO NOT submit yet */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !location) return alert("Missing required fields");

    const prepared = {
      type,
      description,
      location,
      mediaFile,
      audioBlob,
      timestamp: new Date().toISOString(),
    };

    for (let i of existingIncidents) {
      if (
        getDistance(
          location.latitude,
          location.longitude,
          i.location.latitude,
          i.location.longitude
        ) <= 100
      ) {
        setNearbyIncident(i);
        setPendingIncident(prepared);
        return;
      }
    }

    finalizeSubmit(prepared, false);
  };

  /* ✅ Final submit */
  const finalizeSubmit = async (data, same) => {
    const imageUrl = await uploadToCloudinary(data.mediaFile);
    const audioUrl = await uploadToCloudinary(data.audioBlob, "video");

    const newIncident = {
      id: same ? nearbyIncident.id : Date.now().toString(),
      type: data.type,
      description: data.description,
      location: data.location,
      media: imageUrl,
      audio: audioUrl,
      timestamp: data.timestamp,
      updates: same
        ? [...(nearbyIncident.updates || []), data.description]
        : [data.description],
    };

    setAllIncidents((prev) =>
      same
        ? prev.map((i) => (i.id === newIncident.id ? newIncident : i))
        : [...prev, newIncident]
    );

    setExistingIncidents((p) => [...p, newIncident]);
    setSubmittedIncident(newIncident);
    setNearbyIncident(null);
    setPendingIncident(null);
    setDescription("");
    setMediaFile(null);
    setAudioBlob(null);
  };

  return (
    <div className="container">
      <header className="topbar">
        <h2>🚨 Citizen Incident Reporting</h2>
        <button onClick={switchToAdmin} className="admin-btn">
          🛂 Admin Dashboard
        </button>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <label>Incident Type *</label>
        <select required value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select</option>
          <option value="fire">🔥 Fire</option>
          <option value="medical">🚑 Medical</option>
          <option value="accident">🚗 Accident</option>
        </select>

        <label>Description (Text / Voice)</label>
        <textarea
          value={description}
          placeholder="Type or speak…"
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="voice-controls">
          {!listening ? (
            <button type="button" onClick={startSpeech}>
              🎙 Speech to Text
            </button>
          ) : (
            <button type="button" onClick={stopSpeech}>
              ⏹ Stop Speech
            </button>
          )}

          {!recording ? (
            <button type="button" onClick={startAudio}>
              🎧 Record Audio
            </button>
          ) : (
            <button type="button" onClick={stopAudio}>
              ⏹ Stop Audio
            </button>
          )}
        </div>

        <label>Location *</label>
        <button type="button" onClick={getLocation}>
          📍 Get My Location
        </button>

        <label>Upload Image / Video</label>
        <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} />

        <button className="submit-btn">🚨 Submit Incident</button>
      </form>

      {nearbyIncident && pendingIncident && (
        <div className="alert-box">
          <h4>⚠ Incident already reported nearby</h4>
          <p>
            <b>Type:</b> {nearbyIncident.type}
            <br />
            <b>Description:</b> {nearbyIncident.description}
          </p>

          <div className="alert-actions">
            <button onClick={() => finalizeSubmit(pendingIncident, true)}>
              Same Incident
            </button>
            <button onClick={() => finalizeSubmit(pendingIncident, false)}>
              Different Incident
            </button>
          </div>
        </div>
      )}

      {submittedIncident && (
        <IncidentDispatcher incident={submittedIncident} />
      )}
    </div>
  );
}
