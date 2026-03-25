<script lang="ts">
  import TrialBalance from "./display/TrialBalance.svelte";
  import AccountLedger from "./display/AccountLedger.svelte";
  import StockStatus from "./display/StockStatus.svelte";

  type DisplayView = "TRIAL_BALANCE" | "ACCOUNT_LEDGER" | "STOCK_STATUS";
  let currentView: DisplayView = $state("TRIAL_BALANCE");

  const options: { label: string; view: DisplayView }[] = [
    { label: "Trial Balance", view: "TRIAL_BALANCE" },
    { label: "Account Ledger", view: "ACCOUNT_LEDGER" },
    { label: "Stock Status", view: "STOCK_STATUS" },
  ];
</script>

<div class="flex h-full">
  <div
    class="w-48 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto"
  >
    <h2
      class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4"
    >
      Reports
    </h2>
    <div class="space-y-0.5">
      {#each options as o}
        <button
          onclick={() => (currentView = o.view)}
          class="sidebar-item {currentView === o.view ? 'active' : ''}"
        >
          {o.label}
        </button>
      {/each}
    </div>
  </div>
  <div class="flex-1 overflow-auto">
    {#if currentView === "TRIAL_BALANCE"}<TrialBalance />{/if}
    {#if currentView === "ACCOUNT_LEDGER"}<AccountLedger />{/if}
    {#if currentView === "STOCK_STATUS"}<StockStatus />{/if}
  </div>
</div>
