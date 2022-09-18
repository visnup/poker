import { useEffect, useState } from "react";

export function useLocalStorage(
  name: string,
  defaultVal: string
): [value: string, setValue: (value: string) => void] {
  // Always initialize to default value to prevent client/server discrepancies
  const [value, setValue] = useState(defaultVal);

  // Immediately look in local storage for preset value
  useEffect(() => {
    const storedValue = localStorage.getItem(name);
    if (storedValue) setValue(storedValue);
  }, [name]);

  // Update local storage when the value changes
  useEffect(() => {
    localStorage.setItem(name, value);
  }, [name, value]);

  return [value, setValue];
}
