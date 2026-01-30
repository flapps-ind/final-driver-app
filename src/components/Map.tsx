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
      width:32px;
      height:32px;
      background:#22c55e;
      border:2px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 0 10px rgba(0,0,0,0.4);
    ">
      🚑
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DestinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:32px;
      height:32px;
      background:#ef4444;
      border:2px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 0 10px rgba(0,0,0,0.4);
    ">
      📍
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface MapProps {
  driverLocation: [number, number];
  destination?: [number, number] | null;
  routeCoords?: [number, number][];
}

/* -------------------------------------------------------------------------- */
/*                              RECENTER COMPONENT                            */
/* -------------------------------------------------------------------------- */

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (
      hasCentered.current ||
      !Number.isFinite(coords[0]) ||
      !Number.isFinite(coords[1])
    ) {
      return;
    }

    map.setView(coords, 15, { animate: false });
    hasCentered.current = true;
  }, [coords, map]);

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                MAP COMPONENT                               */
/* -------------------------------------------------------------------------- */

const MapComponent = ({
  driverLocation,
  destination,
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
      <RecenterMap coords={driverLocation} />

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

      {/* Route */}
      {routeCoords && routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#3dd68c",
            weight: 4,
            opacity: 0.85,
          }}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
