import React from "react";

import { Progress } from "../ui/progress";

export const Loader = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(
      () =>
        setProgress((prevValue) =>
          prevValue < 100 ? prevValue + 10 : prevValue,
        ),
      300,
    );

    return () => {
      clearTimeout(timer);
    };
  }, [progress]);

  return (
    <div className="pointer-events-none flex h-[80vh] flex-col items-center justify-center backdrop-blur-sm lg:h-[86vh]">
      <Progress value={progress} />
    </div>
  );
};
