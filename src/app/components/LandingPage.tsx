import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, TrendingUp, MapPin, AlertTriangle, BarChart3, Ship } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onSignIn: () => void;
  onRegister: () => void;
}

interface ShipPosition {
  x: number;
  y: number;
  id: number;
}

export default function LandingPage({ onSignIn, onRegister }: LandingPageProps) {
  const [shipPosition, setShipPosition] = useState<ShipPosition>({ x: 100, y: 100, id: 0 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;

    setShipPosition({
      x: e.clientX,
      y: e.clientY,
      id: Date.now(),
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        className="absolute pointer-events-none z-10"
        initial={{ x: 100, y: 100, rotate: 0 }}
        animate={{
          x: shipPosition.x - 20,
          y: shipPosition.y - 20,
          rotate: Math.atan2(
            shipPosition.y - (shipPosition.y - 40),
            shipPosition.x - (shipPosition.x - 40)
          ) * (180 / Math.PI) + 45,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 15,
          mass: 0.5,
        }}
      >
        <Ship className="w-10 h-10 text-indigo-600" />
      </motion.div>

      <nav className="p-6 flex justify-between items-center relative z-20">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          <span className="font-bold text-2xl text-gray-900">SmartChain AI</span>
        </motion.div>
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="outline" onClick={onSignIn}>Sign In</Button>
          <Button onClick={onRegister}>Register</Button>
        </motion.div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-6xl mb-6 text-gray-900"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Smart Supply Chains
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Resilient Logistics & Dynamic Supply Chain Optimization powered by AI.
            Predict delays, optimize routes, and minimize costs in real-time.
          </motion.p>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button onClick={onSignIn} size="lg" variant="outline" className="gap-2">
              Sign In <ArrowRight className="w-5 h-5" />
            </Button>
            <Button onClick={onRegister} size="lg" className="gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            {
              icon: TrendingUp,
              color: "text-indigo-600",
              title: "AI-Powered Predictions",
              desc: "Predict delays using weather, traffic, and geopolitical data with advanced ML models.",
              delay: 0.8
            },
            {
              icon: MapPin,
              color: "text-green-600",
              title: "Route Optimization",
              desc: "Dynamic routing algorithms that adapt to real-time conditions and minimize costs.",
              delay: 0.9
            },
            {
              icon: AlertTriangle,
              color: "text-orange-600",
              title: "Risk Detection",
              desc: "Proactive alerts for disruptions including strikes, weather events, and geopolitical risks.",
              delay: 1.0
            },
            {
              icon: BarChart3,
              color: "text-blue-600",
              title: "Real-Time Analytics",
              desc: "Comprehensive dashboards with live tracking, KPIs, and actionable insights.",
              delay: 1.1
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
              <h3 className="text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-white p-10 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-3xl mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg mb-2">🎯 Delay Prediction System</h4>
              <p className="text-gray-600">Multi-source data integration for accurate forecasting</p>
            </div>
            <div>
              <h4 className="text-lg mb-2">🚀 Cost Optimization</h4>
              <p className="text-gray-600">AI-driven recommendations to reduce transportation costs</p>
            </div>
            <div>
              <h4 className="text-lg mb-2">📊 Predictive Analytics</h4>
              <p className="text-gray-600">Advanced reporting for strategic decision-making</p>
            </div>
            <div>
              <h4 className="text-lg mb-2">🔗 API Integration</h4>
              <p className="text-gray-600">Seamless connection with existing ERP and logistics systems</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-300 rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
}
