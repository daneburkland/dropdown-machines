import { Machine, assign, actions } from "xstate";
const { send, cancel } = actions;
import keycode from "keycode";
import { DecoratedItem } from "./types";
const KEY_DOWN_COMBOBOX = "KEY_DOWN_COMBOBOX";
const KEY_DOWN_UP = "KEY_DOWN_UP";
const KEY_DOWN_DOWN = "KEY_DOWN_DOWN";
const KEY_DOWN_ENTER = "KEY_DOWN_ENTER";
const KEY_DOWN_ESC = "KEY_DOWN_ESC";
const KEY_DOWN_TAB = "KEY_DOWN_TAB";
const KEY_DOWN_OTHER = "KEY_DOWN_OTHER";
const CLICK_ITEM = "CLICK_ITEM";
const UPDATE_VALUE = "UPDATE_VALUE";
const SET_ACTIVE_ITEM = "SET_ACTIVE_ITEM";
const UPDATE_DECORATED_ITEMS = "UPDATE_DECORATED_ITEMS";
const UPDATE_LIST_REF = "UPDATE_LIST_REF";
const BLUR = "BLUR";
const SET_SELECTION_RANGE = "SET_SELECTION_RANGE";

export const EVENTS = {
  KEY_DOWN_COMBOBOX,
  KEY_DOWN_UP,
  KEY_DOWN_DOWN,
  KEY_DOWN_ENTER,
  KEY_DOWN_ESC,
  KEY_DOWN_TAB,
  KEY_DOWN_OTHER,
  CLICK_ITEM,
  UPDATE_VALUE,
  SET_ACTIVE_ITEM,
  UPDATE_DECORATED_ITEMS,
  BLUR
};

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = Object;
type Ref = any;

export interface IContext {
  comboboxRef: Ref;
  activeItemIndex: number;
  decoratedItems: Array<DecoratedItem<Item>>;
  filteredDecoratedItems: Array<DecoratedItem<Item>>;
  prevFilteredDecoratedItems: Array<DecoratedItem<Item>>;
  activeDecoratedItem: DecoratedItem<Item>;
  value: string;
  autoCompleteStemValue: string;
  autoTargetFirstItem: boolean;
  getElementFromRef(ref: Ref): HTMLElement;
  inlineAutoComplete: boolean;
  getItemDisplayValue(item: Item): string;
}

interface ISchema {
  states: {
    open: {};
    closed: {};
  };
}

type IEvent =
  | { type: "KEY_DOWN_COMBOBOX"; charCode: number }
  | { type: "KEY_DOWN_OTHER"; charCode: number }
  | { type: "KEY_DOWN_UP" }
  | { type: "KEY_DOWN_DOWN" }
  | { type: "KEY_DOWN_ENTER" }
  | { type: "KEY_DOWN_ESC" }
  | { type: "KEY_DOWN_TAB" }
  | { type: "CLICK_ITEM"; item: any }
  | { type: "UPDATE_VALUE"; value: string }
  | {
      type: "UPDATE_DECORATED_ITEMS";
      decoratedItems: Array<DecoratedItem<Item>>;
    }
  | { type: "SET_ACTIVE_ITEM"; decoratedItem: DecoratedItem<Item> }
  | { type: "BLUR" }
  | { type: "SET_SELECTION_RANGE" }
  | {
      type: "UPDATE_LIST_REF";
      comboboxRef: Ref;
    };

const itemMatchesValue = ({
  decoratedItem,
  string,
  getItemDisplayValue
}: {
  decoratedItem: DecoratedItem<Item>;
  string: String;
  getItemDisplayValue(item: Item): string;
}) => {
  return (
    getItemDisplayValue(decoratedItem.item).slice(0, string.length) === string
  );
};

const getActiveDecoratedItem = ({
  filteredDecoratedItems,
  activeItemIndex
}: IContext) => {
  return filteredDecoratedItems[activeItemIndex];
};

const getPrevActiveDecoratedItem = ({
  prevFilteredDecoratedItems,
  activeItemIndex
}: IContext) => {
  return prevFilteredDecoratedItems[activeItemIndex];
};

const incrementActiveItem = ({
  activeItemIndex,
  filteredDecoratedItems
}: IContext) => {
  let newActiveItemIndex;
  if (activeItemIndex === undefined) {
    newActiveItemIndex = 0;
  } else if (activeItemIndex === filteredDecoratedItems.length - 1) {
    newActiveItemIndex = 0;
  } else {
    newActiveItemIndex = activeItemIndex + 1;
  }

  return newActiveItemIndex;
};

