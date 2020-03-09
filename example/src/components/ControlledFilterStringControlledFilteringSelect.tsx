import React, { useState, useCallback } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import {
  selectStyles,
  listBoxStyles,
  listBoxContainerStyles,
  itemStyles
} from "./Select";

type Item = {
  name: string;
};

interface IFilterableSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

function ControlledFilterStringControlledFilteringSelect({
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
        className={classnames(selectStyles, {
          "border-blue-600 rounded-b-none": isOpen
        })}
      >
        {!!selected ? selected.name : ""}
      </div>
      <div className={classnames(listBoxContainerStyles, { hidden: !isOpen })}>
        <input
          {...getFilterInputProps()}
          className="outline-none"
          type="text"
          placeholder="Filter..."
        />
        <ul
          {...getListProps()}
          className={classnames(listBoxStyles, "relative")}
        >
          {decoratedItems.map((item: any, index) => (
            <li
              {...getItemProps(item)}
              key={item.id || index}
              className={classnames(itemStyles, {
                "bg-gray-200": isItemActive(item),
                "bg-gray-400": isItemSelected(item)
              })}
            >
              {item.item.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ControlledFilterStringControlledFilteringSelect;
