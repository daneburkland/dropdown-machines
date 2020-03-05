import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";

type Item = {
  name: string;
};

interface ISelectProps {
  items: Array<Item>;
}

function Select({ items }: ISelectProps) {
  const [selected, setSelected] = useState(items[0]);

  const {
    isOpen,
    filteredItems,
    getItemProps,
    getListProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: setSelected,
    items,
    selected
  });

  return (
    <div>
      <div
        {...getSelectProps()}
        {...getTriggerProps()}
        className="max-w-sm border border-gray-500 flex"
      >
        {selected.name}
      </div>
      {isOpen && (
        <div className="flex flex-col max-w-sm shadow-lg h-48 border border-gray-500 outline-none">
          <ul
            {...getListProps()}
            // TODO: maybe include relative position in a style attribute
            className="overflow-y-auto flex-grow outline-none relative"
          >
            {filteredItems.map((item: any) => (
              <li
                {...getItemProps(item)}
                className={classnames({
                  "bg-gray-300": isItemActive(item),
                  "bg-blue-500": isItemSelected(item)
                })}
              >
                {item.item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Select;