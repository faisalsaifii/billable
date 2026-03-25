<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { Unit } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();

  let units: Unit[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);

  let formData = $state({
    name: "",
  });

  const loadUnits = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      units = await mastersService.getUnits(companyId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load units";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      await mastersService.createUnit({
        companyId,
        name: formData.name,
        formalName: null,
        description: null,
      });
      formData = { name: "" };
      showForm = false;
      await loadUnits();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create unit";
    } finally {
      loading = false;
    }
  };

  onMount(loadUnits);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Units of Measurement</h1>
    <button
      onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      {showForm ? "Cancel" : "New Unit"}
    </button>
  </div>

  {#if error}
    <div class="bg-red-900 text-red-100 p-4 rounded mb-4">{error}</div>
  {/if}

  {#if showForm}
    <div
      class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-md"
    >
      <h3 class="font-bold mb-4">Create Unit</h3>
      <div class="space-y-4">
        <Input
          name="name"
          label="Unit Name"
          type="text"
          bind:value={formData.name}
          placeholder="e.g., Pieces, kg, Liters"
          required
        />

        <button
          onclick={handleSubmit}
          disabled={!formData.name || loading}
          class="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create Unit"}
        </button>
      </div>
    </div>
  {/if}

  {#if loading && !showForm}
    <p class="text-gray-400">Loading units...</p>
  {:else if units.length === 0}
    <p class="text-gray-400">No units found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-600">
            <th class="text-left p-3">Name</th>
            <th class="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each units as unit (unit.id)}
            <tr class="border-b border-gray-700 hover:bg-neutral-800">
              <td class="p-3">{unit.name}</td>
              <td class="p-3">
                <button
                  class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
