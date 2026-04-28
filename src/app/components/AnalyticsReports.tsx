import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const performanceData = [
  { month: "Oct", deliveryRate: 92, costEfficiency: 85, customerSat: 88 },
  { month: "Nov", deliveryRate: 93, costEfficiency: 87, customerSat: 90 },
  { month: "Dec", deliveryRate: 91, costEfficiency: 86, customerSat: 89 },
  { month: "Jan", deliveryRate: 94, costEfficiency: 89, customerSat: 91 },
  { month: "Feb", deliveryRate: 95, costEfficiency: 91, customerSat: 93 },
  { month: "Mar", deliveryRate: 96, costEfficiency: 92, customerSat: 94 },
];

const volumeData = [
  { week: "W1", actual: 980, forecast: 950 },
  { week: "W2", actual: 1020, forecast: 1000 },
  { week: "W3", actual: 1050, forecast: 1040 },
  { week: "W4", actual: 1100, forecast: 1080 },
  { week: "W5", actual: 1150, forecast: 1120 },
  { week: "W6", actual: 1200, forecast: 1180 },
];

const carrierPerformance = [
  { carrier: "FastFreight", onTime: 96, cost: 4.2, reliability: 94 },
  { carrier: "QuickShip", onTime: 93, cost: 4.5, reliability: 91 },
  { carrier: "Reliable Transport", onTime: 97, cost: 4.8, reliability: 96 },
  { carrier: "Pacific Carriers", onTime: 95, cost: 4.3, reliability: 93 },
];

export default function AnalyticsReports() {
  const handleExport = (format: string) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights and predictive analytics</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Custom Range
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Overall Performance</p>
              <p className="text-4xl mb-2">94.8%</p>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+3.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Shipments</p>
              <p className="text-4xl mb-2">6,350</p>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Cost Savings</p>
              <p className="text-4xl mb-2">$147K</p>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>-8.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">AI Accuracy</p>
              <p className="text-4xl mb-2">97.3%</p>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+1.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Delivery rate, cost efficiency, and customer satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid key="grid-performance" strokeDasharray="3 3" />
                <XAxis key="xaxis-performance" dataKey="month" />
                <YAxis key="yaxis-performance" />
                <Tooltip key="tooltip-performance" />
                <Legend key="legend-performance" />
                <Line key="line-deliveryRate" type="monotone" dataKey="deliveryRate" stroke="#3b82f6" strokeWidth={2} name="Delivery Rate %" />
                <Line key="line-costEfficiency" type="monotone" dataKey="costEfficiency" stroke="#10b981" strokeWidth={2} name="Cost Efficiency %" />
                <Line key="line-customerSat" type="monotone" dataKey="customerSat" stroke="#f59e0b" strokeWidth={2} name="Customer Satisfaction %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Forecast vs Actual</CardTitle>
            <CardDescription>AI-predicted vs actual shipment volumes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <CartesianGrid key="grid-volume" strokeDasharray="3 3" />
                <XAxis key="xaxis-volume" dataKey="week" />
                <YAxis key="yaxis-volume" />
                <Tooltip key="tooltip-volume" />
                <Legend key="legend-volume" />
                <Area key="area-forecast" type="monotone" dataKey="forecast" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="AI Forecast" />
                <Area key="area-actual" type="monotone" dataKey="actual" stroke="#10b981" fill="#10b981" fillOpacity={0.5} name="Actual Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance Analysis</CardTitle>
          <CardDescription>Comparative metrics across all carriers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carrierPerformance}>
              <CartesianGrid key="grid-carrier" strokeDasharray="3 3" />
              <XAxis key="xaxis-carrier" dataKey="carrier" />
              <YAxis key="yaxis-carrier" />
              <Tooltip key="tooltip-carrier" />
              <Legend key="legend-carrier" />
              <Bar key="bar-onTime" dataKey="onTime" fill="#10b981" name="On-Time Delivery %" />
              <Bar key="bar-reliability" dataKey="reliability" fill="#3b82f6" name="Reliability Score" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Download comprehensive analytics reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm">Monthly Performance Report</p>
                    <p className="text-xs text-gray-600">March 2026 - Complete analysis</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm">Carrier Performance Summary</p>
                    <p className="text-xs text-gray-600">Q1 2026 - All carriers</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport("excel")}>
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm">Cost Optimization Analysis</p>
                    <p className="text-xs text-gray-600">AI-generated recommendations</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm">Risk Assessment Report</p>
                    <p className="text-xs text-gray-600">Weekly disruption analysis</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Insights</CardTitle>
            <CardDescription>AI-powered forecasts and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm mb-1">Volume Prediction - Next Week</p>
                    <p className="text-xs text-gray-600">Expected 1,280 shipments (confidence: 94%)</p>
                    <p className="text-xs text-gray-600 mt-1">15% increase from current week</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm mb-1">Cost Reduction Opportunity</p>
                    <p className="text-xs text-gray-600">Projected savings: $8,500 next month</p>
                    <p className="text-xs text-gray-600 mt-1">Through route consolidation and carrier optimization</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm mb-1">Seasonal Demand Forecast</p>
                    <p className="text-xs text-gray-600">Peak expected in May-June period</p>
                    <p className="text-xs text-gray-600 mt-1">Recommend increasing carrier capacity by 20%</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm mb-1">Performance Improvement</p>
                    <p className="text-xs text-gray-600">On-time delivery rate improving steadily</p>
                    <p className="text-xs text-gray-600 mt-1">Projected to reach 98% by end of quarter</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
