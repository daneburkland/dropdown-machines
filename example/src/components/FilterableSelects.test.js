import React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import UncontrolledFilterStringUncontrolledFilteringSelect from "./UncontrolledFilterStringUncontrolledFilteringSelect";
import ControlledFilterStringUncontrolledFilteringSelect from "./ControlledFilterStringUncontrolledFilteringSelect";
import UncontrolledFilterStringControlledFilteringSelect from "./UncontrolledFilterStringControlledFilteringSelect";
import ControlledFilterStringControlledFilteringSelect from "./ControlledFilterStringControlledFilteringSelect";

import items from "../items";

const Selects = [
  {
    description:
      "Basic Select with uncontrolled filterString and uncontrolled filtering",
    getComponent: props => (
      <UncontrolledFilterStringUncontrolledFilteringSelect
        items={items}
        {...props}
      />
    )
  },
  {
    description:
      "Select with controlled filterString and uncontrolled filtering",
    getComponent: props => (
      <ControlledFilterStringUncontrolledFilteringSelect
        items={items}
        {...props}
      />
    )
  },
  {
    description:
      "Select with uncontrolled filterString and controlled filtering",
    getComponent: props => (
      <UncontrolledFilterStringControlledFilteringSelect
        items={items}
        {...props}
      />
    )
  },
  {
    description: "Select with controlled filterString and controlled filtering",
    getComponent: props => (
      <ControlledFilterStringControlledFilteringSelect
        items={items}
        {...props}
      />
    )
  }
];

Selects.forEach(({ description, getComponent }) => {
  describe(description, () => {
    test("sets correct value with click", () => {
      const { getByTestId, getAllByTestId, getByText } = render(getComponent());

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);
      const options = getAllByTestId("option");
      expect(options).toHaveLength(items.length);

      fireEvent.keyDown(selectElement, {
        key: "ArrowDown",
        keyCode: 40
      });
      fireEvent.keyDown(selectElement, {
        key: "Enter",
        keyCode: 13
      });

      expect(selectElement.textContent).toBe("first");
    });

    test("targets and selects correct value with keyboard(arrow keys)", () => {
      const { getByTestId, getAllByTestId, getByText } = render(getComponent());

      const selectElement = getByTestId("select");

      fireEvent.focus(selectElement);
      fireEvent.keyDown(selectElement, {
        key: "Space",
        keyCode: 32
      });
      const options = getAllByTestId("option");
      expect(options).toHaveLength(items.length);

      fireEvent.keyDown(selectElement, {
        key: "ArrowDown",
        keyCode: 40
      });
      fireEvent.keyDown(selectElement, {
        key: "Enter",
        keyCode: 13
      });

      expect(selectElement.textContent).toBe("first");
    });

    test("filters and selects correct value with keyboard", () => {
      const { getByTestId, getAllByTestId, getByText } = render(getComponent());

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);

      fireEvent.keyDown(selectElement, {
        key: "t",
        keyCode: 84
      });
      fireEvent.keyDown(selectElement, {
        key: "h",
        keyCode: 72
      });
      fireEvent.keyDown(selectElement, {
        key: "Enter",
        keyCode: 13
      });

      expect(selectElement.textContent).toBe("third");
    });

    test("closes on `esc`", async () => {
      const {
        getByTestId,
        getAllByTestId,
        findByTestId,
        queryByTestId
      } = render(getComponent());

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);

      const options = getAllByTestId("option");
      expect(options).toHaveLength(items.length);

      const filterInput = getByTestId("filterInput");
      fireEvent.keyDown(filterInput, {
        key: "Escape",
        keyCode: 27
      });

      await wait(() => {
        expect(queryByTestId("filterInput")).not.toBeInTheDocument();
      });
    });

    test("auto targets first option with autoTargetFirstItem", () => {
      const { getByTestId, getAllByTestId, getByText } = render(
        getComponent({ autoTargetFirstItem: true })
      );

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);

      fireEvent.keyDown(selectElement, {
        key: "Enter",
        keyCode: 13
      });

      expect(selectElement.textContent).toBe("first");
    });
  });
});
