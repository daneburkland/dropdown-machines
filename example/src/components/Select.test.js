import { Machine } from "xstate";
import React from "react";
import { render, fireEvent, wait, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { createModel } from "@xstate/test";
import Select from "./Select";

import items from "../items";

const selectMachine = Machine({
  id: "select",
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
        CLICK_TRIGGER: "closed",
        KEY_DOWN_SELECT_ESC: "closed"
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
        CLICK_TRIGGER: "open",
        KEY_DOWN_SELECT_SPACE: "open"
      }
    }
  }
});

describe("Select component", () => {
  const testModel = createModel(selectMachine).withEvents({
    KEY_DOWN_SELECT_SPACE: ({ getByTestId }) => {
      const selectElement = getByTestId("select");
      fireEvent.focus(selectElement);
      fireEvent.keyDown(selectElement, {
        key: "Space",
        keyCode: 32
      });
    },
    KEY_DOWN_SELECT_ESC: ({ getByTestId }) => {
      const selectElement = getByTestId("select");
      fireEvent.focus(selectElement);
      fireEvent.keyDown(selectElement, {
        key: "Escape",
        keyCode: 27
      });
    },
    CLICK_TRIGGER: ({ getByTestId }) => {
      const selectElement = getByTestId("select");
      fireEvent.click(selectElement);
    }
  });

  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach(plan => {
    describe(plan.description, () => {
      afterEach(cleanup);
      plan.paths.forEach(path => {
        it(path.description, () => {
          const rendered = render(<Select items={items} />);
          return path.test(rendered);
        });
      });
    });
  });

  it("coverage", () => {
    testModel.testCoverage();
  });
});

// Selects.forEach(({ description, getComponent }) => {
//   describe(description, () => {
//     test("opens and sets correct value with click", () => {
//       const { getByTestId, getAllByTestId, getByText, findByText } = render(
//         getComponent()
//       );

//       const selectElement = getByTestId("select");

//       fireEvent.click(selectElement);
//       const options = getAllByTestId("option");
//       expect(options).toHaveLength(items.length);

//       fireEvent.keyDown(selectElement, {
//         key: "ArrowDown",
//         keyCode: 40
//       });
//       fireEvent.keyDown(selectElement, {
//         key: "Enter",
//         keyCode: 13
//       });

//       expect(selectElement.textContent).toBe("first");
//     });

//     test("targets and selects correct value with keyboard(arrow keys)", () => {
//       const { getByTestId, getAllByTestId, getByText } = render(getComponent());

//       const selectElement = getByTestId("select");

//       fireEvent.focus(selectElement);
//       fireEvent.keyDown(selectElement, {
//         key: "Space",
//         keyCode: 32
//       });
//       const options = getAllByTestId("option");
//       expect(options).toHaveLength(items.length);

//       fireEvent.keyDown(selectElement, {
//         key: "ArrowDown",
//         keyCode: 40
//       });
//       fireEvent.keyDown(selectElement, {
//         key: "Enter",
//         keyCode: 13
//       });

//       expect(selectElement.textContent).toBe("first");
//     });

//     test("targets and selects correct value with keyboard(fuzzy find navigation)", () => {
//       const { getByTestId, getAllByTestId, getByText } = render(getComponent());

//       const selectElement = getByTestId("select");

//       fireEvent.click(selectElement);

//       fireEvent.keyDown(selectElement, {
//         key: "t",
//         keyCode: 84
//       });
//       fireEvent.keyDown(selectElement, {
//         key: "h",
//         keyCode: 72
//       });
//       fireEvent.keyDown(selectElement, {
//         key: "Enter",
//         keyCode: 13
//       });

//       expect(selectElement.textContent).toBe("third");
//     });

//     test("closes on `esc`", () => {
//       const {
//         getByTestId,
//         getAllByTestId,
//         queryAllByTestId,
//         queryByTestId
//       } = render(getComponent());

//       const selectElement = getByTestId("select");

//       fireEvent.click(selectElement);

//       const options = getAllByTestId("option");
//       expect(options).toHaveLength(items.length);

//       fireEvent.keyDown(selectElement, {
//         key: "Escape",
//         keyCode: 27
//       });

//       wait(() => {
//         expect(queryByTestId("listBox")).not.toBeVisible();
//       });
//     });

//     test("auto targets first option with autoTargetFirstItem", () => {
//       const { getByTestId, getAllByTestId, getByText } = render(
//         getComponent({ autoTargetFirstItem: true })
//       );

//       const selectElement = getByTestId("select");

//       fireEvent.click(selectElement);

//       fireEvent.keyDown(selectElement, {
//         key: "Enter",
//         keyCode: 13
//       });

//       expect(selectElement.textContent).toBe("first");
//     });
//   });
// });
