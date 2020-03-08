import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  FormEvent,
  useRef
} from "react";
import useList from "./useList";
import usePrevious from "./usePrevious";
import useHandleKeydown from "./useHandleKeydown";

export function isArray<T>(value: T | Array<T>): value is Array<T> {
  return Array.isArray(value);
}

type Item = any;

interface IUseCombobox<T> {
  items: Array<T>;
  value?: string;
  onUpdateValue?(value: string): void;
  onSelectOption?(item: T): void;
  itemMatchesFilter?(item: T, filterString: string): boolean;
  autoTargetFirstItem?: boolean;
  inlineAutoComplete?: boolean;
}

function useCombobox({
  items,
  itemMatchesFilter,
  value: controlledValue,
  onUpdateValue: onUpdateControlledValue,
  onSelectOption: onSelectControlledOption,
  autoTargetFirstItem,
  inlineAutoComplete
}: IUseCombobox<Item>) {
  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<string>("");
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [autoCompleteStem, setAutoCompleteStem] = useState("");
  const comboboxRef = useRef<HTMLInputElement>(null);

  // TODO: throw a warning if inlineAutoComplete and value are supplied
  const value = useMemo(() => controlledValue || uncontrolledValue, [
    controlledValue,
    uncontrolledValue
  ]);
  const prevValue = usePrevious(value) || "";
  const prevAutocompleteStem = usePrevious(autoCompleteStem) || "";

  const close = useCallback(() => {
    comboboxRef.current?.blur();
    setIsOpen(false);
    setActiveItem(null);
  }, [comboboxRef.current, setIsOpen, setActiveItem]);

  const handleSelectOption = useCallback(
    decoratedItem => {
      if (!!onSelectControlledOption) {
        onSelectControlledOption(decoratedItem.item);
      } else {
        setUncontrolledValue(defaultItemDisplayValue(decoratedItem));
      }
      close();
    },
    [onSelectControlledOption, setUncontrolledValue, close]
  );

  const {
    decoratedItems,
    getItemProps,
    getListProps,
    isItemActive,
    decrementActiveItem,
    incrementActiveItem,
    defaultItemDisplayValue,
    activeDecoratedItem
  } = useList({
    items,
    activeItem,
    setActiveItem,
    filterString: value,
    itemMatchesFilter,
    onSelectItem: handleSelectOption,
    autoTargetFirstItem: autoTargetFirstItem
  });

  const isFocused = useMemo(
    () => document.activeElement === comboboxRef.current,
    [document.activeElement, comboboxRef.current]
  );

  const hasMatches = useMemo(() => {
    return !!value && !!decoratedItems.length;
  }, [value, decoratedItems.length]);

  useEffect(() => {
    if (hasMatches && isFocused) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setActiveItem(null);
    }
  }, [hasMatches, value]);

  useEffect(() => {
    if (activeItem && inlineAutoComplete) {
      comboboxRef.current?.setSelectionRange(
        autoCompleteStem.length,
        value.length
      );
    }
  }, [value]);

  const handleKeydownTab = useCallback(() => {
    if (activeItem && autoTargetFirstItem) {
      handleSelectOption(activeDecoratedItem);
    }
  }, [activeDecoratedItem, autoTargetFirstItem, handleSelectOption]);

  const comboboxKeydownMap = useMemo(
    () => ({
      up: decrementActiveItem,
      down: incrementActiveItem,
      enter: () => handleSelectOption(activeDecoratedItem),
      tab: handleKeydownTab
    }),
    [
      decrementActiveItem,
      incrementActiveItem,
      activeDecoratedItem,
      handleSelectOption
    ]
  );

  const { handleKeyDown } = useHandleKeydown(comboboxKeydownMap);

  const didBackspace = useMemo(() => {
    return autoCompleteStem.length <= prevAutocompleteStem.length;
  }, [prevValue, value, autoCompleteStem]);

  useEffect(() => {
    if (activeItem && inlineAutoComplete && !!decoratedItems.length) {
      if (value === autoCompleteStem && didBackspace) {
        return;
      }
      const newAutoCompleteValue = defaultItemDisplayValue(decoratedItems[0]);
      setUncontrolledValue(newAutoCompleteValue);
    }
  }, [activeItem, value, didBackspace]);

  const handleChange = useCallback(
    (e: FormEvent) => {
      if (onUpdateControlledValue) {
        onUpdateControlledValue((<HTMLInputElement>e.target).value);
      } else {
        if (inlineAutoComplete) {
          setAutoCompleteStem((<HTMLInputElement>e.target).value);
        }
        setUncontrolledValue((<HTMLInputElement>e.target).value);
      }
    },
    [onUpdateControlledValue, setUncontrolledValue]
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
    decoratedItems,
    getItemProps,
    getListProps,
    getComboboxProps,
    isItemActive
  };
}

export default useCombobox;
