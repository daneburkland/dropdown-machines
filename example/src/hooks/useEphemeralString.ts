import { useEffect, useState, useCallback } from "react";

interface IUseEphemeralString {
  onUpdateValue?(arg: string): any;
  delay?: number;
}

export default function useEphemeralString({
  onUpdateValue,
  delay = 350
}: IUseEphemeralString) {
  const [stringValue, setStringValue] = useState("");

  const handleKeyboardEvent = useCallback(
    e => {
      setStringValue(
        stringValue.concat(String.fromCharCode(e.which).toLowerCase())
      );
    },
    [stringValue]
  );

  useEffect(() => {
    if (onUpdateValue && !!stringValue) {
      onUpdateValue(stringValue);
    }
    const handler = setTimeout(() => {
      setStringValue("");
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [stringValue, delay, onUpdateValue]);

  return { handleKeyboardEvent };
}
