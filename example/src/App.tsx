import React from "react";
import Select from "./components/Select";
import FilterableSelect from "./components/FilterableSelect";
import FilterableControlledSelect from "./components/FilterableControlledSelect";
import MultiSelect from "./components/MultiSelect";
import Combobox from "./components/Combobox";
import ComboboxAutoSelect from "./components/ComboboxAutoSelect";
import items from "./items";

function App() {
  return (
    <div className="container mx-auto">
      <h3>Basic Select</h3>
      <div className="m-4">
        <Select items={items} />
      </div>
      <h3>Filterable, Uncontrolled Select</h3>
      <div className="m-4">
        <FilterableSelect items={items} />
      </div>
      <h3>Filterable, Uncontrolled Multi-Select</h3>
      <div className="m-4">
        <MultiSelect items={items} />
      </div>
      <h3>Filterable, Controlled Select</h3>
      <div className="m-4">
        <FilterableControlledSelect items={items} />
      </div>
      <h3>Combobox</h3>
      <div className="m-4">
        <Combobox items={items} />
      </div>
      <h3>Combobox with auto select</h3>
      <div className="m-4">
        <ComboboxAutoSelect items={items} />
      </div>
    </div>
  );
}

export default App;