const decrementActiveItem = ({
  activeItemIndex,
  filteredDecoratedItems
}: IContext) => {
  let newActiveItemIndex;
  if (!activeItemIndex || activeItemIndex <= 0) {
    newActiveItemIndex = filteredDecoratedItems.length - 1;
  } else {
    newActiveItemIndex = activeItemIndex - 1;
  }

  return newActiveItemIndex;
};

const filterItems = (
  { decoratedItems, getItemDisplayValue }: IContext,
  { value }: any
) => {
  const willFilter = !!value;
  if (willFilter) {
    return decoratedItems.filter(decoratedItem => {
      if (!!itemMatchesValue) {
        return itemMatchesValue({
          decoratedItem,
          string: value,
          getItemDisplayValue
        });
      }
      return true;
    });
  }
  return decoratedItems;
};

const updateActiveItemIndex = ({
  activeItemIndex,
  autoTargetFirstItem,
  inlineAutoComplete
}: IContext) => {
  if (autoTargetFirstItem || inlineAutoComplete) {
    return 0;
  } else return activeItemIndex;
};

const getOpenKeyDownEvent = (_: IContext, { charCode }: any) => {
  switch (keycode(charCode)) {
    case "up":
      return { type: KEY_DOWN_UP };
    case "down":
      return { type: KEY_DOWN_DOWN };
    case "enter":
      return { type: KEY_DOWN_ENTER };
    case "esc":
      return { type: KEY_DOWN_ESC };
    case "tab":
      return { type: KEY_DOWN_TAB };
    default:
      // TODO: better way to bail?
      return { type: "" };
  }
};

const updateComboboxRef = (
  _: IContext,
  { comboboxRef }: { comboboxRef: Ref }
) => {
  return comboboxRef;
};

const updateValue = (context: IContext, { value }: any) => {
  const {
    inlineAutoComplete,
    autoCompleteStemValue,
    getItemDisplayValue
  } = context;

  if (inlineAutoComplete) {
    // User backspaced, get rid of the selection range
    if (autoCompleteStemValue === value) return autoCompleteStemValue;

    // User backspaced without a selection range
    if (value.length < autoCompleteStemValue.length) return value;

    const activeDecoratedItem = getActiveDecoratedItem(context);
    if (!activeDecoratedItem) return value;

    const itemDisplayValue = getItemDisplayValue(activeDecoratedItem.item);

    return itemDisplayValue;
  } else {
    return value;
  }
};

export const isItemActive = (
  decoratedItem: DecoratedItem<Item>,
  context: IContext
) => {
  const { activeItemIndex, filteredDecoratedItems } = context;
  return decoratedItem.item === filteredDecoratedItems[activeItemIndex]?.item;
};

const handleKeyboardSelectItem = (context: IContext) => {
  const { getItemDisplayValue } = context;
  const { item } = getPrevActiveDecoratedItem(context);
  const itemDisplayValue = getItemDisplayValue(item);

  return !!itemDisplayValue ? itemDisplayValue : context.value;
};

