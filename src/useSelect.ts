import { useState, useCallback, useMemo } from "react";
import { useMachine } from "@xstate/react";
import selectMachine, {
  KEY_DOWN_DOWN,
  KEY_DOWN_UP,
  KEY_DOWN_SPACE,
  KEY_DOWN_ENTER,
  KEY_DOWN_ESC,
  KEY_DOWN_TAB,
  CLICK_TRIGGER,
  CLICK_ITEM,
  UPDATE_FILTER
} from "./selectMachine";
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
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [uncontrolledFilterString, setUncontrolledFilterString] = useState("");

  const isControlledFiltering = useMemo(() => !!controlledFilterString, [
    controlledFilterString
  ]);
  const filterString = useMemo(
    () => controlledFilterString || uncontrolledFilterString,
    [controlledFilterString, uncontrolledFilterString]
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
    onClickItem: handleClickItem
  });

  const handleKeyDownFilter = useCallback(e => {
    switch (keycode(e.which)) {
      case "up":
        send(KEY_DOWN_UP);
        e.preventDefault();
        return;
      case "down":
        send(KEY_DOWN_DOWN);
        e.preventDefault();
        return;
      case "enter":
        send(KEY_DOWN_ENTER);
        return;
      case "esc":
        send(KEY_DOWN_ESC);
        return;
      case "tab":
        send(KEY_DOWN_TAB);
        return;
      default:
        return;
    }
  }, []);

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

  const { getFilterInputProps, ref: filterInputRef } = useFilterInput({
    onChange: handleFilterStringChange,
    onKeyDown: handleKeyDownFilter
  });

  const [state, send] = useMachine(selectMachine, {
    actions: {
      decrementActiveItem,
      incrementActiveItem,
      handleSelectItem: (_, e: any) => {
        const { item } = e;
        switch (e.type) {
          case CLICK_ITEM:
            onSelectOption(item);
            return;
          default:
            onSelectOption(activeDecoratedItem.item);
            return;
        }
      },
      clearActiveItem: () => setActiveItem(null)
      // clearFilterString: () => handleChangeFilter("")
    },
    context: {
      listRef,
      filterInputRef,
      activeDecoratedItem,
      isControlledFiltering,
      setUncontrolledFilterString,
      onChangeFilter
    }
  });

  function handleFilterStringChange(filterString: string) {
    send({ type: UPDATE_FILTER, filterString });
  }

  function handleClickItem(decoratedItem: any) {
    const { item } = decoratedItem;
    send({
      type: CLICK_ITEM,
      item
    });
  }

  const handleKeyDownSelect = useCallback(
    e => {
      switch (keycode(e.which)) {
        case "up":
          send(KEY_DOWN_UP);
          e.preventDefault();
          return;
        case "down":
          send(KEY_DOWN_DOWN);
          e.preventDefault();
          return;
        case "space":
          send(KEY_DOWN_SPACE);
          return;
        case "enter":
          send(KEY_DOWN_ENTER);
          return;
        case "esc":
          send(KEY_DOWN_ESC);
          return;
        case "tab":
          send(KEY_DOWN_TAB);
          return;
        default:
          handleKeyboardEvent(e);
      }
    },
    [handleKeyboardEvent]
  );

  const getSelectProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: handleKeyDownSelect,
      "data-testid": "select",
      onClick: () => send(CLICK_TRIGGER)
    };
  }, [handleKeyDownSelect]);

  const isOpen = useMemo(() => state.value === "open", [state]);

  return {
    isOpen,
    listRef,
    decoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    isItemActive,
    isItemSelected,
    state
  };
}

export default useSelect;
