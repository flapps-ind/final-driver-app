"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* -------------------------------------------------------------------------- */
/*                              LEAFLET ICON FIX                              */
/* -------------------------------------------------------------------------- */

const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

/* -------------------------------------------------------------------------- */
/*                                 CUSTOM ICONS                               */
/* -------------------------------------------------------------------------- */

const AmbulanceIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:24px;
      height:24px;
      background:#00ffcc;
      border:2px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 0 15px rgba(0,255,204,0.4);
      animation: cyanPulse 2s infinite;
    ">
      <div style="width:8px; height:8px; background:white; border-radius:50%;"></div>
    </div>
    <style>
      @keyframes cyanPulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(0, 255, 204, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0); }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DestinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:24px;
      height:24px;
      background:#ff3b30;
      border:2px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 0 20px rgba(255,59,48,0.6);
      animation: pulse 2s infinite;
    ">
      <div style="width:8px; height:8px; background:white; border-radius:50%;"></div>
    </div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(255, 59, 48, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const SearchIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:24px;
      height:24px;
      background:#6366f1;
      border:2px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 0 15px rgba(99,102,241,0.4);
    ">
      <div style="width:8px; height:8px; background:white; border-radius:50%;"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface MapProps {
  driverLocation: [number, number];
  destination?: [number, number] | null;
  searchLocation?: [number, number] | null;
  routeCoords?: [number, number][];
}

/* -------------------------------------------------------------------------- */
/*                              RECENTER COMPONENT                            */
/* -------------------------------------------------------------------------- */

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (
      !Number.isFinite(coords[0]) ||
      !Number.isFinite(coords[1])
    ) {
      return;
    }

    map.setView(coords, 15);
  }, [coords, map]);

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                MAP COMPONENT                               */
/* -------------------------------------------------------------------------- */

const MapComponent = ({
  driverLocation,
  destination,
  searchLocation,
  routeCoords,
}: MapProps) => {
  return (
    <MapContainer
      center={driverLocation}
      zoom={15}
      scrollWheelZoom
      zoomControl={false}
      className="w-full h-full"
      style={{ background: "#0f172a" }}
    >
      <RecenterMap coords={searchLocation || destination || driverLocation} />

      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ZoomControl position="bottomright" />

      {/* Driver */}
      <Marker position={driverLocation} icon={AmbulanceIcon}>
        <Popup>You (Ambulance)</Popup>
      </Marker>

      {/* Destination */}
      {destination && (
        <Marker position={destination} icon={DestinationIcon}>
          <Popup>Emergency Location</Popup>
        </Marker>
      )}

      {/* Search Result */}
      {searchLocation && (
        <Marker position={searchLocation} icon={SearchIcon}>
          <Popup>Search Result</Popup>
        </Marker>
      )}

      {/* Route */}
      {routeCoords && routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#00ffcc",
            weight: 5,
            opacity: 0.6,
            lineJoin: "round",
          }}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
