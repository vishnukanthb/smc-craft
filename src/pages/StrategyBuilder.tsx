import { motion, AnimatePresence } from "framer-motion";
import { useStrategyBuilder } from "@/stores/strategy-store";
import { StepBasicInfo } from "@/components/builder/StepBasicInfo";
import { StepEntryConditions } from "@/components/builder/StepEntryConditions";
import { StepExitRules } from "@/components/builder/StepExitRules";
import { StepRiskManagement } from "@/components/builder/StepRiskManagement";
import { StepReview } from "@/components/builder/StepReview";
import { cn } from "@/lib/utils";

const STEPS = ["Basic Info", "Entry Conditions", "Exit Rules", "Risk Management", "Review & Save"];

export default function StrategyBuilder() {
  const { step, setStep } = useStrategyBuilder();

  const stepComponents = [
    <StepBasicInfo key="basic" />,
    <StepEntryConditions key="entry" />,
    <StepExitRules key="exit" />,
    <StepRiskManagement key="risk" />,
    <StepReview key="review" />,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Strategy Builder</h1>
        <p className="text-muted-foreground text-sm">Configure your SMC trading strategy step by step</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors w-full",
                i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {stepComponents[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
