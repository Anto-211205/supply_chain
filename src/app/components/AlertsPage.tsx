import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, Cloud, TrendingUp, Users, MapPin, X, Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { motion, AnimatePresence } from "motion/react";

interface Alert {
  id: string;
  type: "weather" | "traffic" | "geopolitical" | "strike" | "other";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affectedShipments: number;
  location: string;
  timestamp: string;
  recommendation: string;
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    type: "weather",
    severity: "high",
    title: "Heavy Snowstorm Warning",
    description: "Major winter storm expected to impact Northeast corridor with 12-18 inches of snow and high winds.",
    affectedShipments: 23,
    location: "New York, NY - Boston, MA",
    timestamp: "2 hours ago",
    recommendation: "Reroute affected shipments via southern corridor. Expect 6-8 hour delays if maintaining current routes."
  },
  {
    id: "ALT-002",
    type: "traffic",
    severity: "medium",
    title: "Highway Construction Delays",
    description: "I-95 southbound closed between exits 22-28 for emergency repairs. Expected 4-hour delays.",
    affectedShipments: 12,
    location: "Philadelphia, PA",
    timestamp: "4 hours ago",
    recommendation: "Use alternate route via I-476 and I-76. Add 45 minutes to estimated delivery time."
  },
  {
    id: "ALT-003",
    type: "geopolitical",
    severity: "critical",
    title: "Port Strike Imminent",
    description: "Dockworkers union announced potential strike starting April 25. Major West Coast ports may be affected.",
    affectedShipments: 45,
    location: "Los Angeles, CA - Long Beach, CA",
    timestamp: "1 day ago",
    recommendation: "Expedite inbound shipments. Consider alternative ports in Seattle or Vancouver for new shipments."
  },
  {
    id: "ALT-004",
    type: "traffic",
    severity: "low",
    title: "Increased Traffic Volume",
    description: "Above-average traffic reported on major highways due to holiday travel.",
    affectedShipments: 8,
    location: "Multiple locations",
    timestamp: "6 hours ago",
    recommendation: "Add 30-60 minute buffer to delivery estimates. No route changes necessary."
  },
  {
    id: "ALT-005",
    type: "weather",
    severity: "medium",
    title: "Fog Advisory",
    description: "Dense fog reducing visibility to less than 1/4 mile. Speed restrictions in effect.",
    affectedShipments: 15,
    location: "San Francisco, CA - Sacramento, CA",
    timestamp: "3 hours ago",
    recommendation: "Drivers should reduce speed and increase following distance. Expected 1-2 hour delays."
  },
  {
    id: "ALT-006",
    type: "other",
    severity: "medium",
    title: "Fuel Price Spike",
    description: "Diesel prices increased 8% in midwest region due to refinery issues.",
    affectedShipments: 34,
    location: "Chicago, IL - St. Louis, MO",
    timestamp: "12 hours ago",
    recommendation: "Consider route optimization to minimize fuel consumption. Projected cost increase: $450/shipment."
  }
];

const getSeverityColor = (severity: Alert["severity"]) => {
  switch (severity) {
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
  }
};

const getTypeIcon = (type: Alert["type"]) => {
  switch (type) {
    case "weather":
      return <Cloud className="w-4 h-4" />;
    case "traffic":
      return <TrendingUp className="w-4 h-4" />;
    case "geopolitical":
      return <MapPin className="w-4 h-4" />;
    case "strike":
      return <Users className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<Alert["severity"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesFilter = filter === "all" || a.severity === filter;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const activeIncidents = alerts.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-semibold">Risk Detection & Alerts</h1>
        <p className="text-gray-600">Proactive monitoring and disruption management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Critical Alerts</p>
                <p className="text-4xl font-bold text-red-900 mt-2">{criticalCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">High Severity</p>
                <p className="text-4xl font-bold text-orange-900 mt-2">{highCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Active Incidents</p>
                <p className="text-4xl font-bold text-blue-900 mt-2">{activeIncidents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Active Alerts Dashboard</CardTitle>
              <CardDescription>Click on any row to expand details and AI mitigation steps</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search alerts..." 
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
                <Button variant={filter === "critical" ? "default" : "outline"} size="sm" onClick={() => setFilter("critical")}>Critical</Button>
                <Button variant={filter === "high" ? "default" : "outline"} size="sm" onClick={() => setFilter("high")}>High</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Affected</TableHead>
                  <TableHead className="text-right">Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No alerts found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert) => (
                    <React.Fragment key={alert.id}>
                      <TableRow 
                        className={`cursor-pointer hover:bg-gray-50/50 transition-colors ${expandedRows.has(alert.id) ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => toggleRow(alert.id)}
                      >
                        <TableCell>
                          {expandedRows.has(alert.id) ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 rounded-md text-gray-600">
                              {getTypeIcon(alert.type)}
                            </div>
                            <span className="font-medium text-gray-900">{alert.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{alert.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">{alert.affectedShipments} shipments</TableCell>
                        <TableCell className="text-right text-gray-500 text-sm">{alert.timestamp}</TableCell>
                      </TableRow>
                      
                      {expandedRows.has(alert.id) && (
                        <TableRow className="bg-indigo-50/10 hover:bg-indigo-50/10">
                          <TableCell colSpan={6} className="p-0 border-b">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-6 py-4 overflow-hidden"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Incident Details</h4>
                                  <p className="text-gray-700 text-sm leading-relaxed">{alert.description}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Bot className="w-4 h-4 text-indigo-600" />
                                    <h4 className="text-sm font-semibold text-indigo-900">AI Mitigation Strategy</h4>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{alert.recommendation}</p>
                                  <div className="flex gap-2">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Apply Recommendation</Button>
                                    <Button size="sm" variant="outline">View Affected Shipments</Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Need to import Bot here to fix TS error
import { Bot } from "lucide-react";
import React from "react";
