import { Machine, assign } from "xstate";
import { RefObject } from "react";

import { DecoratedItem } from "./index";

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
export const UPDATE_DECORATED_ITEMS = "UPDATE_DECORATED_ITEMS";

type T = any;

export interface IContext {
  listRef: RefObject<HTMLElement>;
  filterInputRef: RefObject<HTMLInputElement>;
  onChangeFilter(value: string): void;
  activeItemIndex: number;
  decoratedItems: Array<DecoratedItem<HTMLLIElement, T>>;
  filteredDecoratedItems: Array<DecoratedItem<HTMLLIElement, T>>;
  activeDecoratedItem: DecoratedItem<HTMLLIElement, T>;
  filterString: string;
  itemMatchesFilter: any;
  onSelectOption(item: T, selected: T | Array<T>): void;
  selected: Array<T> | T;
}

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

const selectMachine = Machine<IContext>(
  {
    id: "select",
    initial: "closed",
    states: {
      open: {
        exit: ["clearFilterString", "clearActiveItem"],
        entry: ["focus"],
        on: {
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
              assign<IContext>({ filteredDecoratedItems: filterItems })
            ]
          },
          [SET_ACTIVE_ITEM]: {
            actions: [
              assign<IContext>({
                activeItemIndex: ({ decoratedItems }, { decoratedItem }: any) =>
                  decoratedItems.indexOf(decoratedItem)
              })
            ]
          },
          [UPDATE_DECORATED_ITEMS]: {
            actions: [
              assign({
                decoratedItems: (_, { decoratedItems }) => decoratedItems
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
          [KEY_DOWN_SPACE]: {
            target: "open"
          },
          [UPDATE_SELECTED]: {
            actions: [
              assign({
                selected: (_, { selected }) => selected
              })
            ]
          }
        }
      }
    }
  },
  {
    guards: {
      canSelectItem: ({ activeItemIndex }) => {
        return activeItemIndex !== undefined;
      }
    },
    actions: {
      focus: ({ listRef, filterInputRef }: IContext) => {
        // Move this to the bottom of the stack to allow DOM to transition
        setTimeout(() => {
          if (filterInputRef.current) {
            filterInputRef.current.focus();
          } else {
            listRef.current && listRef.current.focus();
          }
        }, 0);
      },
      clearFilterString: ({ onChangeFilter, filterInputRef }: IContext) => {
        assign({
          filterString: ""
        });
        onChangeFilter && onChangeFilter("");
        if (filterInputRef.current) {
          filterInputRef.current.value = "";
        }
      },
      handleUpdateSelected: (_, { selected }: any) => {
        assign({ selected });
      },

      adjustScroll(context: IContext) {
        const activeDecoratedItem = getActiveDecoratedItem(context);
        const { listRef } = context;
        const activeItemElement = activeDecoratedItem.ref.current;
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
        decoratedItems,
        selected
      }) => {
        onSelectOption(decoratedItems[activeItemIndex].item, selected);
      },

      handleClickItem: ({ onSelectOption, selected }, { item }: any) => {
        onSelectOption(item, selected);
      }
    }
  }
);

export default selectMachine;
