import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";

type Item = {
  name: string;
};

interface IFilterableSelectProps {
  items: Array<Item>;
}

function FilterableSelect({ items }: IFilterableSelectProps) {
  const [selected, setSelected] = useState(items[0]);

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
    getFilterInputProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: setSelected,
    items,
    itemMatchesFilter,
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
          <input
            {...getFilterInputProps()}
            className="outline-none"
            type="text"
            placeholder="Filter..."
          />
          <ul
            {...getListProps()}
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

export default FilterableSelect;