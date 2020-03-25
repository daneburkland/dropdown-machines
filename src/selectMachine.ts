import { Machine, assign, actions } from "xstate";
import keycode from "keycode";
const { send, cancel } = actions;
import { DecoratedItem } from "./types";
export const KEY_DOWN_FILTER = "KEY_DOWN_FILTER";
export const KEY_DOWN_SELECT = "KEY_DOWN_SELECT";
export const KEY_DOWN_UP = "KEY_DOWN_UP";
export const KEY_DOWN_DOWN = "KEY_DOWN_DOWN";
export const KEY_DOWN_ENTER = "KEY_DOWN_ENTER";
export const KEY_DOWN_ESC = "KEY_DOWN_ESC";
export const KEY_DOWN_TAB = "KEY_DOWN_TAB";
export const KEY_DOWN_OTHER = "KEY_DOWN_OTHER";
export const CLICK_TRIGGER = "CLICK_TRIGGER";
export const CLICK_ITEM = "CLICK_ITEM";
export const KEY_DOWN_SPACE = "KEY_DOWN_SPACE";
export const UPDATE_FILTER = "UPDATE_FILTER";
export const FILTER_ITEMS = "FILTER_ITEMS";
export const SET_ACTIVE_ITEM = "SET_ACTIVE_ITEM";
export const UPDATE_SELECTED = "UPDATE_SELECTED";
export const CLEAR_EPHEMERAL_STRING = "CLEAR_EPHEMERAL_STRING";
export const UPDATE_DECORATED_ITEMS = "UPDATE_DECORATED_ITEMS";
export const UPDATE_LIST_ELEMENT = "UPDATE_LIST_ELEMENT";
export const UPDATE_FILTER_INPUT_ELEMENT = "UPDATE_FILTER_INPUT_ELEMENT";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = Object;

export interface IContext {
  listElement: HTMLElement | null;
  filterInputElement: HTMLInputElement | null;
  onChangeFilter(value: string): void;
  activeItemIndex: number;
  decoratedItems: Array<DecoratedItem<Item>>;
  filteredDecoratedItems: Array<DecoratedItem<Item>>;
  activeDecoratedItem: DecoratedItem<Item>;
  filterString: string;
  itemMatchesFilter: any;
  itemMatchesInnerHTML(
    decoratedItem: DecoratedItem<Item>,
    filterString: string
  ): boolean;
  onSelectOption(item: Item, selected: Item | Array<Item>): void;
  selected: Array<Item> | Item;
  autoTargetFirstItem: boolean;
  ephemeralString: string;
}

interface ISchema {
  states: {
    open: {};
    closed: {};
  };
}

type IEvent =
  | { type: "KEY_DOWN_FILTER"; e: any }
  | { type: "KEY_DOWN_SELECT"; e: any }
  | { type: "KEY_DOWN_UP"; e: any }
  | { type: "KEY_DOWN_DOWN"; e: any }
  | { type: "KEY_DOWN_ENTER"; e: any }
  | { type: "KEY_DOWN_ESC"; e: any }
  | { type: "KEY_DOWN_TAB"; e: any }
  | { type: "KEY_DOWN_OTHER"; e: any }
  | { type: "CLICK_TRIGGER" }
  | { type: "CLICK_ITEM"; item: any }
  | { type: "KEY_DOWN_SPACE"; e: any }
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
      type: "UPDATE_LIST_ELEMENT";
      listElement: HTMLUListElement | null;
    }
  | {
      type: "UPDATE_FILTER_INPUT_ELEMENT";
      filterInputElement: HTMLInputElement | null;
    };

const itemInnerHTML = (decoratedItem: DecoratedItem<Item>) => {
  return decoratedItem.ref?.innerHTML.toLowerCase();
};

const itemMatchesInnerHTML = (
  decoratedItem: DecoratedItem<Item>,
  filterString: string
) => {
  const innerHTML = itemInnerHTML(decoratedItem);
  if (!decoratedItem.ref || !innerHTML) return false;
  return innerHTML.indexOf(filterString.toLocaleLowerCase()) > -1;
};

const getActiveDecoratedItem = ({
  decoratedItems,
  activeItemIndex
}: IContext) => {
  return decoratedItems[activeItemIndex];
};

const incrementActiveItem = ({ activeItemIndex, decoratedItems }: IContext) => {
  let newActiveItemIndex;
  if (activeItemIndex === undefined) {
    newActiveItemIndex = 0;
  } else if (activeItemIndex === decoratedItems.length - 1) {
    newActiveItemIndex = 0;
  } else {
    newActiveItemIndex = activeItemIndex + 1;
  }

  return newActiveItemIndex;
};

