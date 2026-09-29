import React, { useState, useEffect, useRef, useCallback } from "react";
import type { MapRegion } from "../../types/venue-map.types";
import { useSvgPanZoom } from "../../hooks/useSvgPanZoom";
import { FloatingMapControls } from "./FloatingMapControls";
import { RegionInfoPopover } from "./RegionInfoPopover";

interface SvgPanZoomViewerProps {
  svgContent: string;
  regions: MapRegion[];
  selectedRegionId?: string | null;
  onSelectRegion?: (region: MapRegion) => void;
  onHoverRegion?: (region: MapRegion | null) => void;
  className?: string;
  minScale?: number;
  maxScale?: number;
}

export const SvgPanZoomViewer: React.FC<SvgPanZoomViewerProps> = ({
  svgContent,
  regions,
  selectedRegionId = null,
  onSelectRegion,
  onHoverRegion,
  className = "",
  minScale = 0.4,
  maxScale = 4.0,
}) => {
  const {
    scale,
    position,
    isDragging,
    containerRef,
    zoomIn,
    zoomOut,
    resetView,
    panZoomProps,
  } = useSvgPanZoom({ minScale, maxScale });

  const svgHostRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, [containerRef]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const regionMapBySvgId = useRef<Map<string, MapRegion>>(new Map());
  useEffect(() => {
    const map = new Map<string, MapRegion>();
    regions.forEach((r) => map.set(r.svgElementId, r));
    regionMapBySvgId.current = map;
  }, [regions]);

  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;

    host.innerHTML = svgContent;

    const svgElement = host.querySelector("svg");
    if (!svgElement) return;

    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");
    svgElement.style.overflow = "visible";

    // Disable events on non-region elements (backgrounds, decor, aisles)
    const allElements = svgElement.querySelectorAll("*[id]");
    allElements.forEach((el) => {
      const id = el.getAttribute("id") || "";
      if (!id.startsWith("region-")) {
        (el as HTMLElement).style.pointerEvents = "none";
      }
    });

    const regionElements = svgElement.querySelectorAll('[id^="region-"]');
    const cleanupFns: Array<() => void> = [];

    regionElements.forEach((el) => {
      const elementId = el.getAttribute("id") || "";
      const regionData = regionMapBySvgId.current.get(elementId);
      const htmlEl = el as HTMLElement;

      htmlEl.style.cursor = "pointer";
      htmlEl.style.transition = "all 0.15s ease-out";
      htmlEl.style.pointerEvents = "auto";

      // Find the main polygon/path shape
      const shape = (htmlEl.querySelector("path, rect, polygon") as HTMLElement) || htmlEl;

      const onEnter = (e: MouseEvent) => {
        // High-contrast clean highlight without blurring text
        shape.style.filter = "brightness(1.25)";
        shape.style.stroke = "#ffffff";
        shape.style.strokeWidth = "3.5px";

        if (regionData) {
          setHoveredRegion(regionData);
          onHoverRegion?.(regionData);

          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setPopoverPos({
              x: e.clientX - containerRect.left,
              y: e.clientY - containerRect.top,
            });
          }
        }
      };

      const onMove = (e: MouseEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          setPopoverPos({
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top,
          });
        }
      };

      const onLeave = () => {
        const isSelected = regionData && regionData.id === selectedRegionId;
        const currentShape = (htmlEl.querySelector("path, rect, polygon") as HTMLElement) || htmlEl;
        if (!isSelected) {
          currentShape.style.filter = "none";
          currentShape.style.strokeWidth = "2.5px";
          currentShape.style.stroke = regionData?.colorCode || "#64748b";
        }
        setHoveredRegion(null);
        setPopoverPos(null);
        onHoverRegion?.(null);
      };

      const onClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (regionData) {
          onSelectRegion?.(regionData);
        }
      };

      htmlEl.addEventListener("mouseenter", onEnter);
      htmlEl.addEventListener("mousemove", onMove);
      htmlEl.addEventListener("mouseleave", onLeave);
      htmlEl.addEventListener("click", onClick);

      cleanupFns.push(() => {
        htmlEl.removeEventListener("mouseenter", onEnter);
        htmlEl.removeEventListener("mousemove", onMove);
        htmlEl.removeEventListener("mouseleave", onLeave);
        htmlEl.removeEventListener("click", onClick);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [svgContent, onSelectRegion, onHoverRegion, selectedRegionId, containerRef]);

  // Synchronize selection glow with V1 Primary Indigo without blurring labels
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;

    regions.forEach((r) => {
      const el = host.querySelector(`#${r.svgElementId}`) as HTMLElement | null;
      if (!el) return;
      const shape = (el.querySelector("path, rect, polygon") as HTMLElement) || el;

      if (r.id === selectedRegionId) {
        shape.style.filter = "brightness(1.3)";
        shape.style.strokeWidth = "4.5px";
        shape.style.stroke = "#6366f1"; // V1 Primary Indigo
      } else {
        shape.style.filter = "none";
        shape.style.strokeWidth = "2.5px";
        shape.style.stroke = r.colorCode || "#64748b";
      }
    });
  }, [selectedRegionId, regions]);

  return (
    <div
      {...panZoomProps}
      className={`relative w-full h-full overflow-hidden bg-slate-950 border border-border rounded-2xl select-none shadow-inner ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
    >
      <div
        className="w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out origin-center"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
        }}
      >
        <div
          ref={svgHostRef}
          className="w-full h-full flex items-center justify-center pointer-events-auto"
        />
      </div>

      <RegionInfoPopover region={hoveredRegion} position={popoverPos} />

      <FloatingMapControls
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};
