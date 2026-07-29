/**
 * Focus trap utility for modal dialogs
 * Traps keyboard focus within an element and handles Escape key
 */

export function createFocusTrap(element: HTMLElement, onEscape?: () => void) {
  const focusableElements = getFocusableElements(element);

  if (focusableElements.length === 0) {
    return { destroy: () => {} };
  }

  // Focus first element
  const firstElement = focusableElements[0] as HTMLElement;
  firstElement.focus();

  // Store the previously focused element to restore later
  const previouslyFocused = document.activeElement as HTMLElement;

  function handleKeydown(e: KeyboardEvent) {
    // Handle Escape key
    if (e.key === "Escape" && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }

    // Handle Tab key
    if (e.key === "Tab") {
      const focusableElements = getFocusableElements(element);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: move backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  element.addEventListener("keydown", handleKeydown);

  return {
    destroy: () => {
      element.removeEventListener("keydown", handleKeydown);
      // Restore focus to previously focused element
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    },
  };
}

function getFocusableElements(element: HTMLElement): Element[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(element.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"),
  );
}