const decrementActiveItem = ({ activeItemIndex, decoratedItems }: IContext) => {
  let newActiveItemIndex;
  if (!activeItemIndex || activeItemIndex <= 0) {
    newActiveItemIndex = decoratedItems.length - 1;
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
  { e }: any
) => {
  return ephemeralString.concat(String.fromCharCode(e.which).toLowerCase());
};

const fuzzyFindActiveItemIndex = ({
  decoratedItems,
  ephemeralString,
  itemMatchesFilter,
  activeItemIndex
}: IContext) => {
  const firstMatch = decoratedItems.find(decoratedItem => {
    if (itemMatchesFilter) {
      return itemMatchesFilter(decoratedItem.item, ephemeralString);
    } else {
      return itemMatchesInnerHTML(decoratedItem, ephemeralString);
    }
  });
  if (!firstMatch) return activeItemIndex;
  return decoratedItems.indexOf(firstMatch);
};

const getOpenSelectKeyDownEvent = (_: IContext, { e }: any) => {
  switch (keycode(e.which)) {
    case "up":
      return { type: KEY_DOWN_UP, e };
    case "down":
      return { type: KEY_DOWN_DOWN, e };
    case "space":
      return { type: KEY_DOWN_SPACE, e };
    case "enter":
      return { type: KEY_DOWN_ENTER, e };
    case "esc":
      return { type: KEY_DOWN_ESC, e };
    case "tab":
      return { type: KEY_DOWN_TAB, e };
    default:
      return { type: KEY_DOWN_OTHER, e };
  }
};

const getClosedSelectKeyDownEvent = (_: IContext, { e }: any) => {
  switch (keycode(e.which)) {
    case "space":
      return { type: KEY_DOWN_SPACE, e };
    default:
      // TODO: better way to bail?
      return { type: "" };
  }
};

const getFilterKeyDownEvent = (_: IContext, { e }: any) => {
  switch (keycode(e.which)) {
    case "up":
      return { type: KEY_DOWN_UP, e };
    case "down":
      return { type: KEY_DOWN_DOWN, e };
    case "enter":
      return { type: KEY_DOWN_ENTER, e };
    case "esc":
      return { type: KEY_DOWN_ESC, e };
    case "tab":
      return { type: KEY_DOWN_TAB, e };
    default:
      // TODO: better way to bail?
      return { type: "" };
  }
};

const updateDecoratedItems = (_: IContext, { decoratedItems }: any) => {
  return decoratedItems;
};

const updateListElement = (_: IContext, { listElement }: any) => {
  return listElement;
};

const updateFilterInputElement = (_: IContext, { filterInputElement }: any) => {
  return filterInputElement;
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
        exit: [
          "clearFilterString",
          "clearActiveItem",
          assign<IContext>({
            filteredDecoratedItems: ({ decoratedItems }: IContext) =>
              decoratedItems
          })
        ],
        entry: [
          "focus",
          assign<IContext>({ activeItemIndex: updateActiveItemIndex })
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
            actions: ["handleKeyboardSelectItem"]
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
              "handleUpdateFilter",
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
          [UPDATE_LIST_ELEMENT]: {
            actions: [
              assign<IContext>({
                listElement: updateListElement
              })
            ]
          },
          [UPDATE_FILTER_INPUT_ELEMENT]: {
            actions: [
              assign<IContext>({
                filterInputElement: updateFilterInputElement
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
        const { filterInputElement, listElement } = context;
        setTimeout(() => {
          if (filterInputElement) {
            filterInputElement.focus();
          } else {
            listElement && listElement.focus();
          }
        }, 100);
      },
      clearFilterString: ({ onChangeFilter, filterInputElement }: IContext) => {
        assign({
          filterString: ""
        });
        onChangeFilter && onChangeFilter("");
        if (filterInputElement) {
          filterInputElement.value = "";
        }
      },

      adjustScroll(context: IContext) {
        const activeDecoratedItem = getActiveDecoratedItem(context);
        const { listElement } = context;
        const activeItemElement = activeDecoratedItem.ref;

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

      handleUpdateFilter: ({ onChangeFilter }: IContext, e: any) => {
        const { filterString } = e;
        onChangeFilter && onChangeFilter(filterString);
      },

      clearActiveItem() {
        assign({ activeItemIndex: undefined });
      },

      handleKeyboardSelectItem: ({
        activeItemIndex,
        onSelectOption,
        filteredDecoratedItems,
        selected
      }: IContext) => {
        onSelectOption(filteredDecoratedItems[activeItemIndex].item, selected);
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
