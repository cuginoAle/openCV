import React from "react";
import useLib from "../useLib";
const url = "https://docs.opencv.org/4.x/opencv.js";

const useOpenCV = () => {
  const scriptLoaded = useLib(url);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (scriptLoaded) {
      const cv = window.cv;
      if (cv.getBuildInformation) {
        setLoaded(true);
      } else {
        // WASM
        cv["onRuntimeInitialized"] = () => {
          setLoaded(true);
        };
      }
    }
  }, [scriptLoaded]);

  return loaded;
};

export default useOpenCV;
