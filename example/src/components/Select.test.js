import React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Select from "./Select";

import items from "../items";

const Selects = [
  {
    description: "Basic Select",
    getComponent: props => <Select items={items} {...props} />
  }
];

Selects.forEach(({ description, getComponent }) => {
  describe(description, () => {
    test("opens and sets correct value with click", () => {
      const { getByTestId, getAllByTestId, getByText, findByText } = render(
        getComponent()
      );

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

    test("targets and selects correct value with keyboard(fuzzy find navigation)", () => {
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
        queryAllByTestId,
        queryByTestId
      } = render(getComponent());

      const selectElement = getByTestId("select");

      fireEvent.click(selectElement);

      const options = getAllByTestId("option");
      expect(options).toHaveLength(items.length);

      fireEvent.keyDown(selectElement, {
        key: "Escape",
        keyCode: 27
      });

      await wait(() => {
        expect(queryByTestId("listBox")).not.toBeVisible();
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
