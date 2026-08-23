import { useCallback, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initial : (JSON.parse(stored) as T);
  });

  return [
    value,
    useCallback(
      (value: T) => {
        localStorage.setItem(key, JSON.stringify(value));
        setValue(value);
      },
      [key],
    ),
  ] as const;
}
