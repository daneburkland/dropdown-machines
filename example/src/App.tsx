import React from "react";
import Select from "./components/Select";
import UncontrolledFilterStringUncontrolledFilteringSelect from "./components/UncontrolledFilterStringUncontrolledFilteringSelect";
import ControlledFilterStringUncontrolledFilteringSelect from "./components/ControlledFilterStringUncontrolledFilteringSelect";
import UncontrolledFilterStringControlledFilteringSelect from "./components/UncontrolledFilterStringControlledFilteringSelect";
import MultiSelect from "./components/MultiSelect";
import Combobox from "./components/Combobox";
import ComboboxAutoSelect from "./components/ComboboxAutoSelect";
import ComboboxInlineAutoSelect from "./components/ComboboxInlineAutoSelect";
import items from "./items";

function App() {
  return (
    <div className="container mx-auto">
      <h3>Basic Select</h3>
      <div className="m-4">
        <Select items={items} />
      </div>
      <h3>Uncontrolled filterString; uncontrolled filtering select</h3>
      <div className="m-4">
        <UncontrolledFilterStringUncontrolledFilteringSelect items={items} />
      </div>
      <h3>Controlled filterString; uncontrolled filtering select</h3>
      <div className="m-4">
        <ControlledFilterStringUncontrolledFilteringSelect items={items} />
      </div>
      <h3>Uncontrolled filterString; controlled filtering select</h3>
      <div className="m-4">
        <UncontrolledFilterStringControlledFilteringSelect items={items} />
      </div>
      <h3>Filterable, Uncontrolled Multi-Select</h3>
      <div className="m-4">
        <MultiSelect items={items} />
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
