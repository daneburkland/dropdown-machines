import { useState, useCallback, useMemo, useEffect, FormEvent } from "react";
import useList from "./useList";
import useHandleKeydown from "./useHandleKeydown";
// import { isArray } from "./utils";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

interface IUseCombobox<T> {
  items: Array<T>;
  value: string;
  onUpdateValue?(value: string): void;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  onSelectOption(item: T): any;
}

function useCombobox({
  items,
  itemMatchesFilter,
  value,
  onUpdateValue,
  onSelectOption
}: IUseCombobox<object>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectOption = useCallback(
    option => {
      onSelectOption(option);
      setIsOpen(false);
    },
    [close, onSelectOption]
  );

  const {
    items: filteredItems,
    getItemProps,
    getFilterInputProps,
    getListProps,
    isItemActive,
    baseKeydownMap
  } = useList({
    items,
    filterString: value,
    itemMatchesFilter,
    onSelectItem: handleSelectOption,
    isOpen
  });

  const hasMatches = useMemo(() => {
    return !!value && !!filteredItems.length;
  }, [value, filteredItems.length]);

  useEffect(() => {
    if (hasMatches) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [hasMatches]);

  const selectKeydownMap = useMemo(
    () => ({
      ...baseKeydownMap
    }),
    [baseKeydownMap]
  );

  const { handleKeyDown } = useHandleKeydown(selectKeydownMap);

  const handleChange = useCallback(
    (e: FormEvent) => {
      console.log("inhook", (<HTMLInputElement>e.target).value);
      onUpdateValue && onUpdateValue((<HTMLInputElement>e.target).value);
    },
    [onUpdateValue]
  );

  const getComboboxProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      onChange: handleChange,
      value
    };
  }, [handleKeyDown]);

  return {
    setIsOpen,
    isOpen,
    filteredItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getComboboxProps,
    isItemActive
  };
}

export default useCombobox;
