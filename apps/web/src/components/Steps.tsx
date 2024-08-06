import { createContext, useContext, useEffect, useState } from "react";

import { Progress } from "./ui/progress";

interface CommonProps {
  title: string;
  component: JSX.Element;
}

interface StepProps {
  component: JSX.Element;
}

interface StepParentProps {
  steps: CommonProps[];
  timeline: (steps: CommonProps[]) => JSX.Element;
  renderItem: (
    key: number,
    step: CommonProps,
    isActive: boolean,
  ) => JSX.Element;
}
interface IStepContext {
  prev: () => void;
  next: () => void;
  currentStep: number;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

const StepContext = createContext<IStepContext | null>(null);
export const useSteps = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error("useSteps must be used within a Steps component");
  }
  return context;
};

const StepTimeline = ({ steps }: { steps: CommonProps[] }) => {
  const { currentStep } = useSteps();
  const title = steps?.[currentStep]?.title;
  const totalSteps = steps.length;
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    currentStep === 1 ? setProgress(100) : setProgress(50);
  }, [currentStep]);

  if (!title) {
    return null;
  }

  return (
    <div className="mx-auto mb-5 w-3/4 lg:w-1/2">
      <h1 className="text-center">{title} &nbsp;</h1>
      <p className="text-center">
        Step {currentStep + 1} of {totalSteps}
      </p>

      <Progress value={progress} className="mt-3 h-1 w-full lg:w-full" />
    </div>
  );
};

const Step = ({ component }: StepProps) => component;

const StepsParent = ({ steps, timeline, renderItem }: StepParentProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isPrevDisabled = selectedIndex === 0;
  const isNextDisabled = selectedIndex === steps.length - 1;

  const prev = () => {
    setSelectedIndex((prev) => prev - 1);
  };

  const next = () => {
    setSelectedIndex((prev) => prev + 1);
  };

  return (
    <StepContext.Provider
      value={{
        prev,
        next,
        isPrevDisabled,
        isNextDisabled,
        currentStep: selectedIndex,
      }}
    >
      {timeline(steps)}
      {steps.map((step, index) => {
        const isActive = index === selectedIndex;
        return isActive ? renderItem(index, step, isActive) : null;
      })}
    </StepContext.Provider>
  );
};

export const Steps = ({ steps }: { steps: CommonProps[] }) => {
  return (
    <StepsParent
      steps={steps}
      timeline={(steps) => <StepTimeline steps={steps} />}
      renderItem={(key, step) => <Step key={key} component={step.component} />}
    />
  );
};
