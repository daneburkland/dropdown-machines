import { useRef, useCallback } from "react";
import useHandleKeydown from "./useHandleKeydown";

type KeydownKey = "down" | "up" | "enter";
type KeydownMap = {
  [T in KeydownKey]: any;
};

interface IUseFilterInput {
  onChange(arg: string): any;
  keydownMap: KeydownMap;
}

function useFilterInput({ onChange, keydownMap }: IUseFilterInput) {
  const ref = useRef<HTMLInputElement>(null);

  const { handleKeyDown } = useHandleKeydown(keydownMap);

  const handleInputChange = useCallback(
    ({ target: { value } }) => {
      onChange(value);
    },
    [onChange]
  );

  const getFilterInputProps = useCallback(
    () => ({
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      ref
    }),
    [handleInputChange, handleKeyDown]
  );

  return { getFilterInputProps, ref };
}

export default useFilterInput;
