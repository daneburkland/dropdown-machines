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
  itemDisplayValue?(item: T): string;
  selected: Array<T> | T;
  onSelectItem(item: T): any;
  filterString: string;
  onUpdateFilterString(arg: string): any;
  onDeactivate: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

type DecoratedItem<RefT, I> = {
  ref: RefObject<RefT>;
  item: I;
};

function useList<T>({
  items,
  itemDisplayValue = () => "",
  filterString = "",
  onUpdateFilterString,
  onDeactivate,
  onSelectItem,
  selected,
  isOpen
}: IUseList<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  const [activeItem, setActiveItem] = useState(items[0]);

  const filteredDecoratedItems = useMemo(() => {
    return items.reduce((filtered: Array<DecoratedItem<any, T>>, item) => {
      const matchesFilter =
        itemDisplayValue(item)
          .toLowerCase()
          .indexOf(filterString.trim().toLowerCase()) > -1;

      if (matchesFilter) {
        const decoratedItem = { item, ref: createRef<HTMLElement>() };
        filtered.push(decoratedItem);
      }
      return filtered;
    }, []);
  }, [filterString, items, itemDisplayValue]);

  const activeItemIndex = useMemo(() => {
    const activeDecoratedItem = filteredDecoratedItems.find(
      ({ item }) => item === activeItem
    );
    return filteredDecoratedItems.indexOf(activeDecoratedItem!);
  }, [filteredDecoratedItems, activeItem]);

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
      const match = filteredDecoratedItems.find(
        ({ item }) =>
          itemDisplayValue(item)
            .toLowerCase()
            .indexOf(string.trim().toLowerCase()) > -1
      );
      if (match) {
        setActiveItem(match.item);
      }
    },
    [filteredDecoratedItems, itemDisplayValue]
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
    handleKeyDown,
    listRef
  };
}

export default useList;
