import { useState, useCallback, useRef, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseSvgPanZoomOptions {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  initialScale?: number;
}

export function useSvgPanZoom(options: UseSvgPanZoomOptions = {}) {
  const {
    minScale = 0.4,
    maxScale = 4.0,
    scaleStep = 1.2,
    initialScale = 1.0,
  } = options;

  const [scale, setScale] = useState<number>(initialScale);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);

  // Zoom In
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * scaleStep, maxScale));
  }, [scaleStep, maxScale]);

  // Zoom Out
  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev / scaleStep, minScale));
  }, [scaleStep, minScale]);

  // Reset to default
  const resetView = useCallback(() => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  }, [initialScale]);

  // Mouse Handlers for Pan
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ kích hoạt pan khi bấm chuột trái (button === 0)
    if (e.button !== 0) return;
    
    // Nếu người dùng đang click vào một region có thể tương tác thì không bắt đầu drag nếu đó là click đơn
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel Zoom (centered on cursor)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? scaleStep : 1 / scaleStep;
      
      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale * factor, minScale), maxScale);
        if (newScale === prevScale) return prevScale;

        // Điều chỉnh vị trí để điểm trỏ chuột làm tâm zoom
        setPosition((prevPos) => ({
          x: mouseX - (mouseX - prevPos.x) * (newScale / prevScale),
          y: mouseY - (mouseY - prevPos.y) * (newScale / prevScale),
        }));

        return newScale;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scaleStep, minScale, maxScale]);

  // Touch Handlers (mobile pinch & pan)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      } else if (e.touches.length === 2) {
        setIsDragging(false);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        lastTouchDistanceRef.current = dist;
      }
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1 && isDragging) {
        setPosition({
          x: e.touches[0].clientX - dragStartRef.current.x,
          y: e.touches[0].clientY - dragStartRef.current.y,
        });
      } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / lastTouchDistanceRef.current;
        lastTouchDistanceRef.current = dist;
        setScale((prev) => Math.min(Math.max(prev * factor, minScale), maxScale));
      }
    },
    [isDragging, minScale, maxScale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;
  }, []);

  return {
    scale,
    position,
    isDragging,
    containerRef,
    zoomIn,
    zoomOut,
    resetView,
    setScale,
    setPosition,
    panZoomProps: {
      ref: containerRef,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
