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

// uncontrolled filterString, uncontrolled filtering
function UncontrolledFilterStringUncontrolledFilteringSelect({
  items,
  autoTargetFirstItem
}: IFilterableSelectProps) {
  const [selected, setSelected] = useState<Item | null>(null);
  const [filteredItems, setFilteredItems] = useState(items);

  const itemMatchesFilter = useCallback((item: any, filterString: string) => {
    return (
      item.name.toLowerCase().indexOf(filterString.trim().toLowerCase()) > -1
    );
  }, []);

  const handleChangeFilter = useCallback(
    filterString => {
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
    isItemActive,
    isItemSelected,
    decoratedItems
  } = useSelect({
    onSelectOption: setSelected,
    items: filteredItems,
    onChangeFilter: handleChangeFilter,
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

export default UncontrolledFilterStringUncontrolledFilteringSelect;
