import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import { itemMatchesFilter } from "./../utils";
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
              key={item.name || index}
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

export default ControlledFilterStringUncontrolledFilteringSelect;
