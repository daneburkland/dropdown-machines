import { KeyboardEvent } from "react";
import keycode from "keycode";

type KeydownMap = {
  [keycode: string]: Function;
};

function useHandleKeydown(keydownMap: KeydownMap) {
  function handleKeyDown(e: KeyboardEvent) {
    let definedHandler: any;
    definedHandler = keydownMap[keycode(e.which)];
    if (definedHandler) {
      definedHandler();
    } else if (keydownMap.default) {
      keydownMap.default(e);
    }
    e.preventDefault();
  }

  return { handleKeyDown };
}

export default useHandleKeydown;
