import { writable } from "svelte/store";

export type View =
  | "CREATE_COMPANY"
  | "COMPANY_DETAILS"
  | "HOME"
  | "COMPANY_OPEN"
  | "CONFIGURATION"
  | "MASTERS"
  | "UTILITIES"
  | "TRANSACTIONS"
  | "DISPLAY"
  | "PRINTING"
  | "DATA_MANAGEMENT";

function createNavigationStore() {
  const { subscribe, set } = writable<View>("HOME");

  return {
    subscribe,
    navigateTo: (view: View) => set(view),
  };
}

export const navigation = createNavigationStore();
