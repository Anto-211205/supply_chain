import { useState } from "react";
import NewShipmentList from "./NewShipmentList";
import NewShipmentDetails from "./NewShipmentDetails";
import NewShipmentForm from "./NewShipmentForm";
import { AnimatePresence, motion } from "motion/react";

type ShipmentViewState = 
  | { view: "list" }
  | { view: "details"; id: string }
  | { view: "create" };

export default function NewShipmentLayout() {
  const [state, setState] = useState<ShipmentViewState>({ view: "list" });

  return (
    <div className="h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {state.view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            <NewShipmentList
              onViewDetails={(id) => setState({ view: "details", id })}
              onCreateNew={() => setState({ view: "create" })}
            />
          </motion.div>
        )}
        
        {state.view === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            <NewShipmentDetails
              id={state.id}
              onBack={() => setState({ view: "list" })}
            />
          </motion.div>
        )}

        {state.view === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            <NewShipmentForm
              onBack={() => setState({ view: "list" })}
              onSuccess={(id) => setState({ view: "details", id })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
