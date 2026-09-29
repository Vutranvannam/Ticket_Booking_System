import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";

interface FloatingMapControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

export const FloatingMapControls: React.FC<FloatingMapControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  isFullscreen = false,
  onToggleFullscreen,
  className = "",
}) => {
  const percentage = Math.round(scale * 100);

  return (
    <div
      className={`absolute bottom-6 right-6 z-20 flex items-center gap-1.5 p-1.5 backdrop-blur-md bg-slate-900/80 border border-slate-700/60 shadow-2xl rounded-2xl text-slate-200 transition-all duration-200 select-none ${className}`}
    >
      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        title="Phóng to (Zoom In)"
        className="p-2 rounded-xl hover:bg-slate-700/60 active:scale-95 transition-all text-slate-300 hover:text-white"
        aria-label="Phóng to"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        title="Thu nhỏ (Zoom Out)"
        className="p-2 rounded-xl hover:bg-slate-700/60 active:scale-95 transition-all text-slate-300 hover:text-white"
        aria-label="Thu nhỏ"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Percentage Display */}
      <span className="px-2 text-xs font-semibold tabular-nums text-slate-400 min-w-[48px] text-center">
        {percentage}%
      </span>

      <div className="w-[1px] h-5 bg-slate-700/80 mx-0.5" />

      {/* Reset view */}
      <button
        type="button"
        onClick={onReset}
        title="Khôi phục góc nhìn mặc định (Reset view)"
        className="p-2 rounded-xl hover:bg-slate-700/60 active:scale-95 transition-all text-slate-300 hover:text-white"
        aria-label="Khôi phục góc nhìn"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Fullscreen Toggle (if provided) */}
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
          className="p-2 rounded-xl hover:bg-slate-700/60 active:scale-95 transition-all text-slate-300 hover:text-white"
          aria-label={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
