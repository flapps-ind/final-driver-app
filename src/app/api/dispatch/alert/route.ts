"use client";

import { useEffect, useState } from "react";

type EmergencyLocation = {
  latitude: number;
  longitude: number;
  updated_at: string;
};

export default function DispatchAlertsPage() {
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/emergency", {
          cache: "no-store",
        });

        const data = await res.json();
        setLocation(data.location);
      } catch (err) {
        console.error("Failed to fetch emergency location", err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchEmergency();

    // Poll every 5 seconds
    const interval = setInterval(fetchEmergency, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Loading emergency alerts…</h2>
      </div>
    );
  }

  if (!location) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No active emergencies</h2>
        <p>Waiting for SOS signal…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>🚨 Active Emergency Alert</h1>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
          maxWidth: 400,
        }}
      >
        <p><strong>Status:</strong> Active</p>
        <p><strong>Latitude:</strong> {location.latitude}</p>
        <p><strong>Longitude:</strong> {location.longitude}</p>
        <p><strong>Last Updated:</strong> {new Date(location.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
}