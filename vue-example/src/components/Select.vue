<template>
  <div>
    <div
      :class="selectClasses"
      @keydown="handleSelectKeyDown"
      @click="handleSelectClick"
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
        @mousemove="send({ type: 'SET_ACTIVE_ITEM', decoratedItem })"
        @click="send({ type: 'CLICK_ITEM', item: decoratedItem.item })"
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
import { reactive, ref, onUpdated } from "@vue/composition-api";
import classnames from "classnames";
import {
  selectMachine,
  CLICK_TRIGGER,
  CLICK_ITEM,
  UPDATE_FILTER,
  SET_ACTIVE_ITEM,
  UPDATE_SELECTED,
  KEY_DOWN_SELECT,
  KEY_DOWN_FILTER,
  UPDATE_DECORATED_ITEMS,
  UPDATE_LIST_ELEMENT,
  isItemActive,
  isItemSelected
} from "use-dropdown";

type Item = any;

export default {
  name: "Select",
  props: {
    items: Array
  },
  setup(props: any) {
    const itemsRef = ref(null);
    const state = reactive({
      selected: null,
      decoratedItems: props.items.map((item: any) => ({
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
        listElement: listRef.value as any,
        decoratedItems: state.decoratedItems,
        filteredDecoratedItems: state.decoratedItems,
        onSelectOption: handleSelectOption,
        selected: state.selected
      }
    });

    function getListClasses() {
      return `${listBoxContainerStyles} ${listBoxStyles}`;
    }

    onUpdated(() => {
      if (machineState.value.context.listElement !== listRef.value) {
        send({
          type: UPDATE_LIST_ELEMENT,
          listElement: listRef.value
        });
      }

      const refs = itemsRef?.value || [];
      const decoratedItemsWithRefs = state.decoratedItems.map(
        (item: any, index: number) => ({ ...item, ref: refs && refs[index] })
      );
      if (!machineState.value.context.decoratedItems[0].ref) {
        state.decoratedItems = decoratedItemsWithRefs;
        send({
          type: UPDATE_DECORATED_ITEMS,
          decoratedItems: decoratedItemsWithRefs
        });
      }
    });

    return {
      state,
      send,
      machineState,
      getListClasses,
      listRef,
      itemsRef
    };
  },
  data: function() {
    return {
      selectClasses: selectStyles,
      listClasses: `${listBoxContainerStyles} ${listBoxStyles}`
    };
  },
  methods: {
    handleSelectKeyDown: function(e: KeyboardEvent) {
      this.send({ type: KEY_DOWN_SELECT, e });
    },

    handleSelectClick: function() {
      this.send(CLICK_TRIGGER);
    },

    isOpen: function() {
      return this.machineState.value === "open";
    },

    getItemClasses: function(decoratedItem) {
      const { context } = this.machineState;
      return classnames(itemStyles, {
        "bg-gray-200": isItemActive(decoratedItem, context),
        "bg-gray-400": isItemSelected(decoratedItem, this.state.selected)
      });
    }
  }
};
</script>
