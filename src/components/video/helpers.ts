interface ProcessVideoProps {
  cv: any;
  cap: any;
  src: any;
  dst: any;
  canvas: HTMLCanvasElement;
}

function processVideo({ cv, cap, src, dst, canvas }: ProcessVideoProps) {
  const output = src;
  try {
    // start processing.

    if (cap && cv) {
      cap.read(src);
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

      // gaussian blur
      let ksize = new cv.Size(3, 3);
      cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);

      // dilation
      let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
      cv.dilate(dst, dst, kernel);

      // threshold
      // cv.threshold(dst, dst, 150, 255, cv.THRESH_BINARY);

      // bilateral filter
      // cv.bilateralFilter(src, src, 9, 75, 75, cv.BORDER_DEFAULT);

      // canny;
      let lowThreshold = 20;
      let ratio = 5;
      let kernelSize = 3;
      cv.Canny(dst, dst, lowThreshold, lowThreshold * ratio, kernelSize);

      // find contours
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      const poly = new cv.MatVector();
      cv.findContours(
        dst,
        contours,
        hierarchy,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
      );

      let i = 0;

      while (i < contours.size()) {
        const c = contours.get(i);
        const rect = cv.boundingRect(c);
        const perimeter = cv.arcLength(c, true);
        const epsilon = 0.02 * perimeter;

        let approx = new cv.Mat();
        cv.approxPolyDP(c, approx, epsilon, true);
        poly.push_back(approx);

        const { width, height, x, y } = rect;
        const cornerCount = approx.rows;
        const ratio = Number((width / height).toFixed(2));

        if (
          width > 60 &&
          width < 300 &&
          ratio > 1.5 &&
          ratio < 2.5 &&
          cornerCount === 4
        ) {
          const p1 = new cv.Point(x, y);
          const p2 = new cv.Point(x + width, y + height);

          const label = `${width}/${height} > ${ratio}`;
          cv.rectangle(output, p1, p2, [255, 200, 0, 200], 2);
          drawPolygon(cv, output, getCorners(cv, approx));

          cv.putText(
            output,
            label,
            p1,
            cv.FONT_HERSHEY_SIMPLEX,
            0.7,
            [0, 0, 0, 0],
            5
          );

          cv.putText(
            output,
            label,
            p1,
            cv.FONT_HERSHEY_SIMPLEX,
            0.7,
            [25, 255, 0, 255],
            1
          );
        }
        i += 1;
      }

      cv.imshow(canvas, output);
    }
  } catch (err) {
    console.error(err);
  }
}

function getCorners(cv: any, approx: any) {
  const data = Array.from(approx.data32S);

  const points = [];
  while (data.length) {
    points.push(data.splice(0, 2));
  }

  return points.map((p) => new cv.Point(p[0], p[1]));
}

function drawPolygon(cv: any, img: any, points: any[]) {
  const lines = points.reduce((acc, curr, i) => {
    if (i < points.length - 2) {
      acc.push([curr, points[i + 1]]);
    }
    return acc;
  }, []);

  lines.forEach((l: any) => {
    cv.line(img, l[0], l[1], [0, 255, 0, 255], 1, cv.LINE_8);
  });
}

export default processVideo;
export type { ProcessVideoProps };
