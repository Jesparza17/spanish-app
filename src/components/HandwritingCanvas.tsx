"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export type Stroke = StrokePoint[];

export interface HandwritingCanvasHandle {
  undo: () => void;
  clear: () => void;
}

const BASE_WIDTH = 2.5;
const ERASER_RADIUS = 14;

function distance(a: StrokePoint, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function strokeHitsPoint(stroke: Stroke, point: { x: number; y: number }): boolean {
  return stroke.some((p) => distance(p, point) <= ERASER_RADIUS);
}

const HandwritingCanvas = forwardRef<HandwritingCanvasHandle, { strokes: Stroke[]; onChange: (strokes: Stroke[]) => void; mode: "pen" | "eraser" }>(
  function HandwritingCanvas({ strokes, onChange, mode }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef<Stroke | null>(null);
    const strokesRef = useRef<Stroke[]>(strokes);
    strokesRef.current = strokes;

    function redraw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#22283A";

      const all = drawingRef.current ? [...strokesRef.current, drawingRef.current] : strokesRef.current;
      for (const stroke of all) {
        for (let i = 1; i < stroke.length; i++) {
          const prev = stroke[i - 1];
          const cur = stroke[i];
          const pressure = cur.pressure > 0 ? cur.pressure : 0.5;
          ctx.lineWidth = Math.max(0.75, pressure * BASE_WIDTH * 2);
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function resizeCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      redraw();
    }

    useEffect(() => {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      redraw();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strokes]);

    useImperativeHandle(ref, () => ({
      undo() {
        onChange(strokesRef.current.slice(0, -1));
      },
      clear() {
        onChange([]);
      },
    }));

    function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>): StrokePoint {
      const rect = e.currentTarget.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      e.currentTarget.setPointerCapture(e.pointerId);
      const point = pointFromEvent(e);
      if (mode === "eraser") {
        const remaining = strokesRef.current.filter((s) => !strokeHitsPoint(s, point));
        if (remaining.length !== strokesRef.current.length) onChange(remaining);
        return;
      }
      drawingRef.current = [point];
      redraw();
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (e.buttons === 0) return;
      const point = pointFromEvent(e);
      if (mode === "eraser") {
        const remaining = strokesRef.current.filter((s) => !strokeHitsPoint(s, point));
        if (remaining.length !== strokesRef.current.length) onChange(remaining);
        return;
      }
      if (!drawingRef.current) return;
      drawingRef.current.push(point);
      redraw();
    }

    function handlePointerUp() {
      if (drawingRef.current && drawingRef.current.length > 1) {
        onChange([...strokesRef.current, drawingRef.current]);
      }
      drawingRef.current = null;
    }

    return (
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full touch-none bg-white rounded-2xl"
        style={{ touchAction: "none" }}
      />
    );
  }
);

export default HandwritingCanvas;
