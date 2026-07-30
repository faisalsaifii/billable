<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { companyService } from "../../lib/services/companyService";
  import { onMount } from "svelte";

  interface StockRow {
    itemId: number;
    name: string;
    groupName: string;
    inQty: number;
    outQty: number;
    closingQty: number;
  }
  let companyId = $state(0);
  let rows: StockRow[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let search = $state("");

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  onMount(load);

  async function load() {
    if (!companyId) return;
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      rows = await voucherService.getStockStatus(companyId);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error";
    } finally {
      loading = false;
    }
  }

  const filtered = $derived(
    search
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.groupName.toLowerCase().includes(search.toLowerCase()),
        )
      : rows,
  );
  let currentGroup = $state("");
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Stock Status</h1>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={search}
        placeholder="Search items..."
        class="p-2 bg-neutral-800 border border-gray-600 rounded text-sm w-48"
      />
      <button
        onclick={load}
        class="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 rounded text-sm"
        >Refresh</button
      >
    </div>
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">
      {error}
    </div>{/if}
  {#if loading}<p class="text-gray-400">Loading...</p>
  {:else if filtered.length === 0}
    <p class="text-gray-400 text-sm">No items found.</p>
  {:else}
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-neutral-700 border-b border-gray-600">
          <th class="text-left p-2">Item</th>
          <th class="text-right p-2">In (Purchase)</th>
          <th class="text-right p-2">Out (Sales)</th>
          <th class="text-right p-2">Closing Stock</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as row (row.itemId)}
          {#if row.groupName !== currentGroup}
            {@const _ = currentGroup = row.groupName}
            <tr class="bg-neutral-800 border-t border-gray-600">
              <td
                colspan="4"
                class="p-2 text-xs font-bold text-gray-400 uppercase"
                >{row.groupName}</td
              >
            </tr>
          {/if}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-2 pl-6">{row.name}</td>
            <td class="p-2 text-right text-green-400">{row.inQty.toFixed(2)}</td
            >
            <td class="p-2 text-right text-red-400">{row.outQty.toFixed(2)}</td>
            <td
              class="p-2 text-right font-medium {row.closingQty < 0
                ? 'text-red-300'
                : 'text-white'}">{row.closingQty.toFixed(2)}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
    <p class="text-xs text-gray-400 mt-2">{filtered.length} items</p>
  {/if}
</div>
