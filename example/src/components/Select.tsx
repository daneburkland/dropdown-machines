import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";

type Item = {
  name: string;
  id: string;
};

interface IFilterableSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

export const selectStyles =
  "w-64 h-10 border border-gray-500 flex rounded-sm outline-none items-center p-2 focus:border-blue-600 cursor-pointer";

export const listBoxContainerStyles =
  "shadow-lg border border-gray-500 rounded-sm rounded-t-none outline-none absolute bg-white z-10 border-blue-600 cursor-pointer";

export const listBoxStyles = "w-64 h-48 overflow-y-auto cursor-pointer";

export const itemStyles = "px-2 py-1";

function Select({ items, autoTargetFirstItem }: IFilterableSelectProps) {
  const [selected, setSelected] = useState<Item | null>(null);

  const {
    isOpen,
    decoratedItems,
    getItemProps,
    getListProps,
    getSelectProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: setSelected,
    items,
    selected,
    autoTargetFirstItem
  });

  return (
    <>
      <div
        {...getSelectProps()}
        className={classnames(selectStyles, {
          "border-blue-600 rounded-b-none": isOpen
        })}
      >
        {!!selected ? selected.name : ""}
      </div>
      <ul
        {...getListProps()}
        className={classnames(listBoxStyles, listBoxContainerStyles, {
          hidden: !isOpen
        })}
      >
        {decoratedItems.map(decoratedItem => (
          <li
            {...getItemProps(decoratedItem)}
            key={decoratedItem.item.id}
            className={classnames(itemStyles, {
              "bg-gray-200": isItemActive(decoratedItem),
              "bg-gray-400": isItemSelected(decoratedItem)
            })}
          >
            {decoratedItem.item.name}
          </li>
        ))}
      </ul>
    </>
  );
}

export default Select;
