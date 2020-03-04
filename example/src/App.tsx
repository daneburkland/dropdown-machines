import React from "react";
import Select from "./components/Select";
import FilterableSelect from "./components/FilterableSelect";
import MultiSelect from "./components/MultiSelect";
import items from "./items";

function App() {
  return (
    <div className="container mx-auto">
      <div className="m-4">
        <Select items={items} />
      </div>
      <div className="m-4">
        <FilterableSelect items={items} />
      </div>
      <div className="m-4">
        <MultiSelect items={items} />
      </div>
    </div>
  );
}

export default App;
