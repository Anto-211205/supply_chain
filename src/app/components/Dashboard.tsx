import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Package, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

const deliveryData = [
  { month: "Jan", onTime: 850, delayed: 120, predicted: 920 },
  { month: "Feb", onTime: 920, delayed: 90, predicted: 980 },
  { month: "Mar", onTime: 880, delayed: 110, predicted: 950 },
  { month: "Apr", onTime: 950, delayed: 75, predicted: 1000 },
  { month: "May", onTime: 990, delayed: 60, predicted: 1050 },
  { month: "Jun", onTime: 1020, delayed: 50, predicted: 1080 },
];

const costData = [
  { week: "Week 1", actual: 45000, optimized: 38000 },
  { week: "Week 2", actual: 48000, optimized: 40000 },
  { week: "Week 3", actual: 46000, optimized: 39000 },
  { week: "Week 4", actual: 50000, optimized: 42000 },
];

const riskDistribution = [
  { name: "Weather", value: 35, color: "#3b82f6" },
  { name: "Traffic", value: 25, color: "#10b981" },
  { name: "Geopolitical", value: 20, color: "#f59e0b" },
  { name: "Strikes", value: 15, color: "#ef4444" },
  { name: "Other", value: 5, color: "#6b7280" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Supply Chain Dashboard</h1>
        <p className="text-gray-600">Real-time insights and predictive analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl">1,284</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">On-Time Delivery Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl">95.3%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Cost Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl">$24,500</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-8.2%</span> cost reduction
            </p>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl">7</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-orange-600">3 high priority</span>
            </p>
          </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>On-time vs delayed shipments with AI predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryData}>
                <CartesianGrid key="grid-delivery" strokeDasharray="3 3" />
                <XAxis key="xaxis-delivery" dataKey="month" />
                <YAxis key="yaxis-delivery" />
                <Tooltip key="tooltip-delivery" />
                <Legend key="legend-delivery" />
                <Bar key="bar-onTime" dataKey="onTime" fill="#10b981" name="On Time" />
                <Bar key="bar-delayed" dataKey="delayed" fill="#ef4444" name="Delayed" />
                <Bar key="bar-predicted" dataKey="predicted" fill="#3b82f6" name="AI Predicted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
          <CardHeader>
            <CardTitle>Cost Optimization Impact</CardTitle>
            <CardDescription>Actual vs AI-optimized transportation costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData}>
                <CartesianGrid key="grid-cost" strokeDasharray="3 3" />
                <XAxis key="xaxis-cost" dataKey="week" />
                <YAxis key="yaxis-cost" />
                <Tooltip key="tooltip-cost" />
                <Legend key="legend-cost" />
                <Line key="line-actual" type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual Cost" />
                <Line key="line-optimized" type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={2} name="Optimized Cost" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current disruption factors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  key="pie-risk"
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-risk" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Actionable insights from predictive models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm">Route optimization opportunity detected for Chicago-Denver corridor</p>
                  <p className="text-xs text-gray-600 mt-1">Potential savings: $1,200 per week</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm">Weather alert: Heavy snow predicted in northeast region</p>
                  <p className="text-xs text-gray-600 mt-1">Recommend rerouting 12 shipments via southern route</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm">Carrier consolidation opportunity identified</p>
                  <p className="text-xs text-gray-600 mt-1">Combine 5 LTL shipments for 18% cost reduction</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
