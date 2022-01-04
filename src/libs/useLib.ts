// async script loader
import React from "react";

const urls = new Set();

const useLib = (url: string) => {
  const [lib, setLib] = React.useState(false);

  React.useEffect(() => {
    if (urls.has(url)) {
      setLib(true);
      return;
    }

    urls.add(url);
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      setLib(true);
    };
    document.body.appendChild(script);
  }, [url]);

  return lib;
};

export default useLib;
