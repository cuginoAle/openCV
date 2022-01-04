import React from "react";

const useInterval = () => {
  const hnd = React.useRef<NodeJS.Timeout>();

  const start = (fn: () => void, interval: number) => {
    stop();
    hnd.current = setInterval(fn, interval);
  };

  const stop = () => {
    if (hnd.current) clearInterval(hnd.current);
  };

  React.useEffect(() => {
    return stop;
  }, []);

  return [start, stop];
};

export default useInterval;
