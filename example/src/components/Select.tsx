import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";

interface ISelectedItemProps<T> {
  item: T;
  itemDisplayValue(item: T): string;
  onRemove(item: T): void;
}

function SelectedItem({
  item,
  itemDisplayValue,
  onRemove
}: ISelectedItemProps<object>) {
  return (
    <span className="mr-3">
      {itemDisplayValue(item)}
      <span onClick={() => onRemove(item)}>x</span>
    </span>
  );
}

type Item = {
  name: string;
};

interface IMultiSelectProps {
  items: Array<Item>;
  itemDisplayValue?(item: Item): string;
}

function MultiSelect({
  items,
  itemDisplayValue = item => item.name
}: IMultiSelectProps) {
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
    filteredItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: handleSelectOption,
    items,
    itemDisplayValue,
    selected
  });

  return (
    <div>
      <div
        {...getSelectProps()}
        className="max-w-sm border border-gray-500 flex"
      >
        <div className="flex-grow">
          {selected.map(item => (
            <SelectedItem
              key={item.name}
              onRemove={handleRemoveSelectedItem}
              item={item}
              itemDisplayValue={itemDisplayValue}
            />
          ))}
        </div>
        <span {...getTriggerProps()} className="w-2">
          v
        </span>
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
                {itemDisplayValue(item.item)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
