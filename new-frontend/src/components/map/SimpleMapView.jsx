import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Component to update map center when it changes
function MapCenterUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

export default function SimpleMapView({
  tileUrl,
  opacity = 0.7,
  center = [-31.4, -64.2],
  zoom = 8,
  baseMapUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  baseMapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "calc(100vh - 80px)", width: "100%" }}
      zoomControl={true}
    >
      <MapCenterUpdater center={center} />
      
      {/* Base map layer */}
      <TileLayer
        url={baseMapUrl}
        attribution={baseMapAttribution}
        zIndex={1}
      />
      
      {/* Radar overlay layer */}
      {tileUrl && (
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          opacity={opacity}
          zIndex={500}
          tileSize={256}
          crossOrigin="anonymous"
        />
      )}
    </MapContainer>
  );
}
