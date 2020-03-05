import React, { useState } from "react";
import classnames from "classnames";
import { useCombobox } from "use-dropdown";

type Item = {
  name: string;
};

interface ISelectProps {
  items: Array<Item>;
}

function Select({ items }: ISelectProps) {
  const [value, setValue] = useState("");

  function handleUpdateValue(value: string) {
    setValue(value);
  }

  function handleSelectOption(item: any) {
    setValue(item.name);
  }

  function itemMatchesFilter(item: any, filterString: string) {
    return (
      item.name.toLowerCase().indexOf(filterString.trim().toLowerCase()) > -1
    );
  }

  const {
    isOpen,
    filteredItems,
    getItemProps,
    getListProps,
    getComboboxProps,
    isItemActive
  } = useCombobox({
    onSelectOption: handleSelectOption,
    onUpdateValue: handleUpdateValue,
    itemMatchesFilter,
    items,
    value
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
          {filteredItems.map((item: any) => (
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
