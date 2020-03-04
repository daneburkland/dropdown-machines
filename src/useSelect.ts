import { useState, useCallback, useMemo } from "react";
import useList from "./useList";
import useHandleKeydown from "./useHandleKeydown";
// import { isArray } from "./utils";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

interface IuseSelect<T> {
  items: Array<T>;
  itemDisplayValue?(item: T): string;
  selected: T | Array<T>;
  onSelectOption(item: T): any;
}

function useSelect({
  items,
  itemDisplayValue,
  selected,
  onSelectOption
}: IuseSelect<object>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterString, setFilterString] = useState("");

  const close = useCallback(() => {
    setFilterString("");
    setIsOpen(false);
  }, [setFilterString, setIsOpen]);

  const handleClickTrigger = useCallback(() => {
    setIsOpen(!isOpen);
    setFilterString("");
  }, [isOpen]);

  const handleSelectOption = useCallback(
    option => {
      onSelectOption(option);
      close();
    },
    [close, onSelectOption]
  );

  const {
    items: filteredItems,
    getItemProps,
    getFilterInputProps,
    getListProps,
    isItemActive,
    isItemSelected,
    activeItem,
    focusableKeydownMap,
    isFilterable,
    listRef
  } = useList({
    items,
    filterString,
    onUpdateFilterString: setFilterString,
    itemDisplayValue,
    selected,
    onSelectItem: handleSelectOption,
    onDeactivate: close,
    isOpen
  });

  const getTriggerProps = useCallback(
    () => ({
      onClick: handleClickTrigger
    }),
    [handleClickTrigger]
  );

  const handleKeydownSpace = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      handleSelectOption(activeItem);
    }
  }, [activeItem, handleSelectOption, setIsOpen, isOpen]);

  const selectKeydownMap = useMemo(
    () => ({
      ...(isFilterable ? {} : focusableKeydownMap),
      space: handleKeydownSpace,
      esc: close
    }),
    [close, isFilterable, focusableKeydownMap, handleKeydownSpace]
  );

  const { handleKeyDown } = useHandleKeydown(selectKeydownMap);

  const getSelectProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: handleKeyDown
    };
  }, [handleKeyDown]);

  return {
    setIsOpen,
    isOpen,
    listRef,
    filteredItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected
  };
}

export default useSelect;
