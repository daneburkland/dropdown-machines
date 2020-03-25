import {
  useCallback,
  useMemo,
  useRef,
  createRef,
  useEffect,
  ChangeEvent
} from "react";
import { useMachine } from "@xstate/react";
import {
  selectMachine,
  CLICK_TRIGGER,
  CLICK_ITEM,
  UPDATE_FILTER,
  SET_ACTIVE_ITEM,
  UPDATE_SELECTED,
  KEY_DOWN_SELECT,
  KEY_DOWN_FILTER,
  isItemActive,
  isItemSelected,
  DecoratedItem,
  UPDATE_FILTER_INPUT_ELEMENT,
  UPDATE_LIST_ELEMENT
} from "use-dropdown";

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
  onChangeFilter,
  autoTargetFirstItem
}: IuseSelect<Item>) {
  const listRef = useRef<HTMLUListElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLLIElement>() }));
  }, [items]);

  const defaultItemDisplayValue = useCallback(decoratedItem => {
    return decoratedItem.ref.current?.innerHTML.toLowerCase();
  }, []);

  const itemMatchesInnerHTML = useCallback(
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
    [defaultItemDisplayValue]
  );

  const [state, send] = useMachine(selectMachine, {
    context: {
      // TODO: pass the actual elements into context
      listElement: listRef.current,
      filterInputElement: filterInputRef.current,
      onChangeFilter,
      decoratedItems,
      // TODO: how to default this
      filteredDecoratedItems: decoratedItems,
      itemMatchesFilter,
      itemMatchesInnerHTML,
      onSelectOption,
      selected,
      autoTargetFirstItem
    }
  });

  useEffect(() => {
    send({
      type: UPDATE_FILTER_INPUT_ELEMENT,
      filterInputElement: filterInputRef.current
    });
    send({
      type: UPDATE_LIST_ELEMENT,
      listElement: listRef.current
    });
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      send({
        type: UPDATE_FILTER,
        filterString: e.target.value
      });
      e.preventDefault();
    },
    [send]
  );

  useEffect(() => {
    send(UPDATE_SELECTED, { selected });
  }, [selected, send]);

  const getItemProps = (decoratedItem: DecoratedItem<HTMLLIElement, Item>) => {
    const { ref } = decoratedItem;
    return {
      ref,
      onMouseMove: () => send({ type: SET_ACTIVE_ITEM, decoratedItem }),
      onClick: () =>
        send({
          type: CLICK_ITEM,
          item: decoratedItem.item
        }),
      "data-testid": "option"
    };
  };

  const getListProps = useCallback(() => {
    return {
      ref: listRef,
      "data-testid": "listBox"
    };
  }, []);

  const getFilterInputProps = useCallback(
    () => ({
      onChange: handleInputChange,
      onKeyDown: (e: any) => {
        send({ type: KEY_DOWN_FILTER, e });
      },
      "data-testid": "filterInput",
      ref: filterInputRef
    }),
    [handleInputChange, send]
  );

  const getSelectProps = useCallback(() => {
    return {
      tabIndex: 0,
      onKeyDown: (e: any) => {
        send({ type: KEY_DOWN_SELECT, e });
      },
      "data-testid": "select",
      onClick: () => send(CLICK_TRIGGER)
    };
  }, [send]);

  const isOpen = useMemo(() => state.value === "open", [state.value]);

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
