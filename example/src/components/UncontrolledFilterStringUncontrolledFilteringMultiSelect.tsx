import React, { useState } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import { itemMatchesFilter } from "./../utils";

type Item = {
  name: string;
  id: number;
};

interface ISelectedItemProps {
  item: Item;
  onRemove(item: Item): void;
}

function SelectedItem({ item, onRemove }: ISelectedItemProps) {
  return (
    <span className="mr-3">
      {item.name}
      <span onClick={() => onRemove(item)}>x</span>
    </span>
  );
}

interface IMultiSelectProps {
  items: Array<Item>;
}

function UncontrolledFilterStringUncontrolledFilteringMultiSelect({
  items
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
    decoratedItems,
    getItemProps,
    getListProps,
    getFilterInputProps,
    getSelectProps,
    getTriggerProps,
    isItemActive,
    isItemSelected
  } = useSelect({
    onSelectOption: handleSelectOption,
    itemMatchesFilter,
    items,
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
              key={item.id}
              onRemove={handleRemoveSelectedItem}
              item={item}
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

export default UncontrolledFilterStringUncontrolledFilteringMultiSelect;
