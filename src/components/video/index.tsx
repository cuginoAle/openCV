import React from "react";
import styled from "styled-components";
import useOpenCV from "../../libs/opencv";
import useInterval from "../../utils/hooks/useInterval";
import processVideo from "./helpers";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  video {
    max-width: 100%;
    display: none;
  }

  canvas {
    max-width: 100%;
  }
`;

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const width = 720;
const height = 480;
const FPS = 6;

const Component: React.FC<Props> = ({ className, children }: Props) => {
  const classes = ["Video"];
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cvLoaded = useOpenCV();
  const [videoSize, setVideoSize] =
    React.useState<{ width: number; height: number }>();
  const [src, setSrc] = React.useState<any>();
  const [dst, setDst] = React.useState<any>();

  const [startTick] = useInterval();

  //@ts-ignore
  const cv = window.cv;

  const [cap, setCap] = React.useState<any>();

  if (className) classes.push(className);

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(function (stream) {
        const video = videoRef.current;

        if (video && cvLoaded && canvasRef.current) {
          const videoEl: HTMLVideoElement = video;
          videoEl.addEventListener("playing", () => {
            setVideoSize({
              width: videoEl.videoWidth,
              height: videoEl.videoHeight,
            });
          });

          videoEl.srcObject = stream;
          videoEl.play();
        }
      })
      .catch(function (err) {
        console.log("An error occurred! " + err);
      });
  }, [videoRef, cvLoaded, canvasRef]);

  React.useEffect(() => {
    if (cvLoaded && videoSize) {
      const video = videoRef.current;
      setCap(new cv.VideoCapture(video));

      setSrc(new cv.Mat(videoSize.height, videoSize.width, cv.CV_8UC4));
      setDst(new cv.Mat(videoSize.height, videoSize.width, cv.CV_8UC1));

      return () => {
        if (src && dst) {
          src.delete();
          dst.delete();
        }
      };
    }
  }, [videoSize, cvLoaded]);

  startTick(() => {
    processVideo({ cv, cap, src, dst, canvas: canvasRef.current! });
  }, 1000 / FPS);

  return (
    <Wrapper className={classes.join(" ")}>
      {cvLoaded ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={videoSize ? videoSize.width : width}
            height={videoSize ? videoSize.height : height}
          />
          <canvas ref={canvasRef} />
        </>
      ) : (
        <p>Loading OpenCV...</p>
      )}
    </Wrapper>
  );
};

Component.displayName = "Video";

export default Component;
