<template>
  <span :class="pillClasses">
    <span class="text-xs">{{item.name}}</span>
    <span :class="pillCloseStyles" @click="handleClickClose">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path
          d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z"
        />
      </svg>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export const pillClasses =
  "flex items-center mr-2 border border-gray-500 rounded-md px-1";
export const pillCloseStyles =
  "h-3 w-3 fill-current text-blue-400 ml-2 hover:text-blue-600";

type Item = any;

interface IProps {
  item: Item;
  onRemove(item: Item): void;
}

const SelectedItem = defineComponent({
  name: "SelectedItem",
  props: {
    item: Object,
    onRemove: Function
  },
  setup({ item, onRemove }: IProps) {
    function handleClickClose(event: MouseEvent) {
      event.stopPropagation();
      onRemove(item);
    }
    return {
      handleClickClose
    };
  },
  data: function() {
    return {
      pillClasses,
      pillCloseStyles
    };
  }
});

export default SelectedItem;
</script>
