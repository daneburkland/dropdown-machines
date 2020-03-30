import { useCallback, useMemo, createRef, useRef } from "react";
import { useMachine } from "@xstate/react";
import {
  comboboxMachine,
  comboboxMachineEvents,
  comboboxMachineHelpers,
  DecoratedItem
} from "dropdown-machines";
const {
  BLUR,
  KEY_DOWN_COMBOBOX,
  UPDATE_VALUE,
  SET_ACTIVE_ITEM,
  CLICK_ITEM
} = comboboxMachineEvents;
const { isItemActive } = comboboxMachineHelpers;

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = any;

interface IUseCombobox<T> {
  items: Array<T>;
  autoTargetFirstItem?: boolean;
  inlineAutoComplete?: boolean;
  getItemDisplayValue(item: Item): string;
}

function useCombobox({
  items,
  inlineAutoComplete,
  autoTargetFirstItem,
  getItemDisplayValue
}: IUseCombobox<Item>) {
  const comboboxRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const decoratedItems = useMemo(() => {
    return items.map(item => ({ item, ref: createRef<HTMLLIElement>() }));
  }, [items]);

  const [state, send] = useMachine(comboboxMachine, {
    context: {
      comboboxRef,
      getElementFromRef: ref => ref?.current,
      decoratedItems,
      // TODO: default this
      // TODO:default this
      value: "",
      autoCompleteStemValue: "",
      inlineAutoComplete,
      autoTargetFirstItem,
      getItemDisplayValue
    }
  });

  const getListProps = useCallback(() => {
    return {
      ref: listRef,
      "data-testid": "listBox"
    };
  }, []);

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

  const getComboboxProps = useCallback(() => {
    return {
      tabIndex: 0,
      ref: comboboxRef,
      onKeyDown: (e: KeyboardEvent) => {
        send({ type: KEY_DOWN_COMBOBOX, charCode: e.which });
      },
      onChange: (e: KeyboardEvent) => {
        send({ type: UPDATE_VALUE, value: e.target.value });
      },
      onBlur: () => send(BLUR),
      value: state.context.value,
      "data-testid": "combobox"
    };
  }, [state, send]);

  const isOpen = useMemo(() => state.value === "open", [state.value]);

  return {
    state,
    isOpen,
    decoratedItems: state.context.filteredDecoratedItems,
    getComboboxProps,
    getListProps,
    getItemProps,
    isItemActive
  };
}

export default useCombobox;
