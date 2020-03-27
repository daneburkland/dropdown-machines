import React from "react";
import {
  render,
  fireEvent,
  wait,
  waitForDomChange
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import MultiSelect from "./MultiSelect";

import items from "../items";

const MultiSelects = [
  {
    description: "Basic MultiSelect",
    getComponent: props => <MultiSelect items={items} {...props} />
  }
];

MultiSelects.forEach(({ description, getComponent }) => {
  xdescribe(description, () => {
    test("opens and sets correct values with mouse", () => {
      const { getByTestId, getAllByTestId, getByLabelText, getByText } = render(
        getComponent()
      );

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);
      const options = getAllByTestId("option");
      expect(options).toHaveLength(items.length);

      const firstOption = getByText("first");
      fireEvent.click(firstOption);
      expect(selectElement.textContent).toContain("first");

      fireEvent.click(selectElement);
      const secondOption = getByText("second");
      fireEvent.click(secondOption);
      expect(selectElement.textContent).toContain("first");
      expect(selectElement.textContent).toContain("second");
    });

    test("targets and selects correct values with keyboard(arrow keys and fuzzy find)", () => {
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

      expect(selectElement.textContent).toContain("first");

      fireEvent.keyDown(selectElement, {
        key: "Space",
        keyCode: 32
      });
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

      expect(selectElement.textContent).toContain("first");
      expect(selectElement.textContent).toContain("third");
    });

    test("closes on `esc`", async () => {
      const { getByTestId, getAllByTestId, queryAllByTestId } = render(
        getComponent()
      );

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);

      const options = getAllByTestId("option");
      expect(options).toHaveLength(items.length);

      fireEvent.keyDown(selectElement, {
        key: "Escape",
        keyCode: 27
      });

      await wait(() => {
        expect(queryAllByTestId("option")).toHaveLength(0);
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

      expect(selectElement.textContent).toContain("first");
    });
  });
});
