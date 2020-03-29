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
  selectMachineEvents,
  selectMachineHelpers,
  DecoratedItem
} from "use-dropdown";
const {
  CLICK_TRIGGER,
  CLICK_ITEM,
  UPDATE_FILTER,
  SET_ACTIVE_ITEM,
  UPDATE_SELECTED,
  KEY_DOWN_SELECT,
  KEY_DOWN_FILTER
} = selectMachineEvents;
const { isItemActive, isItemSelected } = selectMachineHelpers;

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = any;

interface IuseSelect<T> {
  items: Array<T>;
  itemMatchesFilter?(item: T, filterString: string): boolean;
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
  autoTargetFirstItem
}: IuseSelect<Item>) {
  const listRef = useRef<HTMLUListElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLLIElement>() }));
  }, [items]);

  const [state, send] = useMachine(selectMachine, {
    context: {
      // TODO: pass the actual elements into context
      listRef,
      filterInputRef,
      getElementFromRef: ref => ref?.current,
      decoratedItems,
      // TODO: how to default this
      filteredDecoratedItems: decoratedItems,
      itemMatchesFilter,
      onSelectOption,
      selected,
      autoTargetFirstItem
    }
  });

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
        send({ type: KEY_DOWN_FILTER, charCode: e.which });
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
        send({ type: KEY_DOWN_SELECT, charCode: e.which });
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
