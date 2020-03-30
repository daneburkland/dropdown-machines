import React from "react";
import classnames from "classnames";
import { DecoratedItem } from "use-dropdown";
import useCombobox from "../hooks/useCombobox";

type Item = {
  name: string;
  id: string;
};
interface IComboboxProps {
  items: Array<Item>;
}

function Combobox({ items }: IComboboxProps) {
  const getItemDisplayValue = ({ name }: Item) => name;
  const {
    state,
    isOpen,
    decoratedItems,
    getListProps,
    getItemProps,
    getComboboxProps,
    isItemActive
  } = useCombobox({
    items,
    inlineAutoComplete: true,
    getItemDisplayValue
  });

  return (
    <div>
      <input
        {...getComboboxProps()}
        type="text"
        className="max-w-sm border border-gray-500 flex"
      />
      <ul
        {...getListProps()}
        className={classnames(
          "overflow-y-auto flex-grow outline-none max-w-sm shadow-lg h-48 border border-gray-500 outline-none relative",
          {
            hidden: !isOpen
          }
        )}
      >
        {decoratedItems.map(
          (decoratedItem: DecoratedItem<HTMLElement, Item>) => (
            <li
              {...getItemProps(decoratedItem)}
              key={decoratedItem.item.id}
              className={classnames({
                "bg-gray-200": isItemActive(decoratedItem, state.context)
              })}
            >
              {getItemDisplayValue(decoratedItem.item)}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Combobox;
export {};
