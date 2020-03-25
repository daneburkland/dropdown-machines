// import React, { useState } from "react";
// import classnames from "classnames";
// import { useCombobox, DecoratedItem } from "use-dropdown";
// import { itemMatchesFilter } from "./../utils";

// type Item = {
//   name: string;
//   id: string;
// };

// interface IComboboxProps {
//   items: Array<Item>;
// }

// function Combobox({ items }: IComboboxProps) {
//   const [value, setValue] = useState("");

//   function handleUpdateValue(value: string) {
//     setValue(value);
//   }

//   function handleSelectOption(item: any) {
//     setValue(item.name);
//   }

//   const {
//     isOpen,
//     decoratedItems,
//     getItemProps,
//     getListProps,
//     getComboboxProps,
//     isItemActive
//   } = useCombobox({
//     items,
//     value,
//     onUpdateValue: handleUpdateValue,
//     itemMatchesFilter,
//     onSelectOption: handleSelectOption
//   });

//   return (
//     <div>
//       <input
//         {...getComboboxProps()}
//         type="text"
//         className="max-w-sm border border-gray-500 flex"
//       />
//       {isOpen && (
//         <ul
//           {...getListProps()}
//           className="overflow-y-auto flex-grow outline-none max-w-sm shadow-lg h-48 border border-gray-500 outline-none relative"
//         >
//           {decoratedItems.map(
//             (decoratedItem: DecoratedItem<HTMLElement, Item>) => (
//               <li
//                 {...getItemProps(decoratedItem)}
//                 key={decoratedItem.item.id}
//                 className={classnames({
//                   "bg-gray-200": isItemActive(decoratedItem)
//                 })}
//               >
//                 {decoratedItem.item.name}
//               </li>
//             )
//           )}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default Combobox;
export {};
