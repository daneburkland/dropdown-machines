import React from "react";
import Select from "./components/Select";
import MultiSelect from "./components/MultiSelect";
import UncontrolledFilterStringUncontrolledFilteringSelect from "./components/UncontrolledFilterStringUncontrolledFilteringSelect";
import ControlledFilterStringUncontrolledFilteringSelect from "./components/ControlledFilterStringUncontrolledFilteringSelect";
import UncontrolledFilterStringControlledFilteringSelect from "./components/UncontrolledFilterStringControlledFilteringSelect";
import ControlledFilterStringControlledFilteringSelect from "./components/ControlledFilterStringControlledFilteringSelect";
import UncontrolledFilterStringUncontrolledFilteringMultiSelect from "./components/UncontrolledFilterStringUncontrolledFilteringMultiSelect";
import UncontrolledFilterStringControlledFilteringMultiSelect from "./components/UncontrolledFilterStringControlledFilteringMultiSelect";
import ControlledFilterStringControlledFilteringMultiSelect from "./components/ControlledFilterStringControlledFilteringMultiSelect";
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
      <h3>Select with autoTargetFirstItem</h3>
      <div className="m-4">
        <Select items={items} autoTargetFirstItem />
      </div>
      <h3>Basic MultiSelect</h3>
      <div className="m-4">
        <MultiSelect items={items} />
      </div>
      <h3>filtering select</h3>
      <div className="m-4">
        <UncontrolledFilterStringUncontrolledFilteringSelect items={items} />
      </div>
      {/* <h3>uncontrolled filtering select</h3>
      <div className="m-4">
        <ControlledFilterStringUncontrolledFilteringSelect items={items} />
      </div> */}
      {/* <h3>controlled filtering select</h3>
      <div className="m-4">
        <UncontrolledFilterStringControlledFilteringSelect items={items} />
      </div> */}
      {/* <h3>controlled filtering select</h3>
      <div className="m-4">
        <ControlledFilterStringControlledFilteringSelect items={items} />
      </div> */}
      <h3>filtering multi-select</h3>
      <div className="m-4">
        <UncontrolledFilterStringUncontrolledFilteringMultiSelect
          items={items}
        />
      </div>
      {/* <h3>controlled filtering multi-select</h3>
      <div className="m-4">
        <UncontrolledFilterStringControlledFilteringMultiSelect items={items} />
      </div> */}
      {/* <h3>controlled filtering multi-select</h3>
      <div className="m-4">
        <ControlledFilterStringControlledFilteringMultiSelect items={items} />
      </div> */}
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
