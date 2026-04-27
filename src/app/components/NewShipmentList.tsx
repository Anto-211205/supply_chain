import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, ArrowRight, Package, Clock, AlertTriangle } from "lucide-react";

export interface ShipmentData {
  id: string;
  status: "In Transit" | "Pending" | "Delayed" | "Delivered";
  origin: string;
  destination: string;
  eta: string;
  severity?: "Normal" | "High" | "Critical";
  weight: string;
}

const mockShipments: ShipmentData[] = [
  {
    id: "SHP-10492",
    status: "In Transit",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    eta: "Tomorrow, 10:00 AM",
    severity: "Normal",
    weight: "4,500 lbs",
  },
  {
    id: "SHP-10493",
    status: "Delayed",
    origin: "Chicago, IL",
    destination: "Miami, FL",
    eta: "Oct 28, 4:30 PM",
    severity: "High",
    weight: "1,200 lbs",
  },
  {
    id: "SHP-10494",
    status: "Pending",
    origin: "Seattle, WA",
    destination: "Austin, TX",
    eta: "Oct 29, 9:00 AM",
    severity: "Critical",
    weight: "8,900 lbs",
  },
];

interface NewShipmentListProps {
  onViewDetails: (id: string) => void;
  onCreateNew: () => void;
}

export default function NewShipmentList({ onViewDetails, onCreateNew }: NewShipmentListProps) {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Transit":
        return "bg-green-100 text-green-800";
      case "Delayed":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 font-semibold">Active Shipments</h1>
          <p className="text-gray-600">Track and manage your current logistics operations</p>
        </div>
        <Button onClick={onCreateNew} size="lg" className="gap-2">
          <Package className="w-5 h-5" />
          Create New Shipment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockShipments.map((shipment) => (
          <Card 
            key={shipment.id} 
            className="hover:shadow-md transition-shadow cursor-pointer border hover:border-indigo-200"
            onClick={() => onViewDetails(shipment.id)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Left side: ID & Status */}
                <div className="flex flex-col gap-2 min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{shipment.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getStatusColor(shipment.status)}>
                      {shipment.status}
                    </Badge>
                    {shipment.severity && shipment.severity !== "Normal" && (
                      <Badge variant="outline" className={`flex items-center gap-1 ${getSeverityColor(shipment.severity)}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {shipment.severity}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Middle: Route */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex items-center justify-between lg:justify-center gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-2 w-[40%] justify-end">
                      <span className="text-right font-medium">{shipment.origin}</span>
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                    <div className="flex-1 flex items-center justify-center min-w-[50px] max-w-[100px]">
                      <div className="h-px bg-gray-300 w-full relative">
                        <ArrowRight className="w-4 h-4 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-[40%] justify-start">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-medium text-left">{shipment.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Meta */}
                <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end w-full lg:w-auto gap-2 lg:gap-1 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>ETA: <span className="font-medium text-gray-900">{shipment.eta}</span></span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>Weight: <span className="font-medium text-gray-900">{shipment.weight}</span></span>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
