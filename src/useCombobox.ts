import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  FormEvent,
  useRef
} from "react";
import useList from "./useList";
import useHandleKeydown from "./useHandleKeydown";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

interface IUseCombobox<T> {
  items: Array<T>;
  value: string;
  onUpdateValue?(value: string): void;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  onSelectOption(item: T): any;
  autoSelect?: boolean;
}

function useCombobox({
  items,
  itemMatchesFilter,
  value,
  onUpdateValue,
  onSelectOption,
  autoSelect
}: IUseCombobox<object>) {
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLInputElement>(null);

  const handleSelectOption = useCallback(
    option => {
      onSelectOption(option);
      comboboxRef.current?.blur();
      setIsOpen(false);
    },
    [close, onSelectOption]
  );

  const {
    items: filteredItems,
    getItemProps,
    getListProps,
    isItemActive,
    decrementActiveItem,
    incrementActiveItem,
    activeItem
  } = useList({
    items,
    filterString: value,
    itemMatchesFilter,
    onSelectItem: handleSelectOption,
    autoActivateFirstResult: autoSelect
  });

  const isFocused = useMemo(
    () => document.activeElement === comboboxRef.current,
    [document.activeElement, comboboxRef.current]
  );

  const hasMatches = useMemo(() => {
    return !!value && !!filteredItems.length;
  }, [value, filteredItems.length]);

  useEffect(() => {
    if (hasMatches && isFocused) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [hasMatches, value]);

  const handleKeydownTab = useCallback(() => {
    if (activeItem && autoSelect) {
      handleSelectOption(activeItem);
    }
  }, [activeItem, autoSelect, handleSelectOption]);

  const comboboxKeydownMap = useMemo(
    () => ({
      up: decrementActiveItem,
      down: incrementActiveItem,
      enter: () => handleSelectOption(activeItem),
      tab: handleKeydownTab
    }),
    [decrementActiveItem, incrementActiveItem, activeItem, handleSelectOption]
  );

  const { handleKeyDown } = useHandleKeydown(comboboxKeydownMap);

  const handleChange = useCallback(
    (e: FormEvent) => {
      onUpdateValue && onUpdateValue((<HTMLInputElement>e.target).value);
    },
    [onUpdateValue]
  );

  function handleBlur() {
    setIsOpen(false);
  }

  const getComboboxProps = useCallback(() => {
    return {
      tabIndex: 0,
      ref: comboboxRef,
      onKeyDown: handleKeyDown,
      onChange: handleChange,
      onBlur: handleBlur,
      value
    };
  }, [handleKeyDown]);

  return {
    setIsOpen,
    isOpen,
    filteredItems,
    getItemProps,
    getListProps,
    getComboboxProps,
    isItemActive
  };
}

export default useCombobox;
