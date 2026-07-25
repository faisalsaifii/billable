<script lang="ts">
  import TrialBalance from "./display/TrialBalance.svelte";
  import AccountLedger from "./display/AccountLedger.svelte";
  import StockStatus from "./display/StockStatus.svelte";

  type DisplayView =
    | "TRIAL_BALANCE"
    | "ACCOUNT_LEDGER"
    | "STOCK_STATUS"
    | "BALANCE_SHEET"
    | "ACCOUNTS_MONTHLY_SUMMARY"
    | "ITEM_MONTHLY_SUMMARY"
    | "ITEM_LEDGER"
    | "VAT_SUMMARY";

  let { activeSubmenu = "Trial Balance" } = $props<{
    activeSubmenu?: string;
  }>();

  let currentView: DisplayView = $derived(
    activeSubmenu === "Trial Balance"
      ? "TRIAL_BALANCE"
      : activeSubmenu === "Account Ledger"
        ? "ACCOUNT_LEDGER"
        : activeSubmenu === "Stock Status"
          ? "STOCK_STATUS"
          : activeSubmenu === "Balance Sheet"
            ? "BALANCE_SHEET"
            : activeSubmenu === "Accounts Monthly Summary"
              ? "ACCOUNTS_MONTHLY_SUMMARY"
              : activeSubmenu === "Item Monthly Summary"
                ? "ITEM_MONTHLY_SUMMARY"
                : activeSubmenu === "Item Ledger"
                  ? "ITEM_LEDGER"
                  : activeSubmenu === "VAT Summary"
                    ? "VAT_SUMMARY"
                    : "TRIAL_BALANCE",
  );

  const options: { label: string; view: DisplayView }[] = [
    { label: "Trial Balance", view: "TRIAL_BALANCE" },
    { label: "Balance Sheet", view: "BALANCE_SHEET" },
    { label: "Account Ledger", view: "ACCOUNT_LEDGER" },
    { label: "Accounts Monthly Summary", view: "ACCOUNTS_MONTHLY_SUMMARY" },
    { label: "Stock Status", view: "STOCK_STATUS" },
    { label: "Item Ledger", view: "ITEM_LEDGER" },
    { label: "Item Monthly Summary", view: "ITEM_MONTHLY_SUMMARY" },
    { label: "VAT Summary", view: "VAT_SUMMARY" },
  ];
</script>

<div class="flex h-full">
  <div
    class="w-56 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto"
  >
    <h2
      class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4"
    >
      Reports
    </h2>
    <div class="space-y-0.5">
      {#each options as o}
        <button
          onclick={() => (activeSubmenu = o.label)}
          class="sidebar-item {currentView === o.view ? 'active' : ''}"
        >
          {o.label}
        </button>
      {/each}
    </div>
  </div>
  <div class="flex-1 overflow-auto">
    {#if currentView === "TRIAL_BALANCE"}
      <TrialBalance />
    {:else if currentView === "ACCOUNT_LEDGER"}
      <AccountLedger />
    {:else if currentView === "STOCK_STATUS"}
      <StockStatus />
    {:else if currentView === "BALANCE_SHEET"}
      <div class="p-8">
        <h1 class="text-2xl font-bold text-white mb-4">Balance Sheet</h1>
        <p class="text-neutral-500">Balance Sheet report coming soon...</p>
      </div>
    {:else if currentView === "ACCOUNTS_MONTHLY_SUMMARY"}
      <div class="p-8">
        <h1 class="text-2xl font-bold text-white mb-4">
          Accounts Monthly Summary
        </h1>
        <p class="text-neutral-500">
          Accounts Monthly Summary report coming soon...
        </p>
      </div>
    {:else if currentView === "ITEM_LEDGER"}
      <div class="p-8">
        <h1 class="text-2xl font-bold text-white mb-4">Item Ledger</h1>
        <p class="text-neutral-500">Item Ledger report coming soon...</p>
      </div>
    {:else if currentView === "ITEM_MONTHLY_SUMMARY"}
      <div class="p-8">
        <h1 class="text-2xl font-bold text-white mb-4">Item Monthly Summary</h1>
        <p class="text-neutral-500">
          Item Monthly Summary report coming soon...
        </p>
      </div>
    {:else if currentView === "VAT_SUMMARY"}
      <div class="p-8">
        <h1 class="text-2xl font-bold text-white mb-4">VAT Summary</h1>
        <p class="text-neutral-500">VAT Summary report coming soon...</p>
      </div>
    {/if}
  </div>
</div>
