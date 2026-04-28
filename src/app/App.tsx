import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LandingAnimation from "./components/LandingAnimation";
import SignInPage from "./components/SignInPage";
import RegisterPage from "./components/RegisterPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import Dashboard from "./components/Dashboard";
import RouteOptimization from "./components/RouteOptimization";
import ShipmentTracking from "./components/ShipmentTracking";
import AlertsPage from "./components/AlertsPage";
import NewShipmentLayout from "./components/NewShipmentLayout";
import FormsPage from "./components/FormsPage";
import AIAssistant from "./components/AIAssistant";
import AnalyticsReports from "./components/AnalyticsReports";
import IntegrationHub from "./components/IntegrationHub";
import FloatingChatbot from "./components/FloatingChatbot";
import { Button } from "./components/ui/button";
import { BarChart3, LayoutDashboard, Map, Package, AlertTriangle, Plus, Menu, X, Bot, TrendingUp, Plug, FileText } from "lucide-react";

type Page = "landing" | "signin" | "register" | "forgot-password" | "reset-password" | "dashboard" | "routes" | "tracking" | "alerts" | "new-shipment" | "forms" | "ai-assistant" | "analytics" | "integrations";

const pageFromPath = (path: string): Page => {
  if (path === "/signin") return "signin";
  if (path === "/register") return "register";
  if (path === "/forgot-password") return "forgot-password";
  if (path === "/reset-password") return "reset-password";
  if (path === "/dashboard") return "dashboard";
  return "landing";
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => pageFromPath(window.location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [signInMessage, setSignInMessage] = useState("");

  useEffect(() => {
    const handlePopState = () => setCurrentPage(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (page: Page, path: string, message = "") => {
    setSignInMessage(message);
    setCurrentPage(page);
    window.history.pushState({}, "", path);
  };

  if (currentPage === "landing") {
    return <LandingAnimation onSignIn={() => navigateTo("signin", "/signin")} onRegister={() => navigateTo("register", "/register")} />;
  }

  if (currentPage === "signin") {
    return (
      <SignInPage
        onSignIn={() => navigateTo("dashboard", "/dashboard")}
        onBackToLanding={() => navigateTo("landing", "/")}
        onGoToRegister={() => navigateTo("register", "/register")}
        onForgotPassword={() => navigateTo("forgot-password", "/forgot-password")}
        successMessage={signInMessage}
      />
    );
  }

  if (currentPage === "register") {
    return <RegisterPage onRegister={() => navigateTo("dashboard", "/dashboard")} onBackToLanding={() => navigateTo("landing", "/")} onGoToSignIn={() => navigateTo("signin", "/signin")} />;
  }

  if (currentPage === "forgot-password") {
    return <ForgotPasswordPage onBackToLanding={() => navigateTo("landing", "/")} onBackToSignIn={() => navigateTo("signin", "/signin")} />;
  }

  if (currentPage === "reset-password") {
    return (
      <ResetPasswordPage
        onBackToLanding={() => navigateTo("landing", "/")}
        onBackToSignIn={(message) => navigateTo("signin", "/signin", message)}
        onForgotPassword={() => navigateTo("forgot-password", "/forgot-password")}
      />
    );
  }

  const navigation = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { id: "routes" as Page, label: "Route Optimization", icon: Map },
    { id: "tracking" as Page, label: "Shipment Tracking", icon: Package },
    { id: "alerts" as Page, label: "Alerts & Risks", icon: AlertTriangle },
    { id: "ai-assistant" as Page, label: "AI Assistant", icon: Bot },
    { id: "analytics" as Page, label: "Analytics & Reports", icon: TrendingUp },
    { id: "integrations" as Page, label: "Integrations", icon: Plug },
    { id: "forms" as Page, label: "Forms & Validation", icon: FileText },
    { id: "new-shipment" as Page, label: "New Shipment", icon: Plus },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-indigo-900 text-white flex flex-col overflow-hidden"
      >
        <div className="p-6 flex items-center gap-2 border-b border-indigo-800">
          <BarChart3 className="w-8 h-8" />
          <span className="text-xl">SmartChain AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? "bg-indigo-800 text-white"
                    : "hover:bg-indigo-800/50 text-indigo-100"
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <Button
            variant="outline"
            className="w-full bg-transparent text-white border-white hover:bg-white hover:text-indigo-900 transition-colors"
            onClick={() => {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user");
              navigateTo("landing", "/");
            }}
          >
            Sign Out
          </Button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </motion.div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentPage === "dashboard" && <Dashboard />}
              {currentPage === "routes" && <RouteOptimization />}
              {currentPage === "tracking" && <ShipmentTracking />}
              {currentPage === "alerts" && <AlertsPage />}
              {currentPage === "ai-assistant" && <AIAssistant />}
              { currentPage === "analytics" && <AnalyticsReports /> }
              { currentPage === "integrations" && <IntegrationHub /> }
              { currentPage === "forms" && <FormsPage /> }
              { currentPage === "new-shipment" && <NewShipmentLayout /> }
            </motion.div>
          </AnimatePresence>
        </main>

        {currentPage !== "ai-assistant" && <FloatingChatbot />}
      </div>
    </div>
  );
}
