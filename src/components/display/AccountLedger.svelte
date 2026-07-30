<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { Account } from "../../types";
  import { onMount } from "svelte";

  let companyId = $state(0);
  let accounts: Account[] = $state([]);
  let selectedAccountId = $state(0);
  let fromDate = $state("");
  let toDate = $state("");
  let ledger: {
    date: string;
    voucherType: string;
    vchNo: string;
    narration: string;
    debit: number;
    credit: number;
    balance: number;
  }[] = $state([]);
  let loading = $state(false);
  let error = $state("");

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  onMount(async () => {
    await companyService.initialize();
    accounts = await mastersService.getAccounts(companyId);
    if (accounts.length) selectedAccountId = accounts[0].id;
  });

  const load = async () => {
    if (!selectedAccountId) return;
    loading = true;
    error = "";
    try {
      ledger = await voucherService.getAccountLedger(
        companyId,
        selectedAccountId,
        fromDate || undefined,
        toDate || undefined,
      );
    } catch (e) {
      error = e instanceof Error ? e.message : "Error";
    } finally {
      loading = false;
    }
  };

  const totalDebit = $derived(ledger.reduce((s, r) => s + r.debit, 0));
  const totalCredit = $derived(ledger.reduce((s, r) => s + r.credit, 0));
  const closingBalance = $derived(
    ledger.length ? ledger[ledger.length - 1].balance : 0,
  );
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Account Ledger</h1>
  <div class="flex gap-3 mb-6 items-end flex-wrap">
    <div>
      <label for="account-select" class="text-xs text-gray-400 block mb-1"
        >Account</label
      >
      <select
        id="account-select"
        bind:value={selectedAccountId}
        class="p-2 bg-neutral-800 border border-gray-600 rounded text-sm"
      >
        {#each accounts as a}<option value={a.id}>{a.name}</option>{/each}
      </select>
    </div>
    <div>
      <label for="from-date" class="text-xs text-gray-400 block mb-1"
        >From</label
      >
      <input
        id="from-date"
        type="date"
        bind:value={fromDate}
        class="p-2 bg-neutral-800 border border-gray-600 rounded text-sm"
      />
    </div>
    <div>
      <label for="to-date" class="text-xs text-gray-400 block mb-1">To</label>
      <input
        id="to-date"
        type="date"
        bind:value={toDate}
        class="p-2 bg-neutral-800 border border-gray-600 rounded text-sm"
      />
    </div>
    <button
      onclick={load}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
      >Show</button
    >
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">
      {error}
    </div>{/if}
  {#if loading}<p class="text-gray-400">Loading...</p>
  {:else if ledger.length === 0}
    <p class="text-gray-400 text-sm">
      No transactions found for selected criteria.
    </p>
  {:else}
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-neutral-700 border-b border-gray-600">
          <th class="text-left p-2">Date</th>
          <th class="text-left p-2">Type</th>
          <th class="text-left p-2">Vch No</th>
          <th class="text-left p-2">Narration</th>
          <th class="text-right p-2">Debit</th>
          <th class="text-right p-2">Credit</th>
          <th class="text-right p-2">Balance</th>
        </tr>
      </thead>
      <tbody>
        {#each ledger as row (row.vchNo + row.date)}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-2">{row.date}</td>
            <td class="p-2 text-gray-400 text-xs">{row.voucherType}</td>
            <td class="p-2">{row.vchNo}</td>
            <td class="p-2 text-gray-400 truncate max-w-xs"
              >{row.narration || "-"}</td
            >
            <td class="p-2 text-right"
              >{row.debit > 0 ? row.debit.toFixed(2) : "-"}</td
            >
            <td class="p-2 text-right"
              >{row.credit > 0 ? row.credit.toFixed(2) : "-"}</td
            >
            <td
              class="p-2 text-right font-medium {row.balance >= 0
                ? 'text-blue-300'
                : 'text-red-300'}">{row.balance.toFixed(2)}</td
            >
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="bg-neutral-700 font-bold border-t-2 border-gray-500">
          <td colspan="4" class="p-2">Totals / Closing Balance</td>
          <td class="p-2 text-right">{totalDebit.toFixed(2)}</td>
          <td class="p-2 text-right">{totalCredit.toFixed(2)}</td>
          <td
            class="p-2 text-right {closingBalance >= 0
              ? 'text-blue-300'
              : 'text-red-300'}">{closingBalance.toFixed(2)}</td
          >
        </tr>
      </tfoot>
    </table>
  {/if}
</div>
