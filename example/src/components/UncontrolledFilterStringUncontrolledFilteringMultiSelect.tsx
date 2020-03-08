import React, { useState, MouseEvent } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";
import { itemMatchesFilter } from "./../utils";

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
    <span className="mr-3">
      {item.name}
      <span onClick={handleClick}>x</span>
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
        className="max-w-sm h-6 border border-gray-500 flex"
      >
        <div className="flex-grow">
          {selected.map((item, index) => (
            <SelectedItem
              key={item.id || index}
              onRemove={handleRemoveSelectedItem}
              item={item}
            />
          ))}
        </div>
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
                  "bg-gray-200": isItemActive(item),
                  "bg-gray-400": isItemSelected(item)
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
