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
    document.body.addEventListener("pointerdown", pointerdown);
    document.body.addEventListener("pointerup", pointerup);
    document.body.addEventListener("pointermove", pointermove);
    document.body.style.touchAction = "none";
    return () => {
      document.body.removeEventListener("pointerdown", pointerdown);
      document.body.removeEventListener("pointerup", pointerup);
      document.body.removeEventListener("pointermove", pointermove);
      document.body.style.touchAction = "auto";
    };
  }, []);

  return [distance, direction];
}
