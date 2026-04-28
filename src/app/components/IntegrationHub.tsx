import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { CheckCircle2, XCircle, RefreshCw, Settings, Plug, Code, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { shipAPI } from "../../lib/api";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  category: "erp" | "weather" | "traffic" | "carrier" | "warehouse";
  lastSync: string;
  enabled: boolean;
}

const integrations: Integration[] = [
  {
    id: "sap-erp",
    name: "SAP ERP",
    description: "Enterprise resource planning integration",
    status: "connected",
    category: "erp",
    lastSync: "2 minutes ago",
    enabled: true,
  },
  {
    id: "weather-api",
    name: "Weather Data API",
    description: "Real-time weather monitoring and forecasting",
    status: "connected",
    category: "weather",
    lastSync: "5 minutes ago",
    enabled: true,
  },
  {
    id: "google-maps",
    name: "Google Maps Platform",
    description: "Traffic data and route optimization",
    status: "connected",
    category: "traffic",
    lastSync: "1 minute ago",
    enabled: true,
  },
  {
    id: "fedex-api",
    name: "FedEx API",
    description: "Carrier tracking and shipping",
    status: "connected",
    category: "carrier",
    lastSync: "10 minutes ago",
    enabled: true,
  },
  {
    id: "ups-api",
    name: "UPS API",
    description: "Carrier tracking and shipping",
    status: "disconnected",
    category: "carrier",
    lastSync: "Never",
    enabled: false,
  },
  {
    id: "warehouse-wms",
    name: "Warehouse Management System",
    description: "Inventory and warehouse operations",
    status: "connected",
    category: "warehouse",
    lastSync: "3 minutes ago",
    enabled: true,
  },
  {
    id: "news-api",
    name: "Geopolitical News Feed",
    description: "Real-time news monitoring for risk detection",
    status: "connected",
    category: "weather",
    lastSync: "8 minutes ago",
    enabled: true,
  },
  {
    id: "oracle-erp",
    name: "Oracle ERP Cloud",
    description: "Financial and logistics integration",
    status: "error",
    category: "erp",
    lastSync: "2 hours ago",
    enabled: false,
  },
];

export default function IntegrationHub() {
  const [signalCount, setSignalCount] = useState<number | null>(null);
  const [signalLoading, setSignalLoading] = useState(true);
  const [signalError, setSignalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const data = await shipAPI.getAllSignals();
        // data is an array of ship signal objects
        const count = Array.isArray(data) ? data.length : 0;
        setSignalCount(count);
      } catch (err) {
        console.error("[IntegrationHub] fetchSignals error:", err);
        setSignalError("Unable to load live signal data.");
      } finally {
        setSignalLoading(false);
      }
    };
    fetchSignals();
  }, []);
  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "disconnected":
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-600">Connected</Badge>;
      case "disconnected":
        return <Badge variant="secondary">Disconnected</Badge>;
      case "error":
        return <Badge className="bg-red-600">Error</Badge>;
    }
  };

  const connectedCount = integrations.filter((i) => i.status === "connected").length;
  const enabledCount = integrations.filter((i) => i.enabled).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Integration Hub</h1>
        <p className="text-gray-600">Connect external systems and data sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Integrations</p>
                <p className="text-3xl mt-1">{connectedCount}/{integrations.length}</p>
              </div>
              <Plug className="w-10 h-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enabled Services</p>
                <p className="text-3xl mt-1">{enabledCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Calls Today</p>
                {signalLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                ) : signalError ? (
                  <p className="text-3xl mt-1 text-gray-400">--</p>
                ) : (
                  <p className="text-3xl mt-1">{signalCount !== null ? `${signalCount} signals` : "--"}</p>
                )}
              </div>
              <Code className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Connected Systems</CardTitle>
              <CardDescription>Manage your integrations and API connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(integration.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{integration.name}</p>
                          {getStatusBadge(integration.status)}
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Last sync: {integration.lastSync}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={integration.enabled} />
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Integration</CardTitle>
              <CardDescription>Connect a new data source or API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-name">Integration Name</Label>
                <Input id="api-name" placeholder="e.g., DHL API" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter API key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input id="endpoint" placeholder="https://api.example.com" />
              </div>

              <Button className="w-full">Add Integration</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                View API Reference
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Webhook Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Authentication Guide
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Rate Limits & Quotas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">API Response Time</span>
                  <span className="text-green-600">142ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="text-green-600">0.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Sync Status</span>
                  <span className="text-green-600">Normal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
