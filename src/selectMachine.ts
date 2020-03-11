import { Machine } from "xstate";
import { RefObject } from "react";

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

export interface IContext {
  isControlledFiltering: boolean;
  listRef: RefObject<HTMLElement>;
  filterInputRef: RefObject<HTMLInputElement>;
  setUncontrolledFilterString(value: string): void;
  onChangeFilter(value: string): void;
  activeDecoratedItem: any;
}

const selectMachine = Machine(
  {
    id: "select",
    initial: "closed",
    states: {
      open: {
        exit: ["clearFilterString", "clearActiveItem"],
        entry: ["focus"],
        on: {
          [KEY_DOWN_UP]: {
            actions: ["decrementActiveItem"]
          },
          [KEY_DOWN_DOWN]: {
            actions: "incrementActiveItem"
          },
          [KEY_DOWN_SPACE]: {
            target: "closed",
            // cond: { type: "canSelectItem" },
            actions: "handleSelectItem"
          },
          [KEY_DOWN_ENTER]: {
            target: "closed",
            // cond: { type: "canSelectItem" },
            actions: ["handleSelectItem"]
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
            actions: ["handleSelectItem"]
          },
          [UPDATE_FILTER]: {
            actions: ["handleUpdateFilter"]
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
          }
        }
      }
    }
  },
  {
    guards: {
      canSelectItem: (context: IContext) => {
        const { activeDecoratedItem } = context;
        return !!activeDecoratedItem;
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
      clearFilterString: ({
        isControlledFiltering,
        setUncontrolledFilterString,
        onChangeFilter,
        filterInputRef
      }: IContext) => {
        if (!isControlledFiltering) {
          setUncontrolledFilterString("");
        }
        onChangeFilter && onChangeFilter("");
        if (filterInputRef.current) {
          filterInputRef.current.value = "";
        }
      },
      handleUpdateFilter: (
        {
          isControlledFiltering,
          setUncontrolledFilterString,
          onChangeFilter
        }: IContext,
        e: any
      ) => {
        const { filterString } = e;
        if (!isControlledFiltering) {
          setUncontrolledFilterString(filterString);
        }
        onChangeFilter && onChangeFilter(filterString);
      }
    }
  }
);

export default selectMachine;
