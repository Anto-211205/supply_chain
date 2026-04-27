import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent } from "./ui/card";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MarkerData {
  id: string;
  position: [number, number];
  title: string;
  facility: string;
  eta?: string;
  distance?: string;
  status?: string;
  isOrigin?: boolean;
  isDestination?: boolean;
}

interface NewShipmentMapProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function NewShipmentMap({
  markers = [],
  center = [39.8283, -98.5795], // US Center
  zoom = 4,
  className = "h-[400px] w-full rounded-lg overflow-hidden",
}: NewShipmentMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup className="custom-popup">
              <Card className="border-0 shadow-none min-w-[200px] bg-transparent">
                <CardContent className="p-0 space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-base">{marker.title}</h4>
                    {marker.isOrigin && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Origin</span>}
                    {marker.isDestination && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Destination</span>}
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500 font-medium">Facility:</span> {marker.facility}</p>
                    {marker.distance && <p><span className="text-gray-500 font-medium">Distance:</span> {marker.distance}</p>}
                    {marker.eta && <p><span className="text-gray-500 font-medium">ETA:</span> {marker.eta}</p>}
                    {marker.status && <p><span className="text-gray-500 font-medium">Status:</span> {marker.status}</p>}
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
