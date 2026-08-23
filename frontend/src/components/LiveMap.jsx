import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

const ambulanceIcon = new L.DivIcon({
  html: `<div style="background:#B70011;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35);border:3px solid white;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 8h-3V4H8v4H5c-1.1 0-2 .9-2 2v7h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM9 5h4v3H9V5zm-1 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
  </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#0051D5;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35);border:3px solid white;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg>
  </div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
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

// Fetch real road-following route from OSRM's free public routing server
function useRoadRoute(from, to) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      return;
    }
    const controller = new AbortController();
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(coords);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return route;
}

export default function LiveMap({ userLocation, driverLocation, height = "340px", zoom = 14 }) {
  const center = driverLocation || userLocation || { lat: 20.5937, lng: 78.9629 };
  const roadRoute = useRoadRoute(driverLocation, userLocation);

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

        {roadRoute ? (
          <Polyline positions={roadRoute} color="#0051D5" weight={5} opacity={0.8} />
        ) : userLocation && driverLocation ? (
          <Polyline
            positions={[[driverLocation.lat, driverLocation.lng], [userLocation.lat, userLocation.lng]]}
            color="#B70011"
            weight={4}
            opacity={0.6}
            dashArray="8,8"
          />
        ) : null}
      </MapContainer>
    </div>
  );
}