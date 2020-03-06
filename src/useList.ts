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
  autoActivateFirstResult?: boolean;
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
  autoActivateFirstResult,
  activeItem,
  setActiveItem
}: IUseList<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLElement>() }));
  }, [items]);

  const defaultItemDisplayValue = useCallback(item => {
    return item.ref.current?.innerHTML.toLowerCase();
  }, []);

  const defaultItemMatchesFilterString = useCallback(
    (item: DecoratedItem<any, T>, filterString: string) => {
      if (!item.ref.current) return false;
      return (
        defaultItemDisplayValue(item).indexOf(
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
        } else {
          return defaultItemMatchesFilterString(decoratedItem, filterString);
        }
      });
    }
    return decoratedItems;
  }, [filterString, items, itemMatchesFilter]);

  useEffect(() => {
    if (autoActivateFirstResult && !!filteredDecoratedItems.length) {
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
        onClick: () => onSelectItem(item)
      };
    },
    [handleMouseMove, onSelectItem]
  );

  const getListProps = useCallback(() => {
    return {
      ref: listRef
    };
  }, []);

  return {
    items: filteredDecoratedItems,
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
    defaultItemDisplayValue
  };
}

export default useList;
