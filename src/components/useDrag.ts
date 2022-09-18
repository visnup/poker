import { useEffect, useRef, useState } from "react";

export function useDrag() {
  const [distance, setDistance] = useState(0);
  const [direction, setDirection] = useState(NaN);

  const start = useRef<number[] | undefined>(undefined);

  function pointerdown({ clientX, clientY }: PointerEvent) {
    start.current = [clientX, clientY];
  }
  function pointerup() {
    start.current = undefined;
    setDistance(0);
  }
  function pointermove({ clientX, clientY }: PointerEvent) {
    if (start.current) {
      const [x, y] = start.current;
      setDistance(Math.hypot(clientX - x, clientY - y));
    }
  }

  useEffect(() => {
    document.addEventListener("pointerdown", pointerdown);
    document.addEventListener("pointerup", pointerup);
    document.addEventListener("pointermove", pointermove);
    return () => {
      document.removeEventListener("pointerdown", pointerdown);
      document.removeEventListener("pointerup", pointerup);
      document.removeEventListener("pointermove", pointermove);
    };
  }, []);

  return [distance, direction];
}
