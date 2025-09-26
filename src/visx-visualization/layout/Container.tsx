import React, {
  RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { useDimensions } from "../../contexts/DimensionsContext";
import { useViewType } from "../../contexts/ViewTypeContext";
import Tooltip from "../Tooltip";

import { ParentRefProvider } from "../../contexts/ContainerRefContext";

import { useTheme } from "@mui/material/styles";
import { Root as ContextMenuRoot, Trigger } from "@radix-ui/react-context-menu";
import { PanelRefProvider } from "../../contexts/PanelRefContext";
import {
  useSetTooltipData,
  useTooltipData,
} from "../../contexts/TooltipDataContext";
import { MappedPanelSection } from "../../contexts/types";
import { ControlsModal } from "../controls/ControlsModal";
import ContextMenuComponent from "../heatmap/ContextMenu";
import BottomCenterPanel from "./BottomCenter";
import BottomLeftPanel from "./BottomLeft";
import BottomRightPanel from "./BottomRight";
import MiddleCenterPanel from "./MiddleCenter";
import MiddleLeftPanel from "./MiddleLeft";
import MiddleRightPanel from "./MiddleRight";
import { VisualizationPanelProps } from "./Panel";
import VisualizationPanelResizer from "./PanelResizer";
import TopCenterPanel from "./TopCenter";
import TopLeftPanel from "./TopLeft";
import TopRightPanel from "./TopRight";

type PanelComponent = React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;

const usePanelProps = (id: string) => {
  const leftTop = useRef<HTMLDivElement>(null);
  const centerTop = useRef<HTMLDivElement>(null);
  const rightTop = useRef<HTMLDivElement>(null);
  const leftMiddle = useRef<HTMLDivElement>(null);
  const centerMiddle = useRef<HTMLDivElement>(null);
  const rightMiddle = useRef<HTMLDivElement>(null);
  const leftBottom = useRef<HTMLDivElement>(null);
  const centerBottom = useRef<HTMLDivElement>(null);
  const rightBottom = useRef<HTMLDivElement>(null);

  return useMemo(() => {
    const panelPropList: Array<{
      id: string;
      ref: RefObject<HTMLDivElement>;
      section: MappedPanelSection;
      Component: PanelComponent;
    }> = [
      {
        id: `${id}-top-left`,
        ref: leftTop,
        Component: TopLeftPanel,
        section: "left_top",
      },
      {
        id: `${id}-top-center`,
        ref: centerTop,
        Component: TopCenterPanel,
        section: "center_top",
      },
      {
        id: `${id}-top-right`,
        ref: rightTop,
        Component: TopRightPanel,
        section: "right_top",
      },
      {
        id: `${id}-middle-left`,
        ref: leftMiddle,
        Component: MiddleLeftPanel,
        section: "left_middle",
      },
      {
        id: `${id}-middle-center`,
        ref: centerMiddle,
        Component: MiddleCenterPanel,
        section: "center_middle",
      },
      {
        id: `${id}-middle-right`,
        ref: rightMiddle,
        Component: MiddleRightPanel,
        section: "right_middle",
      },
      {
        id: `${id}-bottom-left`,
        ref: leftBottom,
        Component: BottomLeftPanel,
        section: "left_bottom",
      },
      {
        id: `${id}-bottom-center`,
        ref: centerBottom,
        Component: BottomCenterPanel,
        section: "center_bottom",
      },
      {
        id: `${id}-bottom-right`,
        ref: rightBottom,
        Component: BottomRightPanel,
        section: "right_bottom",
      },
    ];
    const panelRefMap: Record<
      MappedPanelSection,
      RefObject<HTMLDivElement>
    > = panelPropList.reduce<
      Record<MappedPanelSection, RefObject<HTMLDivElement>>
    >(
      (acc, { section, ref }) => {
        acc[section] = ref;
        return acc;
      },
      {} as Record<MappedPanelSection, RefObject<HTMLDivElement>>,
    );
    return { panelPropList, panelRefMap };
  }, [id]);
};

export default function VizContainerGrid() {
  const { width, height, rowSizes, columnSizes, resizeColumn, resizeRow } =
    useDimensions();
  const { viewType } = useViewType();

  // Track when we're transitioning between view types
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevViewType = useRef(viewType);

  // Trigger transition state when view type changes
  useEffect(() => {
    if (prevViewType.current !== viewType) {
      setIsTransitioning(true);
      prevViewType.current = viewType;

      // Reset transition state after animation completes
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 450); // Slightly longer than the 400ms transition

      return () => clearTimeout(timeout);
    }
  }, [viewType]);

  const theme = useTheme();

  const parentRef = useRef<HTMLDivElement>(null);

  const gridTemplateColumns = columnSizes.map((size) => `${size}px`).join(" ");
  const gridTemplateRows = rowSizes.map((size) => `${size}px`).join(" ");

  const id = useId();

  const { openContextMenu, closeContextMenu, closeTooltip } =
    useSetTooltipData();
  const { tooltipData } = useTooltipData();

  const { panelPropList, panelRefMap } = usePanelProps(id);

  // Determine which panels should render their children based on view type
  const shouldRenderPanelChildren = useCallback(
    (section: MappedPanelSection) => {
      if (viewType === "traditional") {
        return section.endsWith("_top");
      }
      // In default view, all panels render their children
      return true;
    },
    [viewType],
  );

  const onContextMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open && tooltipData) {
        openContextMenu();
        return;
      }
      closeContextMenu();
      closeTooltip();
    },
    [openContextMenu, closeContextMenu, closeTooltip, tooltipData],
  );

  const transition = useMemo(() => {
    if (!isTransitioning) return "none";
    return "grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1), grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
  }, [isTransitioning]);

  return (
    <ParentRefProvider value={parentRef}>
      <PanelRefProvider value={panelRefMap}>
        <ContextMenuRoot onOpenChange={onContextMenuOpenChange}>
          <Trigger asChild>
            <div
              style={{ position: "relative" }}
              ref={parentRef}
              id={`${id}-main-container`}
            >
              <div
                style={{
                  width,
                  height,
                  display: "grid",
                  gridTemplateColumns,
                  gridTemplateRows,
                  background: theme.palette.background.default,
                  transition,
                }}
              >
                {panelPropList.map(({ id, ref, Component, section }) => (
                  <Component
                    key={id}
                    id={id}
                    ref={ref}
                    shouldRenderChildren={shouldRenderPanelChildren(section)}
                    isTransitioning={isTransitioning}
                  />
                ))}
              </div>
              <VisualizationPanelResizer
                index={0}
                resize={resizeColumn}
                orientation="X"
              />
              <VisualizationPanelResizer
                index={1}
                resize={resizeColumn}
                orientation="X"
              />
              <VisualizationPanelResizer
                index={0}
                resize={resizeRow}
                orientation="Y"
                visible={viewType === "default"}
                isTransitioning={isTransitioning}
              />
              <VisualizationPanelResizer
                index={1}
                resize={resizeRow}
                orientation="Y"
                visible={viewType === "default"}
                isTransitioning={isTransitioning}
              />
              <Tooltip />
            </div>
          </Trigger>
          <ContextMenuComponent />
        </ContextMenuRoot>
        <ControlsModal />
      </PanelRefProvider>
    </ParentRefProvider>
  );
}
