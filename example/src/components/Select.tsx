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
    <div>
      <div
        {...getSelectProps()}
        className="max-w-sm h-6 border border-gray-500 flex"
      >
        {!!selected ? selected.name : ""}
      </div>
      {isOpen && (
        <div className="flex flex-col max-w-sm shadow-lg h-48 border border-gray-500 outline-none">
          <ul
            {...getListProps()}
            className="overflow-y-auto flex-grow outline-none relative"
          >
            {decoratedItems.map(decoratedItem => (
              <li
                {...getItemProps(decoratedItem)}
                key={decoratedItem.item.id}
                className={classnames({
                  "bg-gray-300": isItemActive(decoratedItem),
                  "bg-blue-500": isItemSelected(decoratedItem)
                })}
              >
                {decoratedItem.item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Select;
