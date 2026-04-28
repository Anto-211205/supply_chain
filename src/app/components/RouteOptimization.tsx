import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin, Navigation, Clock, DollarSign, TrendingDown, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { routeAPI, APIError } from "../../lib/api";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  cost: number;
  savings: number;
  status: "optimal" | "alternative" | "current";
  coordinates: { lat: number; lng: number }[];
}

const mockRoutes: Route[] = [
  {
    id: "1",
    name: "AI-Optimized Route",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    distance: "2,789 mi",
    duration: "39h 15m",
    cost: 4250,
    savings: 850,
    status: "optimal",
    coordinates: [
      { lat: 34.0522, lng: -118.2437 },
      { lat: 36.1627, lng: -115.1398 },
      { lat: 39.7392, lng: -104.9903 },
      { lat: 41.8781, lng: -87.6298 },
      { lat: 40.7128, lng: -74.0060 }
    ]
  },
  {
    id: "2",
    name: "Standard Route",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    distance: "2,920 mi",
    duration: "41h 30m",
    cost: 5100,
    savings: 0,
    status: "current",
    coordinates: [
      { lat: 34.0522, lng: -118.2437 },
      { lat: 33.4484, lng: -112.0740 },
      { lat: 32.7767, lng: -96.7970 },
      { lat: 38.9072, lng: -77.0369 },
      { lat: 40.7128, lng: -74.0060 }
    ]
  },
  {
    id: "3",
    name: "Alternative Route",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    distance: "3,050 mi",
    duration: "43h 00m",
    cost: 5400,
    savings: -300,
    status: "alternative",
    coordinates: [
      { lat: 34.0522, lng: -118.2437 },
      { lat: 40.7608, lng: -111.8910 },
      { lat: 41.2565, lng: -95.9345 },
      { lat: 42.3314, lng: -83.0458 },
      { lat: 40.7128, lng: -74.0060 }
    ]
  }
];

function MapUpdater({ coordinates }: { coordinates: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  return null;
}

export default function RouteOptimization() {
  const [selectedRoute, setSelectedRoute] = useState<Route>(mockRoutes[0]);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const handleApplyRoute = async () => {
    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(false);
    try {
      await routeAPI.optimize(
        selectedRoute.origin,
        selectedRoute.destination
      );
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 4000);
    } catch (err) {
      const msg =
        err instanceof APIError
          ? err.message
          : "Failed to apply route. Please try again.";
      setApplyError(msg);
      console.error("[RouteOptimization] optimize error:", err);
    } finally {
      setIsApplying(false);
    }
  };

  const getRouteColor = (status: Route["status"]) => {
    switch (status) {
      case "optimal": return "#22c55e"; // green-500
      case "current": return "#64748b"; // slate-500
      case "alternative": return "#3b82f6"; // blue-500
    }
  };

  const polylinePositions = selectedRoute.coordinates.map(c => [c.lat, c.lng] as [number, number]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-semibold">Route Optimization</h1>
        <p className="text-gray-600">AI-powered dynamic routing with real-time conditions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Route Map Visualization</CardTitle>
              <CardDescription>Interactive map showing optimized routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
                <MapContainer
                  center={[39.8283, -98.5795]}
                  zoom={4}
                  style={{ height: "100%", width: "100%" }}
                >
                  <MapUpdater coordinates={selectedRoute.coordinates} />
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  
                  <Polyline 
                    positions={polylinePositions} 
                    color={getRouteColor(selectedRoute.status)} 
                    weight={5} 
                    opacity={0.8} 
                  />

                  {selectedRoute.coordinates.map((coord, idx) => {
                    const isOrigin = idx === 0;
                    const isDest = idx === selectedRoute.coordinates.length - 1;
                    const title = isOrigin ? "Origin" : isDest ? "Destination" : `Waypoint ${idx}`;
                    const facility = isOrigin ? selectedRoute.origin : isDest ? selectedRoute.destination : "Routing Hub";
                    
                    return (
                      <Marker key={`${selectedRoute.id}-${idx}`} position={[coord.lat, coord.lng]}>
                        <Popup className="custom-popup min-w-[220px]">
                          <div className="space-y-3 p-1">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h4 className="font-bold text-base text-gray-900">{title}</h4>
                              {isOrigin && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Start</Badge>}
                              {isDest && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">End</Badge>}
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{facility}</span>
                              </p>
                              {!isOrigin && (
                                <p className="flex items-center gap-2">
                                  <Navigation className="w-4 h-4 text-gray-400" />
                                  <span>Dist: <span className="font-medium text-gray-900">{isDest ? selectedRoute.distance : "--- mi"}</span></span>
                                </p>
                              )}
                              <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Target ETA: <span className="font-medium text-gray-900">{isDest ? selectedRoute.duration : "N/A"}</span></span>
                              </p>
                              {isOrigin && (
                                <p className="flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4 text-green-500" />
                                  <span>Departure: <span className="font-medium text-green-700">Clear weather</span></span>
                                </p>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Route Factors & Conditions</CardTitle>
              <CardDescription>Real-time data influencing route decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-xs font-semibold text-green-800 mb-1 uppercase tracking-wider">Weather</p>
                  <p className="text-lg font-medium text-green-900">Clear</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-800 mb-1 uppercase tracking-wider">Traffic</p>
                  <p className="text-lg font-medium text-yellow-900">Moderate</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-xs font-semibold text-green-800 mb-1 uppercase tracking-wider">Fuel Price</p>
                  <p className="text-lg font-medium text-green-900">$3.42/gal</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wider">Road Status</p>
                  <p className="text-lg font-medium text-blue-900">Normal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Routes</CardTitle>
              <CardDescription>Compare and select optimal path</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRoutes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRoute.id === route.id
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-semibold text-gray-900">{route.name}</p>
                      {route.status === "optimal" && (
                        <Badge variant="default" className="bg-green-600">Recommended</Badge>
                      )}
                      {route.status === "current" && (
                        <Badge variant="secondary">Standard</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-gray-900">{route.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-gray-900">{route.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-gray-900">${route.cost.toLocaleString()}</span>
                      </div>
                      {route.savings > 0 && (
                        <div className="flex items-center gap-2 text-green-600 font-medium bg-green-100/50 px-2 rounded-md w-fit">
                          <TrendingDown className="w-4 h-4" />
                          <span>Save ${route.savings}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {applyError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{applyError}</p>
                </div>
              )}
              {applySuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">Route optimization applied successfully!</p>
                </div>
              )}
              <Button
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                size="lg"
                onClick={handleApplyRoute}
                disabled={isApplying}
              >
                {isApplying ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
                ) : applySuccess ? (
                  "✓ Route Applied"
                ) : (
                  "Apply Selected Route"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">Avoiding expected heavy traffic congestion through the Denver corridor</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">Using lower fuel cost corridor through southern states</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">No weather disruptions detected on the primary recommended route</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">Optimal driver rest stop locations algorithmically identified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
