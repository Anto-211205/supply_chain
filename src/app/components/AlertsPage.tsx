import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, Cloud, TrendingUp, Users, MapPin, Search, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { motion } from "motion/react";
import { alertAPI, Alert, APIError } from "../../lib/api";

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Alert["severity"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await alertAPI.getAll();
        setAlerts(data);
      } catch (err) {
        if (err instanceof APIError) {
          console.error(`Failed to load alerts: ${err.message}`);
        } else {
          console.error('Failed to load alerts');
        }
        console.error('Alert error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

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
