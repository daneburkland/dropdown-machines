import { Machine } from "xstate";
import React from "react";
import { render, fireEvent, wait, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { createModel } from "@xstate/test";
import Combobox from "./Combobox";

import items from "../items";

const comboboxMachine = Machine({
  id: "combobox",
  initial: "closed",
  states: {
    open: {
      meta: {
        test: ({ getAllByTestId }: any) => {
          const options = getAllByTestId("option");
          expect(options).toHaveLength(11);
        }
      },
      on: {
        KEY_DOWN_ESC: "closed",
        KEY_DOWN_TAB: "closed"
      }
    },
    closed: {
      meta: {
        test: ({ queryByTestId }: any) => {
          wait(() => {
            expect(queryByTestId("listBox")).not.toBeVisible();
          });
        }
      },
      on: {
        KEY_PRESS_COMBOBOX: "open"
      }
    }
  }
});

describe("Combobox component", () => {
  const testModel = createModel(comboboxMachine).withEvents({
    KEY_PRESS_COMBOBOX: ({ getByTestId }) => {
      const comboboxElement = getByTestId("combobox");
      fireEvent.focus(comboboxElement);
      fireEvent.keyDown(comboboxElement, {
        key: "Space",
        keyCode: 32
      });
    },
    KEY_DOWN_ESC: ({ getByTestId }) => {
      const comboboxElement = getByTestId("combobox");
      fireEvent.focus(comboboxElement);
      fireEvent.keyDown(comboboxElement, {
        key: "f",
        keyCode: 70
      });
    },
    KEY_DOWN_TAB: ({ getByTestId }) => {
      const comboboxElement = getByTestId("tab");
      fireEvent.focus(comboboxElement);
      fireEvent.keyDown(comboboxElement, {
        key: "tab",
        keyCode: 9
      });
    }
  });

  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach(plan => {
    describe(plan.description, () => {
      afterEach(cleanup);
      plan.paths.forEach(path => {
        it(path.description, () => {
          const rendered = render(<Combobox items={items} />);
          return path.test(rendered);
        });
      });
    });
  });

  it("coverage", () => {
    testModel.testCoverage();
  });
});
