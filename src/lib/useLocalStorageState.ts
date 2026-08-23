import { useEffect, useState } from "react";

export function useLocalStorageState(key: string, initial: boolean) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(localStorage.getItem(key) === "true"), [key]);

  return [
    value,
    (value: boolean) => {
      localStorage.setItem(key, String(value));
      setValue(value);
    },
  ] as const;
}
