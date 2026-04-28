import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { Card } from "./ui/card";
import { LogIn, UserPlus } from "lucide-react";

interface LandingAnimationProps {
  onSignIn: () => void;
  onRegister: () => void;
}

export default function LandingAnimation({ onSignIn, onRegister }: LandingAnimationProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const loginTextRef = useRef<HTMLHeadingElement>(null);
  const registerTextRef = useRef<HTMLHeadingElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const controls = useAnimation();

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowSize.width > 0 && !isNavigating) {
      controls.start("idle");
    }
  }, [windowSize, controls, isNavigating]);

  const handleAction = async (action: "login" | "register") => {
    if (isNavigating) return; // Prevent double clicks
    setIsNavigating(true);

    const ref = action === "login" ? loginTextRef : registerTextRef;
    let targetX = 0;
    let targetY = 0;

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const shipWidth = windowSize.width < 768 ? 128 : 160; // w-32 or w-40
      const shipHeight = 80;

      // Navigate to touch the wording
      targetX = rect.left - shipWidth + 30; // slightly overlap text
      targetY = rect.top + rect.height / 2 - shipHeight / 2;
    }

    // Stop the idle animation
    controls.stop();

    // Animate to the new target
    await controls.start({
      x: targetX,
      y: targetY,
      scale: 1.2,
      rotate: [null, action === "login" ? -5 : 5, 0], // Slight curve/tilt towards target
      transition: {
        duration: 1.2,
        ease: "easeInOut"
      }
    });

    // Smoothly fade out the entire page before calling route change
    setIsTransitioningOut(true);

    setTimeout(() => {
      if (action === "login") onSignIn();
      else onRegister();
    }, 500);
  };

  const waterLevel = windowSize.height * 0.65; // Water surface position

  const shipVariants = {
    idle: {
      x: [-200, windowSize.width ? windowSize.width + 200 : 2000],
      y: [waterLevel, waterLevel - 15, waterLevel, waterLevel - 8, waterLevel],
      rotate: [-1, 2, -1, 1, -2],
      transition: {
        x: { repeat: Infinity, duration: windowSize.width < 768 ? 15 : 30, ease: "linear" },
        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" }
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      animate={{ opacity: isTransitioningOut ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >

      {/* Realistic Sea Scenery Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="absolute inset-0 bg-sky-900/50"></div>
      </div>

      {/* Cargo Ship */}
      {windowSize.width > 0 && (
        <motion.div
          className="absolute z-10 w-32 md:w-40 drop-shadow-2xl"
          variants={shipVariants}
          initial="idle"
          animate={controls}
          style={{ top: 0, left: 0 }}
        >
          <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Reflection/Shadow */}
            <ellipse cx="100" cy="75" rx="80" ry="5" fill="#0284c7" fillOpacity="0.2" />

            {/* Hull */}
            <path d="M 10 60 L 180 60 L 195 35 L 5 35 Z" fill="#1e293b" />
            <path d="M 5 35 L 195 35 L 180 60 L 10 60 Z" fill="url(#hullGradient)" />

            {/* Containers */}
            <rect x="25" y="15" width="25" height="20" fill="#3b82f6" rx="1" />
            <rect x="52" y="15" width="25" height="20" fill="#ef4444" rx="1" />
            <rect x="79" y="15" width="25" height="20" fill="#10b981" rx="1" />
            <rect x="106" y="15" width="25" height="20" fill="#f59e0b" rx="1" />

            {/* Second Row Containers */}
            <rect x="35" y="0" width="25" height="15" fill="#6366f1" rx="1" />
            <rect x="62" y="0" width="25" height="15" fill="#ec4899" rx="1" />
            <rect x="89" y="0" width="25" height="15" fill="#14b8a6" rx="1" />

            {/* Bridge */}
            <rect x="145" y="10" width="30" height="25" fill="#f8fafc" rx="2" />
            <rect x="148" y="15" width="8" height="8" fill="#94a3b8" />
            <rect x="160" y="15" width="8" height="8" fill="#94a3b8" />
            <rect x="150" y="0" width="4" height="10" fill="#64748b" />
            <rect x="165" y="0" width="4" height="10" fill="#64748b" />

            <defs>
              <linearGradient id="hullGradient" x1="100" y1="35" x2="100" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#334155" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-20 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-12">

          {/* Text Left */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg tracking-tight mb-6">
              SmartChain <span className="text-sky-300">AI</span>
            </h1>
            <p className="text-xl text-sky-50 drop-shadow-md max-w-lg mx-auto md:mx-0 leading-relaxed">
              Your logistics journey starts here. Smooth, reliable, and intelligently routed for the modern supply chain.
            </p>
          </motion.div>

          {/* Cards Right */}
          <motion.div
            className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-6 justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div ref={loginRef}>
              <Card
                className="p-6 md:w-[320px] cursor-pointer hover:shadow-xl hover:shadow-sky-200/50 hover:border-sky-300 transition-all duration-300 group bg-white/80 backdrop-blur-sm"
                onClick={() => handleAction("login")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center group-hover:bg-sky-500 transition-colors duration-300">
                    <LogIn className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 ref={loginTextRef} className="text-xl font-bold text-slate-800 relative z-10">Login</h3>
                    <p className="text-sm text-slate-500">Access your dashboard</p>
                  </div>
                </div>
              </Card>
            </div>

            <div ref={registerRef}>
              <Card
                className="p-6 md:w-[320px] cursor-pointer hover:shadow-xl hover:shadow-indigo-200/50 hover:border-indigo-300 transition-all duration-300 group bg-white/80 backdrop-blur-sm"
                onClick={() => handleAction("register")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-300">
                    <UserPlus className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 ref={registerTextRef} className="text-xl font-bold text-slate-800 relative z-10">Register</h3>
                    <p className="text-sm text-slate-500">Create a new account</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
