import React, { useState, MouseEvent } from "react";
import classnames from "classnames";
import useSelect from "../hooks/useSelect";
import { DecoratedItem } from "use-dropdown";
import { itemMatchesFilter } from "../utils";
import {
  multiSelectStyles,
  pillStyles,
  pillCloseStyles,
  closeIcon
} from "./MultiSelect";
import { itemStyles, listBoxStyles, listBoxContainerStyles } from "./Select";

type Item = {
  name: string;
  id: string;
};

interface ISelectedItemProps {
  item: Item;
  onRemove(item: Item): void;
}

function SelectedItem({ item, onRemove }: ISelectedItemProps) {
  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    onRemove(item);
  }
  return (
    <span className={pillStyles}>
      <span className="text-xs">{item.name}</span>
      <span className={classnames(pillCloseStyles)} onClick={handleClick}>
        {closeIcon}
      </span>
    </span>
  );
}

interface IMultiSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

function FilterMultiSelect({ items, autoTargetFirstItem }: IMultiSelectProps) {
  const [selected, setSelected] = useState([items[0]]);

  function handleSelectOption(item: any) {
    if (selected.includes(item)) {
      setSelected(selected.filter(selectedItem => selectedItem !== item));
    } else {
      setSelected([...selected, item]);
    }
  }

  function handleRemoveSelectedItem(item: any) {
    setSelected(selected.filter(selectedItem => selectedItem !== item));
  }

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
    onSelectOption: handleSelectOption,
    itemMatchesFilter,
    items,
    selected,
    autoTargetFirstItem
  });

  return (
    <div>
      <div
        {...getSelectProps()}
        className={classnames(multiSelectStyles, { "border-blue-600": isOpen })}
      >
        {selected.map(item => (
          <SelectedItem
            key={item.id}
            onRemove={handleRemoveSelectedItem}
            item={item}
          />
        ))}
      </div>
      {isOpen && (
        <div
          className={classnames(listBoxContainerStyles, { hidden: !isOpen })}
        >
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
            {decoratedItems.map((decorated: DecoratedItem, index: number) => (
              <li
                {...getItemProps(decorated)}
                key={decorated.id || index}
                className={classnames(itemStyles, {
                  "bg-gray-200": isItemActive(decorated, state.context),
                  "bg-gray-400": isItemSelected(decorated, selected)
                })}
              >
                {decorated.item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FilterMultiSelect;
