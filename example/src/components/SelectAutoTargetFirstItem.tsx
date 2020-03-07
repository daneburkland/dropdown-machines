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
    decoratedItems,
    getItemProps,
    getListProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: setSelected,
    items,
    selected,
    autoTargetFirstItem: true
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
            className="overflow-y-auto flex-grow outline-none relative"
          >
            {decoratedItems.map((item: any, index: number) => (
              <li
                {...getItemProps(item)}
                key={item.id || index}
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
