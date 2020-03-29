import { Machine, assign, actions } from "xstate";
import keycode from "keycode";

const { send, cancel } = actions;
import { DecoratedItem } from "./types";
const KEY_DOWN_FILTER = "KEY_DOWN_FILTER";
const KEY_DOWN_SELECT = "KEY_DOWN_SELECT";
const KEY_DOWN_UP = "KEY_DOWN_UP";
const KEY_DOWN_DOWN = "KEY_DOWN_DOWN";
const KEY_DOWN_ENTER = "KEY_DOWN_ENTER";
const KEY_DOWN_ESC = "KEY_DOWN_ESC";
const KEY_DOWN_TAB = "KEY_DOWN_TAB";
const KEY_DOWN_OTHER = "KEY_DOWN_OTHER";
const CLICK_TRIGGER = "CLICK_TRIGGER";
const CLICK_ITEM = "CLICK_ITEM";
const KEY_DOWN_SPACE = "KEY_DOWN_SPACE";
const UPDATE_FILTER = "UPDATE_FILTER";
const FILTER_ITEMS = "FILTER_ITEMS";
const SET_ACTIVE_ITEM = "SET_ACTIVE_ITEM";
const UPDATE_SELECTED = "UPDATE_SELECTED";
const CLEAR_EPHEMERAL_STRING = "CLEAR_EPHEMERAL_STRING";
const UPDATE_DECORATED_ITEMS = "UPDATE_DECORATED_ITEMS";
const UPDATE_LIST_REF = "UPDATE_LIST_REF";
const UPDATE_FILTER_INPUT_REF = "UPDATE_FILTER_INPUT_REF";

export const EVENTS = {
  KEY_DOWN_FILTER,
  KEY_DOWN_SELECT,
  KEY_DOWN_UP,
  KEY_DOWN_DOWN,
  KEY_DOWN_ENTER,
  KEY_DOWN_ESC,
  KEY_DOWN_TAB,
  KEY_DOWN_OTHER,
  CLICK_TRIGGER,
  CLICK_ITEM,
  KEY_DOWN_SPACE,
  UPDATE_FILTER,
  FILTER_ITEMS,
  SET_ACTIVE_ITEM,
  UPDATE_SELECTED,
  CLEAR_EPHEMERAL_STRING,
  UPDATE_DECORATED_ITEMS,
  UPDATE_LIST_REF,
  UPDATE_FILTER_INPUT_REF
};

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = Object;
type Ref = any;

export interface IContext {
  listRef: Ref;
  filterInputRef: Ref;
  activeItemIndex: number;
  decoratedItems: Array<DecoratedItem<Item>>;
  filteredDecoratedItems: Array<DecoratedItem<Item>>;
  prevFilteredDecoratedItems: Array<DecoratedItem<Item>>;
  activeDecoratedItem: DecoratedItem<Item>;
  filterString: string;
  itemMatchesFilter: any;
  onSelectOption(item: Item, selected: Item | Array<Item>): void;
  selected: Array<Item> | Item;
  autoTargetFirstItem: boolean;
  ephemeralString: string;
  getElementFromRef(ref: Ref): HTMLElement | null;
}

interface ISchema {
  states: {
    open: {};
    closed: {};
  };
}

type IEvent =
  | { type: "KEY_DOWN_FILTER"; charCode: number }
  | { type: "KEY_DOWN_SELECT"; charCode: number }
  | { type: "KEY_DOWN_OTHER"; charCode: number }
  | { type: "KEY_DOWN_UP" }
  | { type: "KEY_DOWN_DOWN" }
  | { type: "KEY_DOWN_ENTER" }
  | { type: "KEY_DOWN_ESC" }
  | { type: "KEY_DOWN_TAB" }
  | { type: "CLICK_TRIGGER" }
  | { type: "CLICK_ITEM"; item: any }
  | { type: "KEY_DOWN_SPACE" }
  | {
      type: "UPDATE_DECORATED_ITEMS";
      decoratedItems: Array<DecoratedItem<Item>>;
    }
  | { type: "UPDATE_FILTER"; filterString: string }
  | { type: "FILTER_ITEMS" }
  | { type: "SET_ACTIVE_ITEM"; decoratedItem: DecoratedItem<Item> }
  | { type: "UPDATE_SELECTED"; selected: any }
  | { type: "CLEAR_EPHEMERAL_STRING" }
  | {
      type: "UPDATE_LIST_REF";
      listRef: Ref;
    }
  | {
      type: "UPDATE_FILTER_INPUT_REF";
      filterInputRef: Ref;
    };

