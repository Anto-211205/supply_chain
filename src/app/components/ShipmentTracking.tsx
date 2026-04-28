import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, MapPin, Package, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { shipmentAPI, Shipment, APIError } from "../../lib/api";

interface ShipmentUI extends Shipment {}

export default function ShipmentTracking() {
  const [shipments, setShipments] = useState<ShipmentUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentUI | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await shipmentAPI.getAll();
        setShipments(data);
        if (data.length > 0) {
          setSelectedShipment(data[0]);
        }
      } catch (err) {
        if (err instanceof APIError) {
          setError(`Failed to load shipments: ${err.message}`);
        } else {
          setError('Failed to load shipments');
        }
        console.error('Shipment error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter(
    (s) =>
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Shipment["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-600";
      case "on-time":
        return "bg-blue-600";
      case "in-transit":
        return "bg-indigo-600";
      case "delayed":
        return "bg-red-600";
    }
  };

  const getRiskColor = (risk: Shipment["delayRisk"]) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-red-600 bg-red-50";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Shipment Tracking</h1>
        <p className="text-gray-600">Real-time visibility across your supply chain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Shipments</CardTitle>
            <CardDescription>Track all shipments with real-time updates</CardDescription>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, origin, or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow
                      key={shipment.id}
                      className={`cursor-pointer ${
                        selectedShipment?.id === shipment.id ? "bg-indigo-50" : ""
                      }`}
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <TableCell>{shipment.id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{shipment.origin}</div>
                          <div className="text-gray-500 text-xs">→ {shipment.destination}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {shipment.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{shipment.eta}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRiskColor(shipment.delayRisk)}>
                          {shipment.delayRisk.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedShipment && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Details</CardTitle>
                  <CardDescription>{selectedShipment.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Carrier</p>
                    <p className="text-sm">{selectedShipment.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Location</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm">{selectedShipment.currentLocation}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${selectedShipment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{selectedShipment.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estimated Arrival</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm">{selectedShipment.eta}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Delay Risk</p>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <Badge variant="outline" className={getRiskColor(selectedShipment.delayRisk)}>
                        {selectedShipment.delayRisk.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-0.5 h-full bg-gray-300"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm mb-1">{selectedShipment.currentLocation}</p>
                        <p className="text-xs text-gray-500">Current - In Transit</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <div className="w-0.5 h-full bg-gray-300"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm mb-1">Previous Checkpoint</p>
                        <p className="text-xs text-gray-500">Apr 23, 8:30 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      </div>
                      <div>
                        <p className="text-sm mb-1">{selectedShipment.origin}</p>
                        <p className="text-xs text-gray-500">Apr 22, 2:00 PM - Departed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
