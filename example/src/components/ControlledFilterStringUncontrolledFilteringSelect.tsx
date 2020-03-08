import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import { itemMatchesFilter } from "./../utils";

type Item = {
  name: string;
};

interface IFilterableSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

// controlled filterString, uncontrolled filtering
function ControlledFilterStringUncontrolledFilteringSelect({
  items,
  autoTargetFirstItem
}: IFilterableSelectProps) {
  const [selected, setSelected] = useState<Item | null>(null);
  const [filterString, setFilterString] = useState("");

  function handleChangeFilter(filterString: string) {
    setFilterString(filterString);
  }

  const {
    isOpen,
    decoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: setSelected,
    onChangeFilter: handleChangeFilter,
    filterString,
    items,
    itemMatchesFilter,
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
            {decoratedItems.map((item: any, index) => (
              <li
                {...getItemProps(item)}
                key={item.name || index}
                className={classnames({
                  "bg-gray-200": isItemActive(item),
                  "bg-gray-400": isItemSelected(item)
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

export default ControlledFilterStringUncontrolledFilteringSelect;
