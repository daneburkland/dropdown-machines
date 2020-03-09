import React, { useState, MouseEvent } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import { itemStyles, listBoxStyles, listBoxContainerStyles } from "./Select";

export const closeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z" />
  </svg>
);

export const multiSelectStyles =
  "w-64 h-12 border border-gray-500 flex flex-wrap rounded-sm outline-none items-center p-2 focus:border-blue-600 cursor-pointer";

export const pillStyles =
  "flex items-center mr-2 border border-gray-500 rounded-md px-1";
export const pillCloseStyles =
  "h-3 w-3 fill-current text-blue-400 ml-2 hover:text-blue-600";

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
        {selected.map(item => (
          <SelectedItem
            key={item.id}
            onRemove={handleRemoveSelectedItem}
            item={item}
          />
        ))}
      </div>
      {isOpen && (
        <ul
          {...getListProps()}
          className={classnames(listBoxStyles, listBoxContainerStyles, {
            hidden: !isOpen
          })}
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
