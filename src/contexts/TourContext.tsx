import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TourContextType {
  startTour: () => void;
  skipTour: () => void;
  resetTour: () => void;
  isTourRunning: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

const TOUR_STORAGE_KEY = "localito_business_tour_completed";
const TOUR_TRIGGER_KEY = "localito_show_business_tour";

const tourSteps: Step[] = [
  {
    target: '[data-tour="settings"]',
    content: "First, complete your business profile so customers can find you and your shop can be approved.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: '[data-tour="dashboard-stats"]',
    content: "This is your dashboard. See orders, revenue, and how your shop is performing.",
    placement: "bottom",
  },
  {
    target: '[data-tour="products"]',
    content: "Add your products here. The more products you list, the more customers can discover you.",
    placement: "right",
  },
  {
    target: '[data-tour="payouts"]',
    content: "Set up Stripe to receive instant payouts when customers pick up orders.",
    placement: "right",
  },
];

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Check if tour should auto-start
    const shouldShowTour = localStorage.getItem(TOUR_TRIGGER_KEY) === "true";
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    
    if (shouldShowTour && !tourCompleted) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setRun(true);
      }, 500);
      // Clear the trigger flag
      localStorage.removeItem(TOUR_TRIGGER_KEY);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Mark tour as completed
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      setRun(false);
      setStepIndex(0);
    } else if (type === "step:after") {
      // Move to next step
      setStepIndex(index + (action === "prev" ? -1 : 1));
    }
  };

  const startTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setRun(false);
    setStepIndex(0);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_TRIGGER_KEY);
    setStepIndex(0);
    setRun(false);
  };

  return (
    <TourContext.Provider
      value={{
        startTour,
        skipTour,
        resetTour,
        isTourRunning: run,
      }}
    >
      <Joyride
        steps={tourSteps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#1e3a5f",
            zIndex: 10000,
          },
          buttonNext: {
            backgroundColor: "#1e3a5f",
            fontSize: 14,
            borderRadius: 8,
            padding: "8px 16px",
          },
          buttonBack: {
            marginRight: 10,
            fontSize: 14,
            color: "#64748b",
          },
          buttonSkip: {
            fontSize: 14,
            color: "#64748b",
          },
          tooltip: {
            borderRadius: 12,
            fontSize: 15,
            padding: 20,
          },
          tooltipContent: {
            padding: "8px 0",
          },
        }}
        locale={{
          skip: "Skip tour",
          next: "Next",
          back: "Back",
          last: "Finish",
        }}
      />
      {children}
    </TourContext.Provider>
  );
}
