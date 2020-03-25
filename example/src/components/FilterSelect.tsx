import React, { useState } from "react";
import classnames from "classnames";
import useSelect from "../hooks/useSelect";
import { DecoratedItem } from "use-dropdown";
import { itemMatchesFilter } from "../utils";
import {
  selectStyles,
  listBoxStyles,
  itemStyles,
  listBoxContainerStyles
} from "./Select";

type Item = {
  name: string;
  id: String;
};

interface IFilterableSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

function FilteringSelect({
  items,
  autoTargetFirstItem
}: IFilterableSelectProps) {
  const [selected, setSelected] = useState<Item | null>(null);

  const {
    isOpen,
    decoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    isItemActive,
    isItemSelected,
    state
  } = useSelect({
    onSelectOption: setSelected,
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
          {decoratedItems.map((item: DecoratedItem<Item>, index: number) => (
            <li
              {...getItemProps(item)}
              key={item.id || index}
              className={classnames(itemStyles, {
                "bg-gray-200": isItemActive(item, state.context),
                "bg-gray-400": isItemSelected(item, selected)
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

export default FilteringSelect;
