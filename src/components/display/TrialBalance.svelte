<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { companyService } from "../../lib/services/companyService";
  import { onMount } from "svelte";

  interface TrialRow {
    accountId: number;
    name: string;
    groupName: string;
    debit: number;
    credit: number;
  }
  let companyId = $state(0);
  let rows: TrialRow[] = $state([]);
  let loading = $state(false);
  let error = $state("");

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
      rows = await voucherService.getTrialBalance(companyId);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error";
    } finally {
      loading = false;
    }
  }

  const totalDebit = $derived(rows.reduce((s, r) => s + r.debit, 0));
  const totalCredit = $derived(rows.reduce((s, r) => s + r.credit, 0));

  let currentGroup = $state("");
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Trial Balance</h1>
    <button
      onclick={load}
      class="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 rounded text-sm"
      >Refresh</button
    >
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">
      {error}
    </div>{/if}
  {#if loading}<p class="text-gray-400">Loading...</p>
  {:else if rows.length === 0}
    <p class="text-gray-400 text-sm">No transactions recorded yet.</p>
  {:else}
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="bg-neutral-700 border-b border-gray-600">
          <th class="text-left p-2">Account</th>
          <th class="text-right p-2">Debit</th>
          <th class="text-right p-2">Credit</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.accountId)}
          {#if row.groupName !== currentGroup}
            {@const _ = currentGroup = row.groupName}
            <tr class="bg-neutral-800 border-t border-gray-600">
              <td
                colspan="3"
                class="p-2 text-xs font-bold text-gray-400 uppercase"
                >{row.groupName}</td
              >
            </tr>
          {/if}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-2 pl-6">{row.name}</td>
            <td class="p-2 text-right"
              >{row.debit > 0 ? row.debit.toFixed(2) : "-"}</td
            >
            <td class="p-2 text-right"
              >{row.credit > 0 ? row.credit.toFixed(2) : "-"}</td
            >
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="bg-neutral-700 font-bold border-t-2 border-gray-500">
          <td class="p-2">Total</td>
          <td class="p-2 text-right">{totalDebit.toFixed(2)}</td>
          <td class="p-2 text-right">{totalCredit.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  {/if}
</div>
