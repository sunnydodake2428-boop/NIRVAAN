import { useEffect, useRef, useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";

const rasterStyle = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm-layer", type: "raster", source: "osm" }],
};

function useRoadRoute(from, to) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
      return;
    }

    const controller = new AbortController();
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

    console.log("Fetching route:", url);

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        console.log("Route response:", data);
        if (data.routes && data.routes[0]) {
          setRoute(data.routes[0].geometry);
        }
      })
      .catch((err) => {
        console.error("Route fetch error:", err);
      });

    return () => controller.abort();
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return route;
}

export default function LiveMap({ userLocation, driverLocation, height = "340px", zoom = 14 }) {
  const mapRef = useRef();
  const center = driverLocation || userLocation || { lat: 20.5937, lng: 78.9629 };
  const roadRoute = useRoadRoute(driverLocation, userLocation);

  useEffect(() => {
    if (driverLocation && mapRef.current) {
      mapRef.current.flyTo({ center: [driverLocation.lng, driverLocation.lat], duration: 800 });
    }
  }, [driverLocation]);

  return (
    <div
      style={{ height, width: "100%", minHeight: "300px" }}
      className="rounded-xl overflow-hidden shadow-sm border border-nirvaan-surface-high"
    >
      <Map
        ref={mapRef}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom }}
        mapStyle={rasterStyle}
        style={{ width: "100%", height: "100%" }}
      >
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div style={{ background: "#0051D5", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.35)", border: "3px solid white" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />
            </div>
          </Marker>
        )}

        {driverLocation && (
          <Marker longitude={driverLocation.lng} latitude={driverLocation.lat} anchor="center">
            <div style={{ background: "#B70011", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.35)", border: "3px solid white" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 8h-3V4H8v4H5c-1.1 0-2 .9-2 2v7h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM9 5h4v3H9V5zm-1 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
          </Marker>
        )}

        {roadRoute && (
          <Source id="route" type="geojson" data={{ type: "Feature", geometry: roadRoute }}>
            <Layer id="route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }} paint={{ "line-color": "#0051D5", "line-width": 5, "line-opacity": 0.85 }} />
          </Source>
        )}
      </Map>
    </div>
  );
}