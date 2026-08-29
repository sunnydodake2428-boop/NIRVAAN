import { useEffect, useRef, useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";

const rasterStyle = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm-layer", type: "raster", source: "osm" }],
};

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
          setRoute(data.routes[0].geometry);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return route;
}

function getBounds(p1, p2) {
  const lngs = [p1.lng, p2.lng];
  const lats = [p1.lat, p2.lat];
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export default function LiveMap({ userLocation, driverLocation, height = "340px", zoom = 14 }) {
  const mapRef = useRef();
  const center = driverLocation || userLocation || { lat: 20.5937, lng: 78.9629 };
  const roadRoute = useRoadRoute(driverLocation, userLocation);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    if (userLocation && driverLocation) {
  const bounds = getBounds(userLocation, driverLocation);
  try {
    mapRef.current.fitBounds(bounds, { padding: 40, duration: 800, maxZoom: 15 });
  } catch (err) {
    console.error("fitBounds failed:", err);
  }
}else if (driverLocation) {
      mapRef.current.flyTo({ center: [driverLocation.lng, driverLocation.lat], zoom: 14, duration: 800 });
    } else if (userLocation) {
      mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14, duration: 800 });
    }
  }, [userLocation?.lat, userLocation?.lng, driverLocation?.lat, driverLocation?.lng, loaded]);

  return (
    <div
      style={{ height, width: "100%", minHeight: "300px", position: "relative" }}
      className="rounded-xl overflow-hidden shadow-sm border border-nirvaan-surface-high"
    >
     <Map
  ref={mapRef}
  initialViewState={{ longitude: center.lng, latitude: center.lat, zoom }}
  mapStyle={rasterStyle}
  style={{ width: "100%", height: "100%" }}
  onLoad={() => setLoaded(true)}
  onError={(e) => console.error("MapLibre error:", e.error)}
>
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div
              style={{
                background: "#0051D5",
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
                border: "3px solid white",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />
            </div>
          </Marker>
        )}

        {driverLocation && (
          <Marker longitude={driverLocation.lng} latitude={driverLocation.lat} anchor="center">
            <div
              style={{
                background: "#B70011",
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
                border: "3px solid white",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 8h-3V4H8v4H5c-1.1 0-2 .9-2 2v7h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM9 5h4v3H9V5zm-1 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
          </Marker>
        )}

      {userLocation && driverLocation && (
  <Source id="route" type="geojson" data={{
    type: "Feature",
    geometry: roadRoute || {
      type: "LineString",
      coordinates: [[driverLocation.lng, driverLocation.lat], [userLocation.lng, userLocation.lat]],
    },
  }}>
    <Layer
      id="route-line"
      type="line"
      layout={{ "line-join": "round", "line-cap": "round" }}
      paint={{ "line-color": "#0051D5", "line-width": 6, "line-opacity": 1 }}
    />
  </Source>
)}
      </Map>

      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: 4,
          background: "yellow",
          fontSize: 10,
          padding: "2px 6px",
          zIndex: 999,
          borderRadius: 4,
        }}
      >
        Route: {roadRoute ? "LOADED" : "NULL"}
      </div>
    </div>
  );
}