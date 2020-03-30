<template>
  <div>
    <div
      :class="selectClasses"
      @keydown="handleKeydownSelect"
      @click="handleClickSelect"
      tabindex="0"
    >
      {{ !!state.selected ? state.selected.name : "" }}
    </div>
    <ul ref="listRef" :class="listClasses" v-show="isOpen()">
      <li
        v-for="decoratedItem in state.decoratedItems"
        ref="itemsRef"
        :key="decoratedItem.id"
        :class="getItemClasses(decoratedItem)"
        @mousemove="() => handleMousemoveItem(decoratedItem)"
        @click="() => handleClickItem(decoratedItem)"
      >
        {{ decoratedItem.item.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
export const selectStyles =
  "w-64 h-10 border border-gray-500 flex rounded-sm outline-none items-center p-2 focus:border-blue-600 cursor-pointer";
export const listBoxContainerStyles =
  "shadow-lg border border-gray-500 rounded-sm rounded-t-none outline-none absolute bg-white z-10 border-blue-600 cursor-pointer";
export const listBoxStyles = "w-64 h-48 overflow-y-auto cursor-pointer";
export const itemStyles = "px-2 py-1";
import { useMachine } from "@xstate/vue";
import {
  reactive,
  ref,
  onMounted,
  defineComponent
} from "@vue/composition-api";
import classnames from "classnames";
import {
  selectMachine,
  selectMachineEvents,
  selectMachineHelpers
} from "dropdown-machines";

const {
  CLICK_TRIGGER,
  CLICK_ITEM,
  SET_ACTIVE_ITEM,
  KEY_DOWN_SELECT,
  UPDATE_DECORATED_ITEMS,
  UPDATE_LIST_REF
} = selectMachineEvents;

const { isItemActive, isItemSelected } = selectMachineHelpers;

type Item = any;
type DecoratedItem = {
  item: Item;
  ref: HTMLLIElement | null;
};

interface IProps {
  items: Array<Item>;
}

interface IState {
  selected: Item | null;
  decoratedItems: Array<DecoratedItem>;
}

const Select = defineComponent({
  name: "Select",
  props: {
    items: Array
  },
  setup(props: IProps) {
    const itemsRef = ref(null);
    const state: IState = reactive({
      selected: null,
      decoratedItems: props.items.map((item: Item) => ({
        ref: null,
        item
      }))
    });

    const listRef = ref(null);

    function handleSelectOption(item: Item) {
      state.selected = item;
    }

    const { state: machineState, send } = useMachine(selectMachine, {
      context: {
        listRef,
        getElementFromRef: ref => ref,
        decoratedItems: state.decoratedItems,
        filteredDecoratedItems: state.decoratedItems,
        onSelectOption: handleSelectOption,
        selected: state.selected
      }
    });

    function getListClasses() {
      return `${listBoxContainerStyles} ${listBoxStyles}`;
    }

    onMounted(() => {
      // There may be a more Vue-y way to do this...but bc the refs get passed to the machine
      // before they get attached to DOM elements, we need to manually update them
      send({
        type: UPDATE_LIST_REF,
        listRef
      });

      const refs = itemsRef.value || [];
      const decoratedItemsWithRefs = state.decoratedItems.map(
        (item: Item, index: number) => ({ ...item, ref: refs && refs[index] })
      );

      state.decoratedItems = decoratedItemsWithRefs;
      send({
        type: UPDATE_DECORATED_ITEMS,
        decoratedItems: decoratedItemsWithRefs
      });
    });

    function handleKeydownSelect(e: KeyboardEvent) {
      send({ type: KEY_DOWN_SELECT, charCode: e.which });
    }

    function handleClickSelect() {
      send(CLICK_TRIGGER);
    }

    function handleClickItem({ item }: { item: Item }) {
      send({ type: CLICK_ITEM, item });
    }

    function handleMousemoveItem(decoratedItem: DecoratedItem) {
      send({ type: SET_ACTIVE_ITEM, decoratedItem });
    }

    function isOpen() {
      return machineState.value.value === "open";
    }

    function getItemClasses(decoratedItem: DecoratedItem) {
      const { context } = machineState.value;
      return classnames(itemStyles, {
        "bg-gray-200": isItemActive(decoratedItem, context),
        "bg-gray-400": isItemSelected(decoratedItem, state.selected)
      });
    }

    return {
      state,
      send,
      machineState,
      getListClasses,
      listRef,
      itemsRef,
      handleKeydownSelect,
      handleClickSelect,
      handleClickItem,
      handleMousemoveItem,
      isOpen,
      getItemClasses
    };
  },
  data: function() {
    return {
      selectClasses: selectStyles,
      listClasses: `${listBoxContainerStyles} ${listBoxStyles}`
    };
  }
});

export default Select;
</script>
