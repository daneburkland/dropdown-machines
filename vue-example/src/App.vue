<template>
  <div id="app" class="container mx-auto">
    <h3>Basic Select</h3>
    <div class="m-4">
      <Select v-bind:items="items" />
    </div>
    <h3>Basic MultiSelect</h3>
    <div class="m-4">
      <MultiSelect v-bind:items="items" />
    </div>
    <h3>Filtering Select</h3>
    <div class="m-4">
      <FilterSelect autoTargetFirstItem="false" v-bind:items="items" />
    </div>
  </div>
</template>

<script lang="ts">
import Select from "./components/Select.vue";
import FilterSelect from "./components/FilterSelect.vue";
import MultiSelect from "./components/MultiSelect.vue";

export default {
  name: "App",
  components: {
    Select,
    MultiSelect,
    FilterSelect
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

<style></style>
