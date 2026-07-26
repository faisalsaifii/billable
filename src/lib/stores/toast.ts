import { writable } from "svelte/store";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let nextId = 1;

  return {
    subscribe,
    show: (
      message: string,
      type: "success" | "error" | "info" = "info",
      duration = 3000,
    ) => {
      const id = nextId++;
      const toast: Toast = { id, message, type };

      update((toasts) => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    dismiss: (id: number) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    clear: () => {
      update(() => []);
    },
  };
}

export const toast = createToastStore();
