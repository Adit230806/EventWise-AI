import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { TrafficEvent } from "@/types";
import { priorityHex } from "@/lib/store";

interface Props {
  events: TrafficEvent[];
  onSelect?: (e: TrafficEvent) => void;
  showHotspots?: boolean;
  showRoutes?: boolean;
  center?: [number, number];
  zoom?: number;
}

const makeIcon = (color: string, pulse: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="position:relative;width:28px;height:28px;">
      ${pulse ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.28;animation:ping-ring 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ""}
      <span style="position:absolute;inset:6px;border-radius:9999px;background:${color};box-shadow:0 0 14px ${color};border:2px solid rgba(0,0,0,0.6);"></span>
      <span style="position:absolute;inset:11px;border-radius:9999px;background:rgba(0,0,0,0.85);"></span>
    </div>`,
  });

export default function TrafficMapInner({
  events,
  onSelect,
  showHotspots = true,
  showRoutes = true,
  center = [12.9716, 77.5946],
  zoom = 12,
}: Props) {
  return (
    <MapContainer center={center} zoom={zoom} zoomControl={false} className="h-full w-full" preferCanvas>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {showHotspots &&
        events
          .filter((e) => e.hotspotRisk > 0.6)
          .slice(0, 22)
          .map((e) => (
            <Circle
              key={`hz-${e.id}`}
              center={[e.lat, e.lng]}
              radius={e.affectedRadius * 1.6}
              pathOptions={{
                color: priorityHex(e.priority),
                fillColor: priorityHex(e.priority),
                fillOpacity: 0.08,
                weight: 1,
                opacity: 0.45,
              }}
            />
          ))}
      {showRoutes &&
        events.length > 0 &&
        events.slice(0, 10).map((e, i) => {
          const next = events[(i + 3) % events.length]!;
          return (
            <Polyline
              key={`pl-${e.id}`}
              positions={[
                [e.lat, e.lng],
                [(e.lat + next.lat) / 2 + 0.005, (e.lng + next.lng) / 2 - 0.004],
                [next.lat, next.lng],
              ]}
              pathOptions={{ color: "#bef264", weight: 1.5, opacity: 0.45, dashArray: "4 6" }}
            />
          );
        })}
      {events.map((e) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={makeIcon(
            priorityHex(e.priority),
            e.status === "active" && (e.priority === "critical" || e.priority === "high"),
          )}
          eventHandlers={{ click: () => onSelect?.(e) }}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, opacity: 0.55, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {e.code}
              </div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600 }}>{e.cause}</div>
              <div style={{ marginTop: 2, fontSize: 12, opacity: 0.7 }}>{e.zone}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <span style={{ background: priorityHex(e.priority), color: "#000", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {e.priority}
                </span>
                <span style={{ border: "1px solid rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 999, fontSize: 10, opacity: 0.75, textTransform: "uppercase" }}>
                  {e.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}