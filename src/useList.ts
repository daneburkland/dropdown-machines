import {
  useState,
  useMemo,
  useRef,
  createRef,
  useCallback,
  useEffect,
  SetStateAction,
  RefObject,
  Dispatch
} from "react";
import useHandleKeydown from "./useHandleKeydown";
import useEphemeralString from "./useEphemeralString";
import useFilterInput from "./useFilterInput";
// import { isArray } from "./utils";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

interface IUseList<T> {
  items: Array<T>;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  selected?: Array<T> | T;
  onSelectItem(item: T): any;
  filterString?: string;
  onUpdateFilterString?(arg: string): void;
  onDeactivate?: Dispatch<SetStateAction<boolean>>;
  isOpen?: boolean;
}

type DecoratedItem<RefT, I> = {
  ref: RefObject<RefT>;
  item: I;
};

function useList<T>({
  items,
  itemMatchesFilter,
  filterString = "",
  onUpdateFilterString,
  onDeactivate,
  onSelectItem,
  selected,
  isOpen
}: IUseList<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  const [activeItem, setActiveItem] = useState(items[0]);

  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLElement>() }));
  }, [items]);

  const defaultItemMatchesFilterString = useCallback(
    (item: DecoratedItem<any, T>, filterString: string) => {
      if (!item.ref.current) return false;
      return (
        item.ref.current.innerHTML
          .toLowerCase()
          .indexOf(filterString.trim().toLocaleLowerCase()) > -1
      );
    },
    []
  );

  const filteredDecoratedItems = useMemo(() => {
    const willFilter = !!filterString;
    if (willFilter) {
      return decoratedItems.filter(decoratedItem => {
        if (!!itemMatchesFilter) {
          return itemMatchesFilter(decoratedItem.item, filterString);
        } else {
          return defaultItemMatchesFilterString(decoratedItem, filterString);
        }
      });
    }
    return decoratedItems;
  }, [filterString, items, itemMatchesFilter]);

  const activeItemIndex = useMemo(() => {
    const activeDecoratedItem = decoratedItems.find(
      ({ item }) => item === activeItem
    );
    return decoratedItems.indexOf(activeDecoratedItem!);
  }, [decoratedItems, activeItem]);

  const adjustScroll = useCallback(
    ({ ref: activeItemRef }) => {
      const activeItemElement = activeItemRef.current;
      const listElement = listRef.current;

      if (!activeItemElement || !listElement) return;

      const listHeight = listElement.getBoundingClientRect().height;
      const itemHeight = activeItemElement.getBoundingClientRect().height;

      const listTop = listElement.scrollTop;
      const listBottom = listTop + listElement.clientHeight;

      const itemTop = activeItemElement.offsetTop;
      const itemBottom = itemTop + activeItemElement.clientHeight;

      const shouldAdjustScrollDown = itemBottom > listBottom;
      const shouldAdjustScrollUp = itemTop < listTop;

      if (shouldAdjustScrollDown) {
        listElement.scrollTop = itemTop - (listHeight - itemHeight);
      } else if (shouldAdjustScrollUp) {
        listElement.scrollTop = itemTop;
      }
    },
    [listRef]
  );

  const incrementActiveItem = useCallback(() => {
    if (!listRef.current) return;
    let newActiveItemIndex;
    if (activeItemIndex === filteredDecoratedItems.length - 1) {
      newActiveItemIndex = 0;
    } else {
      newActiveItemIndex = activeItemIndex + 1;
    }

    const decoratedActiveItem = filteredDecoratedItems[newActiveItemIndex];
    setActiveItem(decoratedActiveItem.item);
    adjustScroll(decoratedActiveItem);
  }, [activeItemIndex, filteredDecoratedItems, adjustScroll]);

  const decrementActiveItem = useCallback(() => {
    if (!listRef.current) return;
    let newActiveItemIndex;
    if (activeItemIndex === 0) {
      newActiveItemIndex = filteredDecoratedItems.length - 1;
    } else {
      newActiveItemIndex = activeItemIndex - 1;
    }

    const decoratedActiveItem = filteredDecoratedItems[newActiveItemIndex];
    setActiveItem(decoratedActiveItem.item);
    adjustScroll(decoratedActiveItem);
  }, [activeItemIndex, filteredDecoratedItems, adjustScroll]);

  const handleSelectItem = useCallback(
    item => {
      onSelectItem(item);
    },
    [onSelectItem]
  );

  const handleUpdateKeyboardFocused = useCallback(
    string => {
      const firstMatch = filteredDecoratedItems.find(decoratedItem => {
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
    [filteredDecoratedItems, itemMatchesFilter]
  );

  const { handleKeyboardEvent } = useEphemeralString({
    onUpdateValue: handleUpdateKeyboardFocused
  });

  const isItemActive = useCallback(
    decoratedItem => {
      return decoratedItem.item === activeItem;
    },
    [activeItem]
  );

  const isItemSelected = useCallback(
    decoratedItem => {
      if (isArray(selected)) {
        return selected.includes(decoratedItem.item);
      } else {
        return decoratedItem.item === selected;
      }
    },
    [selected]
  );

  const handleMouseMove = useCallback(item => {
    setActiveItem(item);
  }, []);

  const getItemProps = useCallback(
    ({ item, ref }) => {
      return {
        ref,
        key: item.id,
        onMouseMove: () => handleMouseMove(item),
        onClick: () => handleSelectItem(item)
      };
    },
    [handleMouseMove, handleSelectItem]
  );

  const baseKeydownMap = useMemo(
    () => ({
      up: decrementActiveItem,
      down: incrementActiveItem,
      enter: () => handleSelectItem(activeItem)
    }),
    [decrementActiveItem, incrementActiveItem, activeItem, handleSelectItem]
  );

  const handleKeydownSpace = useCallback(() => {
    if (!filterString.length) {
      handleSelectItem(activeItem);
    } else return;
  }, [filterString, activeItem, handleSelectItem]);

  const filterInputKeydownMap = useMemo(
    () => ({
      ...baseKeydownMap,
      space: handleKeydownSpace,
      esc: onDeactivate
    }),
    [handleKeydownSpace, baseKeydownMap, onDeactivate]
  );

  const { getFilterInputProps, ref: filterInputRef } = useFilterInput({
    onChange: onUpdateFilterString,
    keydownMap: filterInputKeydownMap
  });

  const isFilterable = useMemo(() => !!filterInputRef.current, [
    filterInputRef
  ]);

  const focusableKeydownMap = useMemo(
    () => ({
      ...baseKeydownMap,
      // TODO: this seems like more of a select thing
      default: handleKeyboardEvent
    }),
    [handleKeyboardEvent, baseKeydownMap]
  );

  const { handleKeyDown } = useHandleKeydown(focusableKeydownMap);

  const getFocusableProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: handleKeyDown
    };
  }, [handleKeyDown]);

  const getListProps = useCallback(() => {
    return {
      ref: listRef
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (filterInputRef.current) {
        filterInputRef.current.focus();
      } else {
        listRef.current && listRef.current.focus();
      }
    }
  }, [isOpen, listRef, filterInputRef]);

  return {
    items: filteredDecoratedItems,
    getItemProps,
    getListProps,
    getFocusableProps,
    getFilterInputProps,
    isItemSelected,
    isItemActive,
    isFilterable,
    activeItem,
    focusableKeydownMap,
    baseKeydownMap,
    handleKeyDown,
    listRef
  };
}

export default useList;
