<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { UnitConversion, Unit } from "../../types";
  import { onMount } from "svelte";

  let { companyId }: { companyId: number } = $props();
  let conversions: UnitConversion[] = $state([]);
  let units: Unit[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);
  let formData = $state({ fromUnitId: 0, toUnitId: 0, conversionFactor: 1 });

  const load = async () => {
    loading = true; error = "";
    try {
      await companyService.initialize();
      [conversions, units] = await Promise.all([
        mastersService.getUnitConversions(companyId),
        mastersService.getUnits(companyId),
      ]);
      if (units.length) { formData.fromUnitId = units[0].id; formData.toUnitId = units[0].id; }
    } catch (e) { error = e instanceof Error ? e.message : "Error"; }
    finally { loading = false; }
  };

  const handleSubmit = async () => {
    if (formData.fromUnitId === formData.toUnitId) { error = "From and To units must be different"; return; }
    if (formData.conversionFactor <= 0) { error = "Conversion factor must be > 0"; return; }
    loading = true; error = "";
    try {
      await mastersService.createUnitConversion({ companyId, ...formData });
      showForm = false;
      await load();
    } catch (e) { error = e instanceof Error ? e.message : "Error"; }
    finally { loading = false; }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this conversion?")) return;
    await mastersService.deleteUnitConversion(id);
    await load();
  };

  onMount(load);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Unit Conversions</h1>
    <button onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
      {showForm ? "Cancel" : "New Conversion"}
    </button>
  </div>
  {#if units.length === 0 && !loading}
    <div class="bg-yellow-900 text-yellow-200 p-3 rounded mb-4 text-sm">
      Create Units first before defining conversions.
    </div>
  {/if}
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>{/if}
  {#if showForm && units.length >= 2}
    <div class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-lg">
      <h3 class="font-bold mb-4">Add Conversion</h3>
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium block mb-1">Main Unit (from)</label>
          <select bind:value={formData.fromUnitId} class="w-full p-2 bg-neutral-700 border border-gray-500 rounded">
            {#each units as u}<option value={u.id}>{u.name}</option>{/each}
          </select>
        </div>
        <div>
          <label class="text-sm font-medium block mb-1">Sub Unit (to)</label>
          <select bind:value={formData.toUnitId} class="w-full p-2 bg-neutral-700 border border-gray-500 rounded">
            {#each units as u}<option value={u.id}>{u.name}</option>{/each}
          </select>
        </div>
        <div>
          <label class="text-sm font-medium block mb-1">Conversion Factor (1 main = ? sub)</label>
          <input type="number" bind:value={formData.conversionFactor} min="0.0001" step="0.01"
            class="w-full p-2 bg-neutral-700 border border-gray-500 rounded" />
        </div>
        <button onclick={handleSubmit} disabled={loading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded w-full">
          {loading ? "Saving..." : "Save Conversion"}
        </button>
      </div>
    </div>
  {/if}
  {#if conversions.length === 0 && !loading}
    <p class="text-gray-400 text-sm">No unit conversions defined yet.</p>
  {:else}
    <table class="w-full text-sm">
      <thead><tr class="border-b border-gray-600">
        <th class="text-left p-3">Main Unit</th>
        <th class="text-left p-3">Sub Unit</th>
        <th class="text-left p-3 text-right">Factor</th>
        <th class="text-left p-3">Actions</th>
      </tr></thead>
      <tbody>
        {#each conversions as c (c.id)}
          {@const fromUnit = units.find(u => u.id === c.fromUnitId)}
          {@const toUnit = units.find(u => u.id === c.toUnitId)}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-3">{fromUnit?.name || c.fromUnitId}</td>
            <td class="p-3">{toUnit?.name || c.toUnitId}</td>
            <td class="p-3 text-right">{c.conversionFactor}</td>
            <td class="p-3">
              <button onclick={() => handleDelete(c.id)}
                class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
