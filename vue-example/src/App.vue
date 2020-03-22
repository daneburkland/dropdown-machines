<template>
  <div id="app">
    <Select autoTargetFirstItem="false" v-bind:items="items" />
  </div>
</template>

<script lang="ts">
import Select from "./components/Select.vue";

export default {
  name: "App",
  components: {
    Select
  },
  data() {
    return {
      items: [
        {
          id: "1",
          name: "first"
        },
        {
          id: "2",
          name: "second"
        },
        {
          id: "3",
          name: "third"
        },
        {
          id: "4",
          name: "fourth"
        },
        {
          id: "5",
          name: "fifth"
        },
        {
          id: "6",
          name: "sixth"
        },
        {
          id: "7",
          name: "seventh"
        },
        {
          id: "8",
          name: "eight"
        },
        {
          id: "9",
          name: "nine"
        },
        {
          id: "10",
          name: "ten"
        },
        {
          id: "11",
          name: "eleven"
        }
      ]
    };
  }
};
</script>

<style>
</style>
