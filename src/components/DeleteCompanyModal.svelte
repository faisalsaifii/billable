<script lang="ts">
  import { companyService } from "../lib/services/companyService";
  import type { Company } from "../types";
  import Input from "./Input.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let company: Company;

  let loading = false;
  let error = "";
  let step: "confirm" | "superuser" = "confirm";
  let superUserPassword = "";

  const handleConfirmDelete = async (event: Event) => {
    event.preventDefault();
    step = "superuser";
  };

  const handleDelete = async (event: Event) => {
    event.preventDefault();
    loading = true;
    error = "";

    try {
      if (!superUserPassword) {
        throw new Error("SuperUser password is required");
      }

      // Validate SuperUser
      const superUser = await companyService.getSuperUser(company.id);
      if (!superUser || superUser.passwordHash !== superUserPassword) {
        throw new Error("Invalid SuperUser password");
      }

      // Delete the company
      await companyService.deleteCompany(company.id);

      dispatch("deleted");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete company";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    dispatch("cancel");
  };
</script>

{#if step === "confirm"}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-neutral-900 border border-red-700/50 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
    >
      <h2 class="text-2xl font-bold text-red-400 mb-4">Delete Company</h2>
      <p class="text-neutral-300 mb-6">
        Are you sure you want to delete company <span class="font-bold"
          >{company.name}</span
        >?
      </p>
      <p class="text-red-400/80 text-sm mb-6">
        This action is <span class="font-bold">irreversible</span> and will delete
        all financial years and data.
      </p>

      <div class="flex gap-3">
        <button
          onclick={handleCancel}
          class="flex-1 p-2 border border-neutral-600 rounded-lg hover:bg-neutral-800 transition-colors duration-150 font-medium"
        >
          Cancel
        </button>
        <button
          onclick={handleConfirmDelete}
          class="flex-1 p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg font-semibold transition-colors duration-150"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
{:else if step === "superuser"}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-neutral-900 border border-red-700/50 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
    >
      <h2 class="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
      <p class="text-neutral-300 mb-6">
        Enter SuperUser password to confirm deletion of <span class="font-bold"
          >{company.name}</span
        >
      </p>

      {#if error}
        <div
          class="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4 text-sm border border-red-800/50"
        >
          {error}
        </div>
      {/if}

      <form onsubmit={handleDelete} class="space-y-4">
        <Input
          name="superUserPassword"
          label="SuperUser Password"
          type="password"
          bind:value={superUserPassword}
          required
          disabled={loading}
          placeholder="Enter password"
        />

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            onclick={() => (step = "confirm")}
            disabled={loading}
            class="flex-1 p-2 border border-neutral-600 rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-colors duration-150 font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            class="flex-1 p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg font-semibold disabled:opacity-50 transition-colors duration-150"
          >
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
