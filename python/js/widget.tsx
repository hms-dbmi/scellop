import { createRender, useModelState } from "@anywidget/react";
import * as React from "react";
import * as scellop from "scellop";
import { ScellopData } from "../../src/scellop-schema";

const render = createRender(() => {
  const [dataDict, _] =
    useModelState<{
      counts: Record<string, Record<string, number>>;
      metadata: {
        row: Record<string, Record<string, number>>;
        col: Record<string, Record<string, number>>;
      }
    }>("dataDict");

  const [data, setData] = React.useState<ScellopData | null>(null);

  React.useEffect(() => {
    if (Object.keys(dataDict).length > 0) {
      const loaded = scellop.loadDataWithCounts(dataDict.counts);
      loaded.metadata = {
        rows: dataDict.metadata.row ?? {},
        cols: dataDict.metadata.col ?? {},
      };
      setData(loaded);
    }
  }, [dataDict]);

  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  }>({
    width: 1000,
    height: 700,
  });

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const widgetNode = ref.current?.parentNode as HTMLDivElement;

    const handleResize = () => {
      if (widgetNode) {
        setDimensions({
          width: widgetNode.clientWidth,
          height: 800,
        });
      }
    };

    if (widgetNode) {
      widgetNode.addEventListener("resize", handleResize);
      setDimensions({
        width: widgetNode.clientWidth,
        height: 800,
      });
    }

    return () => {
      widgetNode?.removeEventListener("resize", handleResize);
      setDimensions({ width: 1000, height: 800 });
    };
  }, []);

  return (
    <div className="scellop" style={{ position: "relative" }} ref={ref}>
      {data ? (
        <scellop.Scellop
          data={data}
          theme={"light"}
          dimensions={dimensions}
          yAxis={{
            label: "Sample",
          }}
          xAxis={{
            label: "Cell Type",
          }}
        />
      ) : (
        "Loading..."
      )}
    </div>
  );
});

export default { render };
