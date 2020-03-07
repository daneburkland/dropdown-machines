import {
  useMemo,
  useRef,
  createRef,
  useCallback,
  RefObject,
  useEffect,
  Dispatch,
  SetStateAction
} from "react";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

interface IUseList<T> {
  items: Array<T>;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  selected?: Array<T> | T;
  filterString?: string;
  onSelectItem(item: T): void;
  autoTargetFirstItem?: boolean;
  activeItem: T | null;
  setActiveItem: Dispatch<SetStateAction<T | null>>;
}

export type DecoratedItem<RefT, I> = {
  ref: RefObject<RefT>;
  item: I;
};

function useList<T>({
  items,
  itemMatchesFilter,
  filterString = "",
  selected,
  onSelectItem,
  autoTargetFirstItem,
  activeItem,
  setActiveItem
}: IUseList<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLElement>() }));
  }, [items]);

  const defaultItemDisplayValue = useCallback(decoratedItem => {
    return decoratedItem.ref.current?.innerHTML.toLowerCase();
  }, []);

  const defaultItemMatchesFilterString = useCallback(
    (decoratedItem: DecoratedItem<any, T>, filterString: string) => {
      if (!decoratedItem.ref.current) return false;
      return (
        defaultItemDisplayValue(decoratedItem).indexOf(
          filterString.toLocaleLowerCase()
        ) > -1
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
        }
        return true;
        // else {
        //   return defaultItemMatchesFilterString(decoratedItem, filterString);
        // }
      });
    }
    return decoratedItems;
  }, [filterString, items, itemMatchesFilter]);

  useEffect(() => {
    if (autoTargetFirstItem && !!filteredDecoratedItems.length) {
      setActiveItem(filteredDecoratedItems[0].item);
    } else if (!filteredDecoratedItems.length) {
      setActiveItem(null);
    }
  }, [filterString]);

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

    const activeDecoratedItem = filteredDecoratedItems[newActiveItemIndex];
    setActiveItem(activeDecoratedItem.item);
    adjustScroll(activeDecoratedItem);
  }, [activeItemIndex, filteredDecoratedItems, adjustScroll]);

  const decrementActiveItem = useCallback(() => {
    if (!listRef.current) return;
    let newActiveItemIndex;
    if (activeItemIndex === 0) {
      newActiveItemIndex = filteredDecoratedItems.length - 1;
    } else {
      newActiveItemIndex = activeItemIndex - 1;
    }

    const activeDecoratedItem = filteredDecoratedItems[newActiveItemIndex];
    setActiveItem(activeDecoratedItem.item);
    adjustScroll(activeDecoratedItem);
  }, [activeItemIndex, filteredDecoratedItems, adjustScroll]);

  const isItemActive = useCallback(
    decoratedItem => {
      return decoratedItem.item === activeItem;
    },
    [activeItem]
  );

  const isItemSelected = useCallback(
    item => {
      if (isArray(selected)) {
        return selected.includes(item);
      } else {
        return item === selected;
      }
    },
    [selected]
  );

  const handleMouseMove = useCallback(item => {
    setActiveItem(item);
  }, []);

  const getItemProps = useCallback(
    decoratedItem => {
      const { item, ref } = decoratedItem;
      return {
        ref,
        onMouseMove: () => handleMouseMove(item),
        onClick: () => onSelectItem(decoratedItem.item)
      };
    },
    [handleMouseMove, onSelectItem]
  );

  const getListProps = useCallback(() => {
    return {
      ref: listRef
    };
  }, []);

  const activeDecoratedItem = useMemo(
    () => filteredDecoratedItems[activeItemIndex],
    [filteredDecoratedItems, activeItemIndex]
  );

  return {
    decoratedItems: filteredDecoratedItems,
    getItemProps,
    getListProps,
    isItemActive,
    isItemSelected,
    activeItem,
    setActiveItem,
    listRef,
    decrementActiveItem,
    incrementActiveItem,
    defaultItemMatchesFilterString,
    defaultItemDisplayValue,
    activeDecoratedItem
  };
}

export default useList;
