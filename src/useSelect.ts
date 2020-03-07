import { useState, useCallback, useMemo, useEffect } from "react";
import useList from "./useList";
import useHandleKeydown from "./useHandleKeydown";
import useFilterInput from "./useFilterInput";
import useEphemeralString from "./useEphemeralString";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

interface IuseSelect<T> {
  items: Array<T>;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  onChangeFilter?(filterString: string): void;
  selected: T | Array<T>;
  onSelectOption(item: T): any;
  filterString?: string;
  autoTargetFirstItem?: boolean;
}

function useSelect({
  items,
  itemMatchesFilter,
  selected,
  onSelectOption,
  onChangeFilter,
  autoTargetFirstItem,
  filterString: controlledFilterString
}: IuseSelect<object>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [uncontrolledFilterString, setUncontrolledFilterString] = useState("");
  const isControlledFiltering = useMemo(() => !!controlledFilterString, [
    controlledFilterString
  ]);
  const filterString = useMemo(
    () => controlledFilterString || uncontrolledFilterString,
    [controlledFilterString, uncontrolledFilterString]
  );

  const handleChangeFilter = useCallback(
    filterString => {
      if (!isControlledFiltering) {
        setUncontrolledFilterString(filterString);
      }
      onChangeFilter && onChangeFilter(filterString);
    },
    [onChangeFilter, isControlledFiltering]
  );

  const close = useCallback(() => {
    handleChangeFilter("");
    setIsOpen(false);
  }, [setUncontrolledFilterString, setIsOpen]);

  const handleClickTrigger = useCallback(() => {
    setIsOpen(!isOpen);
    handleChangeFilter("");
  }, [isOpen]);

  const handleSelectOption = useCallback(
    option => {
      onSelectOption(option);
      setActiveItem(null);
      close();
    },
    [close, onSelectOption]
  );

  const {
    decoratedItems,
    getItemProps,
    getListProps,
    isItemActive,
    isItemSelected,
    listRef,
    decrementActiveItem,
    incrementActiveItem,
    defaultItemMatchesFilterString
  } = useList({
    activeItem,
    setActiveItem,
    items,
    filterString,
    itemMatchesFilter,
    selected,
    autoTargetFirstItem,
    onSelectItem: handleSelectOption
  });

  const getTriggerProps = useCallback(
    () => ({
      onClick: handleClickTrigger
    }),
    [handleClickTrigger]
  );

  const filterInputKeydownMap = useMemo(
    () => ({
      up: decrementActiveItem,
      down: incrementActiveItem,
      enter: () => handleSelectOption(activeItem),
      esc: close
    }),
    [
      decrementActiveItem,
      incrementActiveItem,
      activeItem,
      handleSelectOption,
      close
    ]
  );

  const handleUpdateKeyboardFocused = useCallback(
    string => {
      const firstMatch = decoratedItems.find(decoratedItem => {
        if (itemMatchesFilter) {
          return itemMatchesFilter(decoratedItem.item, string);
        } else {
          return defaultItemMatchesFilterString(decoratedItem, string);
        }
      });
      if (firstMatch) {
        setActiveItem(firstMatch.item);
      }
    },
    [decoratedItems, itemMatchesFilter]
  );

  const { handleKeyboardEvent } = useEphemeralString({
    onUpdateValue: handleUpdateKeyboardFocused
  });

  const handleKeydownSpaceSelect = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      handleSelectOption(activeItem);
    }
  }, [activeItem, handleSelectOption, setIsOpen, isOpen]);

  const selectKeydownMap = useMemo(
    () => ({
      up: decrementActiveItem,
      down: incrementActiveItem,
      space: handleKeydownSpaceSelect,
      enter: () => handleSelectOption(activeItem),
      esc: close,
      default: handleKeyboardEvent
    }),
    [close, filterInputKeydownMap, handleKeydownSpaceSelect]
  );

  const { getFilterInputProps, ref: filterInputRef } = useFilterInput({
    onChange: handleChangeFilter,
    keydownMap: filterInputKeydownMap
  });

  useEffect(() => {
    if (isOpen) {
      if (filterInputRef.current) {
        filterInputRef.current.focus();
      } else {
        listRef.current && listRef.current.focus();
      }
    }
  }, [isOpen, listRef, filterInputRef]);

  const { handleKeyDown: handleKeydownSelect } = useHandleKeydown(
    selectKeydownMap
  );
  const getSelectProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: handleKeydownSelect
    };
  }, [handleKeydownSelect]);

  return {
    isOpen,
    listRef,
    decoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected,
    onSelectItem: handleSelectOption
  };
}

export default useSelect;
