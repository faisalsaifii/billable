import { writable } from "svelte/store";
import type { Company } from "../../types";

export interface Session {
  companyId: number | null;
  companyName: string | null;
  username: string | null;
  company: Company | null;
}

const initialSession: Session = {
  companyId: null,
  companyName: null,
  username: null,
  company: null,
};

function createSessionStore() {
  const { subscribe, set, update } = writable<Session>(initialSession);

  return {
    subscribe,
    openCompany: (company: Company, username: string) =>
      update((session) => ({
        ...session,
        companyId: company.id,
        companyName: company.name,
        username,
        company,
      })),
    closeCompany: () => set(initialSession),
    reset: () => set(initialSession),
  };
}

export const session = createSessionStore();
