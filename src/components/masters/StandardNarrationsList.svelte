<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { StandardNarration } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();
  const VOUCHER_TYPES = ["All", "Sales", "Purchase", "Payment", "Receipt", "Journal", "Contra",
    "Debit Note", "Credit Note", "Stock Transfer"];

  let narrations: StandardNarration[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);
  let formData = $state({ name: "", voucherType: "" });

  const load = async () => {
    loading = true; error = "";
    try {
      await companyService.initialize();
      narrations = await mastersService.getStandardNarrations(companyId);
    } catch (e) { error = e instanceof Error ? e.message : "Error"; }
    finally { loading = false; }
  };

  const handleSubmit = async () => {
    loading = true; error = "";
    try {
      await mastersService.createStandardNarration({
        companyId, name: formData.name,
        voucherType: formData.voucherType || null,
      });
      formData = { name: "", voucherType: "" };
      showForm = false;
      await load();
    } catch (e) { error = e instanceof Error ? e.message : "Error"; }
    finally { loading = false; }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this narration?")) return;
    await mastersService.deleteStandardNarration(id);
    await load();
  };

  onMount(load);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Standard Narrations</h1>
    <button onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
      {showForm ? "Cancel" : "New Narration"}
    </button>
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>{/if}
  {#if showForm}
    <div class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-lg">
      <h3 class="font-bold mb-4">Add Narration</h3>
      <div class="space-y-3">
        <Input name="name" label="Narration Text" type="text" bind:value={formData.name} required placeholder="e.g. Being goods sold" />
        <div>
          <label class="text-sm font-medium block mb-1">Voucher Type (optional – blank = all)</label>
          <select bind:value={formData.voucherType} class="w-full p-2 bg-neutral-700 border border-gray-500 rounded">
            {#each VOUCHER_TYPES as vt}
              <option value={vt === "All" ? "" : vt}>{vt}</option>
            {/each}
          </select>
        </div>
        <button onclick={handleSubmit} disabled={!formData.name || loading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded w-full">
          {loading ? "Saving..." : "Save Narration"}
        </button>
      </div>
    </div>
  {/if}
  {#if loading && !narrations.length}
    <p class="text-gray-400">Loading...</p>
  {:else if narrations.length === 0}
    <p class="text-gray-400 text-sm">No narrations yet.</p>
  {:else}
    <table class="w-full text-sm">
      <thead><tr class="border-b border-gray-600">
        <th class="text-left p-3">Narration Text</th>
        <th class="text-left p-3">Voucher Type</th>
        <th class="text-left p-3">Actions</th>
      </tr></thead>
      <tbody>
        {#each narrations as n (n.id)}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-3">{n.name}</td>
            <td class="p-3 text-gray-400">{n.voucherType || "All Types"}</td>
            <td class="p-3">
              <button onclick={() => handleDelete(n.id)}
                class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
