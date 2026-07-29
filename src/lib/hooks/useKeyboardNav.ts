/**
 * Keyboard navigation hook for lists and tables
 * Handles arrow keys, Enter, and Space for row selection/activation
 */

export interface KeyboardNavOptions {
  itemCount: number;
  onActivate?: (index: number) => void;
  onSelect?: (index: number) => void;
  orientation?: "vertical" | "horizontal" | "both";
}

export function createKeyboardNav(
  element: HTMLElement,
  options: KeyboardNavOptions,
) {
  let currentIndex = 0;

  function handleKeydown(e: KeyboardEvent) {
    const {
      itemCount,
      onActivate,
      onSelect,
      orientation = "vertical",
    } = options;

    if (itemCount === 0) return;

    let handled = false;

    switch (e.key) {
      case "ArrowDown":
        if (orientation === "vertical" || orientation === "both") {
          e.preventDefault();
          currentIndex = Math.min(currentIndex + 1, itemCount - 1);
          updateFocus(element, currentIndex);
          handled = true;
        }
        break;

      case "ArrowUp":
        if (orientation === "vertical" || orientation === "both") {
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, 0);
          updateFocus(element, currentIndex);
          handled = true;
        }
        break;

      case "ArrowRight":
        if (orientation === "horizontal" || orientation === "both") {
          e.preventDefault();
          currentIndex = Math.min(currentIndex + 1, itemCount - 1);
          updateFocus(element, currentIndex);
          handled = true;
        }
        break;

      case "ArrowLeft":
        if (orientation === "horizontal" || orientation === "both") {
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, 0);
          updateFocus(element, currentIndex);
          handled = true;
        }
        break;

      case "Home":
        e.preventDefault();
        currentIndex = 0;
        updateFocus(element, currentIndex);
        handled = true;
        break;

      case "End":
        e.preventDefault();
        currentIndex = itemCount - 1;
        updateFocus(element, currentIndex);
        handled = true;
        break;

      case "Enter":
        if (onActivate) {
          e.preventDefault();
          onActivate(currentIndex);
          handled = true;
        }
        break;

      case " ":
        if (onSelect) {
          e.preventDefault();
          onSelect(currentIndex);
          handled = true;
        }
        break;
    }

    return handled;
  }

  element.addEventListener("keydown", handleKeydown);

  return {
    destroy: () => {
      element.removeEventListener("keydown", handleKeydown);
    },
    setIndex: (index: number) => {
      currentIndex = Math.max(0, Math.min(index, options.itemCount - 1));
    },
  };
}

function updateFocus(container: HTMLElement, index: number) {
  const items = container.querySelectorAll("[data-keyboard-nav-item]");
  const item = items[index] as HTMLElement;

  if (item) {
    // Remove previous focus indicators
    items.forEach((i) => i.removeAttribute("data-keyboard-focused"));

    // Set current focus indicator
    item.setAttribute("data-keyboard-focused", "true");

    // Focus the item or its first focusable child
    const focusable = item.querySelector(
      "button, a, input, select, textarea",
    ) as HTMLElement;
    if (focusable) {
      focusable.focus();
    } else if (item.hasAttribute("tabindex")) {
      item.focus();
    }
  }
}
