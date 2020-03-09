import { useRef, useCallback, KeyboardEvent } from "react";

interface IUseFilterInput {
  onChange?(arg: string): any;
  onKeyDown(value: KeyboardEvent): void;
}

function useFilterInput({ onChange, onKeyDown }: IUseFilterInput) {
  const ref = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    e => {
      const {
        target: { value }
      } = e;
      onChange && onChange(value);
      e.preventDefault();
    },
    [onChange]
  );

  const getFilterInputProps = useCallback(
    () => ({
      onChange: handleInputChange,
      onKeyDown,
      "data-testid": "filterInput",
      ref
    }),
    [handleInputChange, onKeyDown]
  );

  return { getFilterInputProps, ref };
}

export default useFilterInput;
