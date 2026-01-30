"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon issue in SSR/Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const AmbulanceIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div class="w-8 h-8 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M19 19v-6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v6"></path><path d="M19 19h-3a1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H4"></path><path d="M3 13h18l1-8H2l1 8Z"></path><circle cx="6" cy="19" r="2"></circle><circle cx="18" cy="19" r="2"></circle></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const DestinationIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div class="w-8 h-8 bg-destructive border-2 border-white rounded-full flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

interface MapProps {
    driverLocation: [number, number];
    destination?: [number, number] | null;
    routeCoords?: [number, number][];
}

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(coords, map.getZoom());
    }, [coords, map]);
    return null;
};

const MapComponent = ({ driverLocation, destination, routeCoords }: MapProps) => {
    return (
        <MapContainer
            center={driverLocation}
            zoom={15}
            scrollWheelZoom={true}
            zoomControl={false}
            className="w-full h-full z-0 bg-[#1a1f2e]"
            style={{ background: '#1a1f2e' }}
        >
            <RecenterMap coords={driverLocation} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <ZoomControl position="bottomright" />

            {/* Driver Marker */}
            <Marker position={driverLocation} icon={AmbulanceIcon}>
                <Popup>Unit 402 (You)</Popup>
            </Marker>

            {/* Destination Marker */}
            {destination && (
                <Marker position={destination} icon={DestinationIcon}>
                    <Popup>Emergency Location</Popup>
                </Marker>
            )}

            {/* Route Line */}
            {routeCoords && (
                <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: '#3dd68c', weight: 4, opacity: 0.8, lineCap: 'round' }}
                />
            )}
        </MapContainer>
    );
};

export default MapComponent;
