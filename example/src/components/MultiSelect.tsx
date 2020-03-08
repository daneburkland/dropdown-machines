import React, { useState, MouseEvent } from "react";
import classnames from "classnames";
import { useSelect } from "use-dropdown";

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
    <span className="mr-3">
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
        className="max-w-sm h-6 border border-gray-500 flex"
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
      </div>
      {isOpen && (
        <div className="flex flex-col max-w-sm shadow-lg h-48 border border-gray-500 outline-none">
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

export default MultiSelect;