const itemInnerHTML = (element: HTMLElement | null) => {
  return element?.innerHTML.toLowerCase();
};

const itemMatchesInnerHTML = ({
  decoratedItem,
  string,
  getElementFromRef
}: {
  decoratedItem: DecoratedItem<Item>;
  string: String;
  getElementFromRef(ref: any): HTMLElement | null;
}) => {
  const element = getElementFromRef(decoratedItem.ref);
  const innerHTML = itemInnerHTML(element);
  if (!decoratedItem.ref || !innerHTML) return false;
  return innerHTML.indexOf(string.toLocaleLowerCase()) > -1;
};

const getActiveDecoratedItem = ({
  filteredDecoratedItems,
  activeItemIndex
}: IContext) => {
  return filteredDecoratedItems[activeItemIndex];
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

const filterItems = ({
  filterString,
  decoratedItems,
  itemMatchesFilter
}: IContext) => {
  const willFilter = !!filterString;
  if (willFilter) {
    return decoratedItems.filter(decoratedItem => {
      if (!!itemMatchesFilter) {
        return itemMatchesFilter(decoratedItem.item, filterString);
      }
      return true;
    });
  }
  return decoratedItems;
};

const updateActiveItemIndex = ({
  activeItemIndex,
  autoTargetFirstItem
}: IContext) => {
  if (autoTargetFirstItem) {
    return 0;
  } else return activeItemIndex;
};

const updateEphemeralString = (
  { ephemeralString = "" }: IContext,
  { charCode }: any
) => {
  return ephemeralString.concat(String.fromCharCode(charCode).toLowerCase());
};

const fuzzyFindActiveItemIndex = ({
  decoratedItems,
  ephemeralString,
  itemMatchesFilter,
  activeItemIndex,
  getElementFromRef
}: IContext) => {
  const firstMatch = decoratedItems.find(decoratedItem => {
    if (itemMatchesFilter) {
      return itemMatchesFilter(decoratedItem.item, ephemeralString);
    } else {
      return itemMatchesInnerHTML({
        decoratedItem,
        string: ephemeralString,
        getElementFromRef
      });
    }
  });
  if (!firstMatch) return activeItemIndex;
  return decoratedItems.indexOf(firstMatch);
};

const getOpenSelectKeyDownEvent = (
  _: IContext,
  { charCode }: { charCode?: any }
) => {
  switch (keycode(charCode)) {
    case "up":
      return { type: KEY_DOWN_UP };
    case "down":
      return { type: KEY_DOWN_DOWN };
    case "space":
      return { type: KEY_DOWN_SPACE };
    case "enter":
      return { type: KEY_DOWN_ENTER };
    case "esc":
      return { type: KEY_DOWN_ESC };
    case "tab":
      return { type: KEY_DOWN_TAB };
    default:
      return { type: KEY_DOWN_OTHER, charCode };
  }
};

const getClosedSelectKeyDownEvent = (_: IContext, { charCode }: any) => {
  switch (keycode(charCode)) {
    case "space":
      return { type: KEY_DOWN_SPACE };
    default:
      // TODO: better way to bail?
      return { type: "" };
  }
};

const getFilterKeyDownEvent = (_: IContext, { charCode }: any) => {
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

const updateDecoratedItems = (_: IContext, { decoratedItems }: any) => {
  return decoratedItems;
};

const updateListRef = (_: IContext, { listRef }: { listRef: Ref }) => {
  return listRef;
};

const updateFilterInputRef = (
  _: IContext,
  { filterInputRef }: { filterInputRef: Ref }
) => {
  return filterInputRef;
};

export const isItemActive = (
  decoratedItem: DecoratedItem<Item>,
  context: IContext
) => {
  const { activeItemIndex, filteredDecoratedItems } = context;
  return decoratedItem.item === filteredDecoratedItems[activeItemIndex]?.item;
};

export const isItemSelected = (
  { item }: DecoratedItem<Item>,
  selected: Item | Array<Item> | null
) => {
  if (isArray(selected)) {
    return selected.includes(item);
  } else {
    return item === selected;
  }
};

const selectMachine = Machine<IContext, ISchema, IEvent>(
  {
    id: "select",
    initial: "closed",
    states: {
      open: {
        entry: [
          "focus",
          assign<IContext>({ activeItemIndex: updateActiveItemIndex })
        ],
        exit: [
          "clearFilterString",
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
          [KEY_DOWN_SELECT]: {
            actions: [send(getOpenSelectKeyDownEvent)]
          },
          [KEY_DOWN_FILTER]: {
            actions: [send(getFilterKeyDownEvent)]
          },
          [CLEAR_EPHEMERAL_STRING]: {
            actions: assign<IContext>({ ephemeralString: () => "" })
          },
          [KEY_DOWN_OTHER]: {
            actions: [
              assign<IContext>({ ephemeralString: updateEphemeralString }),
              assign<IContext>({ activeItemIndex: fuzzyFindActiveItemIndex }),
              cancel("ephemeralStringTimeout"),
              send(CLEAR_EPHEMERAL_STRING, {
                delay: 350,
                id: "ephemeralStringTimeout"
              }),
              "adjustScroll"
            ]
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
          [KEY_DOWN_SPACE]: {
            target: "closed",
            cond: { type: "canSelectItem" },
            actions: "handleKeyboardSelectItem"
          },
          [KEY_DOWN_ENTER]: {
            target: "closed",
            cond: { type: "canSelectItem" },
            actions: "handleKeyboardSelectItem"
          },
          [KEY_DOWN_ESC]: {
            target: "closed"
          },
          [KEY_DOWN_TAB]: {
            target: "closed"
          },
          [CLICK_TRIGGER]: {
            target: "closed"
          },
          [CLICK_ITEM]: {
            target: "closed",
            actions: ["handleClickItem"]
          },
          [UPDATE_FILTER]: {
            actions: [
              assign({ filterString: (_, { filterString }) => filterString }),
              assign<IContext>({ filteredDecoratedItems: filterItems }),
              assign<IContext>({ activeItemIndex: updateActiveItemIndex })
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
        on: {
          [CLICK_TRIGGER]: {
            target: "open"
          },
          [KEY_DOWN_SELECT]: {
            actions: [send(getClosedSelectKeyDownEvent)]
          },
          [KEY_DOWN_SPACE]: {
            target: "open"
          },
          [UPDATE_SELECTED]: {
            actions: [
              assign({
                selected: (_, { selected }) => selected
              })
            ]
          },
          [UPDATE_LIST_REF]: {
            actions: [
              assign<IContext>({
                listRef: updateListRef
              })
            ]
          },
          [UPDATE_FILTER_INPUT_REF]: {
            actions: [
              assign<IContext>({
                filterInputRef: updateFilterInputRef
              })
            ]
          },
          [UPDATE_DECORATED_ITEMS]: {
            actions: [
              assign<IContext>({
                decoratedItems: updateDecoratedItems
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
        const { filterInputRef, listRef, getElementFromRef } = context;
        const filterInputElement = getElementFromRef(filterInputRef);
        const listElement = getElementFromRef(listRef);
        setTimeout(() => {
          if (filterInputElement) {
            filterInputElement.focus();
          } else {
            listElement && listElement.focus();
          }
        }, 100);
      },
      clearFilterString: ({ filterInputRef, getElementFromRef }: IContext) => {
        const filterInputElement = getElementFromRef(
          filterInputRef
        ) as HTMLInputElement;
        assign({
          filterString: ""
        });
        if (filterInputElement) {
          filterInputElement.value = "";
        }
      },

      adjustScroll(context: IContext) {
        const activeDecoratedItem = getActiveDecoratedItem(context);
        const { listRef, getElementFromRef } = context;
        const listElement = getElementFromRef(listRef);
        const activeItemElement = getElementFromRef(activeDecoratedItem.ref);

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

      clearActiveItem() {
        assign({ activeItemIndex: undefined });
      },

      handleKeyboardSelectItem: ({
        activeItemIndex,
        onSelectOption,
        prevFilteredDecoratedItems,
        selected
      }: IContext) => {
        // NOTE: the next state is computed (via assigns) before event transitions:
        // https://xstate.js.org/docs/guides/context.html#action-order
        onSelectOption(
          prevFilteredDecoratedItems[activeItemIndex].item,
          selected
        );
      },

      handleClickItem: (
        { onSelectOption, selected }: IContext,
        { item }: any
      ) => {
        onSelectOption(item, selected);
      }
    }
  }
);

export default selectMachine;
