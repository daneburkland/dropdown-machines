import React, { useState, MouseEvent } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import { itemStyles } from "./Select";

export const multiSelectStyles =
  "w-64 h-12 border border-gray-500 flex rounded-sm outline-none items-center p-2 focus:border-blue-600 cursor-pointer";

export const listStyles =
  "w-64 shadow-lg h-48 border border-gray-500 outline-none absolute bg-white z-10 border-blue-600 overflow-y-auto cursor-pointer";

type Item = {
  name: string;
  id: string;
};

interface ISelectedItemProps {
  item: Item;
  onRemove(item: Item): any;
}

function SelectedItem({ item, onRemove }: ISelectedItemProps) {
  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    onRemove(item);
  }
  return (
    <span className="mr-2 border border-gray-500 rounded-lg px-2 text-xs">
      {item.name}
      <span onClick={handleClick}>x</span>
    </span>
  );
}

interface IMultiSelectProps {
  items: Array<Item>;
  autoTargetFirstItem?: boolean;
}

function MultiSelect({ items, autoTargetFirstItem }: IMultiSelectProps) {
  const [selected, setSelected] = useState<Array<Item>>([]);

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
    getSelectProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: handleSelectOption,
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
        <div className="flex flex-wrap">
          {selected.map(item => (
            <SelectedItem
              key={item.id}
              onRemove={handleRemoveSelectedItem}
              item={item}
            />
          ))}
        </div>
      </div>
      {isOpen && (
        <ul
          {...getListProps()}
          className={classnames(listStyles, { hidden: !isOpen })}
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
      )}
    </div>
  );
}

export default MultiSelect;
