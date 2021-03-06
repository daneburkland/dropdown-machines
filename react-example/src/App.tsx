import React from "react";
import Select from "./components/Select";
import MultiSelect from "./components/MultiSelect";
import FilterSelect from "./components/FilterSelect";
import FilterMultiSelect from "./components/FilterMultiSelect";
import Combobox from "./components/Combobox";
import ComboboxAutoSelect from "./components/ComboboxAutoSelect";
import ComboboxInlineAutoSelect from "./components/ComboboxInlineAutoSelect";
import items from "./items";

function App() {
  return (
    <div className="container mx-auto">
      <div className="m-4">
        <h3>Basic Select</h3>
        <div>
          <Select items={items} />
        </div>
      </div>
      <div className="m-4">
        <h3>Select; autoTargetFirstItem</h3>
        <div>
          <Select items={items} autoTargetFirstItem />
        </div>
      </div>
      <div className="m-4">
        <h3>Basic MultiSelect</h3>
        <div>
          <MultiSelect items={items} />
        </div>
      </div>
      <div className="m-4">
        <h3>Filtering select</h3>
        <div>
          <FilterSelect items={items} />
        </div>
      </div>
      <div className="m-4">
        <h3>Filtering select; autoTargetFirstItem</h3>
        <div>
          <FilterSelect items={items} autoTargetFirstItem />
        </div>
      </div>
      <div className="m-4">
        <h3>Filtering multi-select</h3>
        <div>
          <FilterMultiSelect items={items} />
        </div>
      </div>
      <div className="m-4">
        <h3>Filtering multi-select; autoTargetFirstItem</h3>
        <div>
          <FilterMultiSelect items={items} autoTargetFirstItem />
        </div>
      </div>
      <h3>Combobox</h3>
      <div className="m-4">
        <Combobox items={items} />
      </div>
      <h3>Combobox with auto select</h3>
      <div className="m-4">
        <ComboboxAutoSelect items={items} />
      </div>
      <h3>Combobox with inline auto select</h3>
      <div className="m-4">
        <ComboboxInlineAutoSelect items={items} />
      </div>
    </div>
  );
}

export default App;