const comboboxMachine = Machine<IContext, ISchema, IEvent>(
  {
    id: "combobox",
    initial: "closed",
    states: {
      open: {
        entry: ["focus"],
        exit: [
          "clearActiveItem",
          assign<IContext>({
            prevFilteredDecoratedItems: ({
              filteredDecoratedItems
            }: IContext) => filteredDecoratedItems
          }),
          assign<IContext>({
            filteredDecoratedItems: ({ decoratedItems }: IContext) =>
              decoratedItems
          })
        ],
        on: {
          [BLUR]: {
            actions: ["blur"]
          },
          [KEY_DOWN_COMBOBOX]: {
            actions: [send(getOpenKeyDownEvent)]
          },
          [KEY_DOWN_OTHER]: {
            actions: ["adjustScroll"]
          },
          [KEY_DOWN_UP]: {
            actions: [
              assign<IContext>({ activeItemIndex: decrementActiveItem }),
              "adjustScroll"
            ]
          },
          [KEY_DOWN_DOWN]: {
            actions: [
              assign<IContext>({ activeItemIndex: incrementActiveItem }),
              "adjustScroll"
            ]
          },
          [KEY_DOWN_ENTER]: {
            target: "closed",
            cond: { type: "canSelectItem" },
            actions: [
              assign<IContext>({
                value: handleKeyboardSelectItem
              }),
              "unsetSelectionRange"
            ]
          },
          [KEY_DOWN_ESC]: {
            target: "closed",
            actions: [
              assign({
                value: ({ autoCompleteStemValue }) => autoCompleteStemValue
              })
            ]
          },
          [KEY_DOWN_TAB]: {
            target: "closed"
          },
          [CLICK_ITEM]: {
            target: "closed",
            actions: [assign({ value: (_, { item }) => item.name })]
          },
          [SET_SELECTION_RANGE]: {
            actions: ["setSelectionRange"]
          },
          [UPDATE_VALUE]: {
            actions: [
              assign<IContext>({ activeItemIndex: updateActiveItemIndex }),
              assign<IContext>({ filteredDecoratedItems: filterItems }),
              assign<IContext>({ value: updateValue }),
              assign({ autoCompleteStemValue: (_, { value }) => value }),
              cancel("setSelectionRangeTimeout"),
              send(SET_SELECTION_RANGE, {
                delay: 0,
                id: "setSelectionRangeTimout"
              })
            ]
          },
          [SET_ACTIVE_ITEM]: {
            actions: [
              assign({
                activeItemIndex: ({ decoratedItems }, { decoratedItem }) => {
                  return decoratedItems.indexOf(decoratedItem);
                }
              })
            ]
          }
        }
      },
      closed: {
        entry: [
          assign<IContext>({
            filteredDecoratedItems: ({ decoratedItems }: IContext) =>
              decoratedItems
          })
        ],
        on: {
          [SET_SELECTION_RANGE]: {
            actions: ["setSelectionRange"]
          },
          [UPDATE_VALUE]: {
            target: "open",
            actions: [
              assign<IContext>({ activeItemIndex: updateActiveItemIndex }),
              assign<IContext>({ filteredDecoratedItems: filterItems }),
              assign<IContext>({ value: updateValue }),
              assign({ autoCompleteStemValue: (_, { value }) => value }),
              cancel("setSelectionRangeTimeout"),
              send(SET_SELECTION_RANGE, {
                delay: 0,
                id: "setSelectionRangeTimout"
              })
            ]
          },
          [UPDATE_LIST_REF]: {
            actions: [
              assign<IContext>({
                comboboxRef: updateComboboxRef
              })
            ]
          }
        }
      }
    }
  },
  {
    guards: {
      canSelectItem: ({ activeItemIndex }: IContext) => {
        return activeItemIndex !== undefined;
      }
    },
    actions: {
      focus: (context: IContext) => {
        // Move this to the bottom of the stack to allow DOM to transition
        const { comboboxRef, getElementFromRef } = context;
        const comboboxElement = getElementFromRef(comboboxRef);
        setTimeout(() => {
          comboboxElement && comboboxElement.focus();
        }, 100);
      },
      blur: ({ comboboxRef }: IContext) => {
        comboboxRef.current.blur();
      },
      setSelectionRange: ({
        inlineAutoComplete,
        comboboxRef,
        autoCompleteStemValue,
        value
      }: IContext) => {
        if (inlineAutoComplete) {
          comboboxRef.current?.setSelectionRange(
            autoCompleteStemValue.length,
            value.length
          );
        }
      },
      unsetSelectionRange: ({ comboboxRef, inlineAutoComplete }: IContext) => {
        if (inlineAutoComplete) {
          comboboxRef.current.setSelectionRange(-1, -1);
        }
      },
      adjustScroll(context: IContext) {
        const activeDecoratedItem = getActiveDecoratedItem(context);
        const { comboboxRef, getElementFromRef } = context;
        const comboboxElement = getElementFromRef(comboboxRef);
        const activeItemElement = getElementFromRef(activeDecoratedItem.ref);

        if (!activeItemElement || !comboboxElement) return;

        const listHeight = comboboxElement.getBoundingClientRect().height;
        const itemHeight = activeItemElement.getBoundingClientRect().height;

        const listTop = comboboxElement.scrollTop;
        const listBottom = listTop + comboboxElement.clientHeight;

        const itemTop = activeItemElement.offsetTop;
        const itemBottom = itemTop + activeItemElement.clientHeight;

        const shouldAdjustScrollDown = itemBottom > listBottom;
        const shouldAdjustScrollUp = itemTop < listTop;

        if (shouldAdjustScrollDown) {
          comboboxElement.scrollTop = itemTop - (listHeight - itemHeight);
        } else if (shouldAdjustScrollUp) {
          comboboxElement.scrollTop = itemTop;
        }
      },

      clearActiveItem() {
        assign({ activeItemIndex: undefined });
      }
    }
  }
);

export default comboboxMachine;
