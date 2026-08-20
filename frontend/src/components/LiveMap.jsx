import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const ambulanceIcon = new L.DivIcon({
  html: `<div style="background:#B70011;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;font-size:18px;">🚑</div>`,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#0051D5;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;"></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng]);
  return null;
}

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function LiveMap({ userLocation, driverLocation, height = "340px", zoom = 14 }) {
  const center = driverLocation || userLocation || { lat: 20.5937, lng: 78.9629 };
  const route =
    userLocation && driverLocation
      ? [[driverLocation.lat, driverLocation.lng], [userLocation.lat, userLocation.lng]]
      : null;

  return (
    <div
      style={{ height, width: "100%", minHeight: "300px" }}
      className="rounded-xl overflow-hidden shadow-sm border border-nirvaan-surface-high"
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <InvalidateSizeOnMount />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {driverLocation && (
          <>
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={ambulanceIcon}>
              <Popup>Ambulance</Popup>
            </Marker>
            <Recenter lat={driverLocation.lat} lng={driverLocation.lng} />
          </>
        )}

        {route && <Polyline positions={route} color="#B70011" weight={4} opacity={0.7} dashArray="8,8" />}
      </MapContainer>
    </div>
  );
}