import React, { useState, useCallback } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";

type Item = {
  name: string;
};

interface IFilterableSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

function UncontrolledFilterStringUncontrolledFilteringSelect({
  items,
  autoTargetFirstItem
}: IFilterableSelectProps) {
  const [selected, setSelected] = useState<Item | null>(null);
  const [filteredItems, setFilteredItems] = useState(items);
  const [filterString, setFilterString] = useState("");

  const itemMatchesFilter = useCallback((item: any, filterString: string) => {
    return (
      item.name.toLowerCase().indexOf(filterString.trim().toLowerCase()) > -1
    );
  }, []);

  const handleChangeFilter = useCallback(
    filterString => {
      setFilterString(filterString);
      const filteredItems = items.filter(item =>
        itemMatchesFilter(item, filterString)
      );
      setFilteredItems(filteredItems);
    },
    [items, itemMatchesFilter]
  );

  const {
    isOpen,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected,
    decoratedItems
  } = useSelect({
    onSelectOption: setSelected,
    items: filteredItems,
    onChangeFilter: handleChangeFilter,
    selected,
    filterString,
    autoTargetFirstItem
  });

  return (
    <div>
      <div
        {...getSelectProps()}
        {...getTriggerProps()}
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
            {decoratedItems.map((item: any) => (
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

export default UncontrolledFilterStringUncontrolledFilteringSelect;
