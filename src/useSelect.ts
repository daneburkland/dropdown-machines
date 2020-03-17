import {
  useCallback,
  useMemo,
  useRef,
  createRef,
  useEffect,
  ChangeEvent
} from "react";
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
  UPDATE_FILTER,
  SET_ACTIVE_ITEM,
  UPDATE_SELECTED,
  UPDATE_DECORATED_ITEMS
} from "./selectMachine";
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
  onSelectOption(item: T | null, selected: T | Array<T>): void;
  filterString?: string;
  autoTargetFirstItem?: boolean;
}

function useSelect({
  items,
  itemMatchesFilter,
  selected,
  onSelectOption,
  onChangeFilter
}: // autoTargetFirstItem,
IuseSelect<Item>) {
  const listRef = useRef<HTMLUListElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // TODO: need effect after useMachine to send update to items?
  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLLIElement>() }));
  }, [items]);

  const defaultItemDisplayValue = useCallback(decoratedItem => {
    return decoratedItem.ref.current?.innerHTML.toLowerCase();
  }, []);

  const defaultItemMatchesFilterString = useCallback(
    (
      decoratedItem: DecoratedItem<HTMLLIElement, Item>,
      filterString: string
    ) => {
      if (!decoratedItem.ref.current) return false;
      return (
        defaultItemDisplayValue(decoratedItem).indexOf(
          filterString.toLocaleLowerCase()
        ) > -1
      );
    },
    []
  );

  // TODO: this should fire event

  // useEffect(() => {
  //   if (autoTargetFirstItem && !!filteredDecoratedItems.length) {
  //     setActiveItem(filteredDecoratedItems[0].item);
  //   } else if (!filteredDecoratedItems.length) {
  //     setActiveItem(null);
  //   }
  // }, [filterString]);

  // TODO: this can be derived in state machine

  // const scrollDecoratedItemIntoView = useCallback(decoratedItem => {
  //   const { ref } = decoratedItem;
  //   if (!ref.current?.scrollIntoView) return;
  //   adjustScroll(decoratedItem);
  // }, []);

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

  const { handleKeyboardEvent } = useEphemeralString({
    onUpdateValue: handleUpdateKeyboardFocused
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    send({
      type: UPDATE_FILTER,
      filterString: e.target.value
    });
    e.preventDefault();
  };

  const getFilterInputProps = useCallback(
    () => ({
      onChange: handleInputChange,
      onKeyDown: handleKeyDownFilter,
      "data-testid": "filterInput",
      ref: filterInputRef
    }),
    [handleInputChange, handleKeyDownFilter]
  );

  const [state, send] = useMachine(selectMachine, {
    context: {
      // TODO: pass the actual elements into context
      listRef,
      filterInputRef,
      onChangeFilter,
      decoratedItems,
      // TODO: how to default this
      filteredDecoratedItems: decoratedItems,
      itemMatchesFilter,
      onSelectOption,
      selected
    }
  });

  useEffect(() => {
    send(UPDATE_SELECTED, { selected });
  }, [selected]);

  useEffect(() => {
    send(UPDATE_DECORATED_ITEMS, { decoratedItems });
  }, [decoratedItems]);

  const getItemProps = (decoratedItem: DecoratedItem<HTMLLIElement, Item>) => {
    const { ref } = decoratedItem;
    return {
      ref,
      onMouseMove: () => send({ type: SET_ACTIVE_ITEM, decoratedItem }),
      onClick: () => handleClickItem(decoratedItem),
      "data-testid": "option"
    };
  };

  const getListProps = useCallback(() => {
    return {
      ref: listRef,
      "data-testid": "listBox"
    };
  }, []);

  function handleUpdateKeyboardFocused(string: string) {
    const firstMatch = decoratedItems.find(
      (decoratedItem: DecoratedItem<HTMLLIElement, Item>) => {
        if (itemMatchesFilter) {
          return itemMatchesFilter(decoratedItem.item, string);
        } else {
          return defaultItemMatchesFilterString(decoratedItem, string);
        }
      }
    );
    if (firstMatch) {
      send({
        type: SET_ACTIVE_ITEM,
        item: firstMatch
      });
      // scrollDecoratedItemIntoView(firstMatch);
    }
  }

  const isItemActive = (decoratedItem: DecoratedItem<HTMLLIElement, Item>) => {
    const { activeItemIndex, decoratedItems } = state.context;
    return decoratedItem.item === decoratedItems[activeItemIndex]?.item;
  };

  const isItemSelected = ({ item }: { item: Item }) => {
    if (isArray(selected)) {
      return selected.includes(item);
    } else {
      return item === selected;
    }
  };

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
    decoratedItems: state.context.filteredDecoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    isItemActive,
    isItemSelected,
    state,
    selected
  };
}

export default useSelect;
