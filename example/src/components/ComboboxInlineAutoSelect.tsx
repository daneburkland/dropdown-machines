import React from "react";
import classnames from "classnames";
import { useCombobox } from "use-dropdown";
import { itemMatchesFilter } from "./../utils";

type Item = {
  name: string;
};

interface ISelectProps {
  items: Array<Item>;
}

function Select({ items }: ISelectProps) {
  const {
    isOpen,
    decoratedItems,
    getItemProps,
    getListProps,
    getComboboxProps,
    isItemActive
  } = useCombobox({
    items,
    itemMatchesFilter,
    autoTargetFirstItem: true,
    inlineAutoComplete: true
  });

  return (
    <div>
      <input
        {...getComboboxProps()}
        type="text"
        className="max-w-sm border border-gray-500 flex"
      />
      {isOpen && (
        <ul
          {...getListProps()}
          className="overflow-y-auto flex-grow outline-none max-w-sm shadow-lg h-48 border border-gray-500 outline-none relative"
        >
          {decoratedItems.map((item: any) => (
            <li
              {...getItemProps(item)}
              className={classnames({
                "bg-gray-300": isItemActive(item)
              })}
            >
              {item.item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Select;
