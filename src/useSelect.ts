import { useState, useCallback, useMemo, useEffect } from "react";
import useList from "./useList";
import useFilterInput from "./useFilterInput";
import useEphemeralString from "./useEphemeralString";
import { DecoratedItem } from "./index";
import keycode from "keycode";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = any;

interface IuseSelect<T> {
  items: Array<T>;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  onChangeFilter?(filterString: string): void;
  selected: null | T | Array<T>;
  onSelectOption(item: T | null): void;
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
}: IuseSelect<Item>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
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
    decoratedItem => {
      if (isOpen) {
        if (!!decoratedItem) {
          onSelectOption(decoratedItem.item);
        }
        setActiveItem(null);
        close();
      }
    },
    [close, onSelectOption, isOpen]
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
    defaultItemMatchesFilterString,
    scrollDecoratedItemIntoView,
    activeDecoratedItem
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

  const handleKeyDownFilter = useCallback(
    e => {
      switch (keycode(e.which)) {
        case "up":
          decrementActiveItem();
          e.preventDefault();
          return;
        case "down":
          incrementActiveItem();
          e.preventDefault();
          return;
        case "enter":
          handleSelectOption(activeDecoratedItem);
          return;
        case "esc":
        case "tab":
          close();
          return;
        default:
          return;
      }
    },
    [
      decrementActiveItem,
      incrementActiveItem,
      handleSelectOption,
      activeDecoratedItem
    ]
  );

  const handleUpdateKeyboardFocused = useCallback(
    string => {
      const firstMatch = decoratedItems.find(
        (decoratedItem: DecoratedItem<HTMLElement, object>) => {
          if (itemMatchesFilter) {
            return itemMatchesFilter(decoratedItem.item, string);
          } else {
            return defaultItemMatchesFilterString(decoratedItem, string);
          }
        }
      );
      if (firstMatch) {
        setActiveItem(firstMatch.item);
        scrollDecoratedItemIntoView(firstMatch);
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
      handleSelectOption(activeDecoratedItem);
    }
  }, [activeItem, handleSelectOption, setIsOpen, isOpen]);

  const { getFilterInputProps, ref: filterInputRef } = useFilterInput({
    onChange: handleChangeFilter,
    onKeyDown: handleKeyDownFilter
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

  const handleKeyDownSelect = useCallback(
    e => {
      switch (keycode(e.which)) {
        case "up":
          decrementActiveItem();
          e.preventDefault();
          return;
        case "down":
          incrementActiveItem();
          e.preventDefault();
          return;
        case "space":
          handleKeydownSpaceSelect();
          return;
        case "enter":
          handleSelectOption(activeDecoratedItem);
          return;
        case "esc":
        case "tab":
          close();
          return;
        default:
          handleKeyboardEvent(e);
      }
    },
    [
      decrementActiveItem,
      incrementActiveItem,
      handleKeydownSpaceSelect,
      handleSelectOption,
      activeDecoratedItem,
      handleKeyboardEvent
    ]
  );

  const getSelectProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: handleKeyDownSelect,
      "data-testid": "select",
      onClick: handleClickTrigger
    };
  }, [handleKeyDownSelect]);

  return {
    isOpen,
    listRef,
    decoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    isItemActive,
    isItemSelected
  };
}

export default useSelect;
