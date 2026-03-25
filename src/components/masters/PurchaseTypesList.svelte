<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { PurchaseType } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();
  let purchaseTypes: PurchaseType[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);
  let formData = $state({
    name: "", alias: "", region: "Local" as "Local" | "Central",
    taxationType: "Taxable" as PurchaseType["taxationType"],
    taxRate: 0, surchargeRate: 0,
  });

  const TAXATION_TYPES: PurchaseType["taxationType"][] = ["Taxable", "Exempt", "Tax Free", "Against ST Form", "Multi Tax", "Tax Paid"];

  const load = async () => {
    loading = true; error = "";
    try { await companyService.initialize(); purchaseTypes = await mastersService.getPurchaseTypes(companyId); }
    catch (e) { error = e instanceof Error ? e.message : "Error"; }
    finally { loading = false; }
  };

  const handleSubmit = async () => {
    loading = true; error = "";
    try {
      await mastersService.createPurchaseType({
        companyId, name: formData.name, alias: formData.alias || null,
        region: formData.region, taxationType: formData.taxationType,
        taxRate: formData.taxRate, surchargeRate: formData.surchargeRate, description: null,
      });
      formData = { name: "", alias: "", region: "Local", taxationType: "Taxable", taxRate: 0, surchargeRate: 0 };
      showForm = false; await load();
    } catch (e) { error = e instanceof Error ? e.message : "Error"; }
    finally { loading = false; }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this purchase type?")) return;
    await mastersService.deletePurchaseType(id); await load();
  };

  onMount(load);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Purchase Types</h1>
    <button onclick={() => (showForm = !showForm)} class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
      {showForm ? "Cancel" : "New Purchase Type"}
    </button>
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>{/if}
  {#if showForm}
    <div class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-lg">
      <div class="space-y-3">
        <Input name="name" label="Name" type="text" bind:value={formData.name} required />
        <Input name="alias" label="Alias (optional)" type="text" bind:value={formData.alias} />
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium block mb-1">Region</label>
            <select bind:value={formData.region} class="w-full p-2 bg-neutral-700 border border-gray-500 rounded">
              <option value="Local">Local</option><option value="Central">Central</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium block mb-1">Taxation Type</label>
            <select bind:value={formData.taxationType} class="w-full p-2 bg-neutral-700 border border-gray-500 rounded">
              {#each TAXATION_TYPES as t}<option value={t}>{t}</option>{/each}
            </select>
          </div>
        </div>
        {#if formData.taxationType === "Taxable" || formData.taxationType === "Multi Tax"}
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium block mb-1">Tax Rate %</label>
              <input type="number" bind:value={formData.taxRate} min="0" step="0.01"
                class="w-full p-2 bg-neutral-700 border border-gray-500 rounded" />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Surcharge Rate %</label>
              <input type="number" bind:value={formData.surchargeRate} min="0" step="0.01"
                class="w-full p-2 bg-neutral-700 border border-gray-500 rounded" />
            </div>
          </div>
        {/if}
        <button onclick={handleSubmit} disabled={!formData.name || loading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded w-full">
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  {/if}
  {#if purchaseTypes.length === 0 && !loading}
    <p class="text-gray-400 text-sm">No purchase types defined yet.</p>
  {:else}
    <table class="w-full text-sm">
      <thead><tr class="border-b border-gray-600">
        <th class="text-left p-3">Name</th>
        <th class="text-left p-3">Region</th>
        <th class="text-left p-3">Taxation</th>
        <th class="p-3 text-right">Tax%</th>
        <th class="p-3">Actions</th>
      </tr></thead>
      <tbody>
        {#each purchaseTypes as pt (pt.id)}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-3">{pt.name}</td>
            <td class="p-3 text-sm">{pt.region}</td>
            <td class="p-3 text-sm">{pt.taxationType}</td>
            <td class="p-3 text-sm text-right">{pt.taxRate}%</td>
            <td class="p-3"><button onclick={() => handleDelete(pt.id)}
              class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
