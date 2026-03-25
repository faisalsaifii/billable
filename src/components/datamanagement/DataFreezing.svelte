<script lang="ts">
  import { companyService } from "../../lib/services/companyService";
  import { backupService } from "../../lib/services/backupService";
  import type { DataFreezeSettings } from "../../types";
  import { onMount } from "svelte";

  let { companyId }: { companyId: number } = $props();
  let freezeData = $state(false);
  let freezingDate = $state("");
  let freezeReason = $state("");
  let currentSettings: DataFreezeSettings | null = $state(null);
  let status = $state("");
  let loading = $state(false);

  onMount(async () => {
    await companyService.initialize();
    const settings = await backupService.getDataFreeze(companyId);
    if (settings) {
      currentSettings = settings;
      freezeData = settings.freezeData;
      freezingDate = settings.freezingDate || "";
      freezeReason = settings.freezeReason || "";
    } else {
      await backupService.createDataFreeze({
        companyId,
        freezeData: false,
        freezingDate: null,
        freezeReason: null,
      });
    }
  });

  const handleUpdate = async () => {
    loading = true; status = "";
    try {
      if (currentSettings) {
        await backupService.updateDataFreeze(companyId, {
          freezeData,
          freezingDate: freezingDate || null,
          freezeReason: freezeReason || null,
        });
        status = "Data freeze settings updated!";
      }
    } catch (e) { status = (e as Error).message; }
    finally { loading = false; }
  };
</script>

<div class="p-6 max-w-lg">
  <h1 class="text-2xl font-bold mb-4">Data Freezing</h1>
  <p class="text-gray-400 text-sm mb-6">Prevent modifications to masters and vouchers on or before the freeze date.</p>

  <div class="bg-neutral-800 border border-gray-600 rounded p-4 space-y-4">
    <label class="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" bind:checked={freezeData} />
      <span class="font-medium">Enable Data Freezing</span>
    </label>

    {#if freezeData}
      <div>
        <label class="block text-sm font-medium mb-2">Freeze Until Date</label>
        <input type="date" bind:value={freezingDate} required
          class="w-full p-2 bg-neutral-700 border border-gray-500 rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Reason (Optional)</label>
        <textarea bind:value={freezeReason} rows="3" placeholder="e.g., Financial year closure"
          class="w-full p-2 bg-neutral-700 border border-gray-500 rounded text-sm resize-none"></textarea>
      </div>
    {/if}

    <button onclick={handleUpdate} disabled={loading}
      class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded">
      {loading ? "Updating..." : "Update Settings"}
    </button>

    {#if status}
      <div class="bg-green-900 text-green-100 p-3 rounded text-sm">{status}</div>
    {/if}
  </div>

  {#if freezeData && freezingDate}
    <div class="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded text-sm text-yellow-100">
      Data is frozen until <strong>{freezingDate}</strong>. Modifications on or before this date are not allowed.
    </div>
  {/if}
</div>
